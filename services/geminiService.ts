
import { GoogleGenAI, Type } from "@google/genai";
import type { Clinic, DistributionPlan, RoadCondition, VaccineStock } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A brief summary of the distribution plan's strategy.",
    },
    routes: {
      type: Type.ARRAY,
      description: "An array of delivery routes for the vehicles.",
      items: {
        type: Type.OBJECT,
        properties: {
          vehicleId: {
            type: Type.STRING,
            description: "A unique identifier for the delivery vehicle, e.g., 'Truck-A'."
          },
          routeRationale: {
            type: Type.STRING,
            description: "A short explanation of why this route is efficient (e.g., geographic clustering, urgency)."
          },
          stops: {
            type: Type.ARRAY,
            description: "A sequence of clinic stops for this vehicle.",
            items: {
              type: Type.OBJECT,
              properties: {
                clinicId: { type: Type.STRING },
                clinicName: { type: Type.STRING },
                delivery: {
                  type: Type.OBJECT,
                  properties: {
                    covid19: { type: Type.INTEGER, description: "Number of COVID-19 vaccine doses to deliver." },
                    flu: { type: Type.INTEGER, description: "Number of Flu vaccine doses to deliver." }
                  },
                  required: ['covid19', 'flu']
                },
                estimatedArrivalTime: { 
                    type: Type.STRING,
                    description: "Estimated arrival time at the clinic, e.g., '10:30 AM'."
                }
              },
              required: ['clinicId', 'clinicName', 'delivery', 'estimatedArrivalTime']
            }
          }
        },
        required: ['vehicleId', 'routeRationale', 'stops']
      }
    }
  },
  required: ['summary', 'routes']
};

export async function generateDistributionPlan(
  clinics: Clinic[],
  depotStock: VaccineStock[],
  roadConditions: RoadCondition[]
): Promise<DistributionPlan> {
  const prompt = `
    You are a highly-skilled logistics and supply chain expert specializing in public health and vaccine distribution for a government health agency.

    Your task is to create an optimal daily distribution plan for COVID-19 and Flu vaccines from a central depot to several regional clinics. Your goal is to ensure clinics are restocked efficiently based on their needs, while considering road conditions and vehicle capacity.

    **Current Data:**

    **1. Central Depot Stock:**
    ${depotStock.map(s => `- ${s.vaccine}: ${s.quantity} doses`).join('\n')}
    
    **2. Clinic Status:**
    ${clinics.map(c => `
      - Clinic ID: ${c.id}
      - Name: ${c.name}
      - Address: ${c.address}
      - Current Stock (COVID-19/Flu): ${c.currentStock.covid19} / ${c.currentStock.flu}
      - Weekly Demand (COVID-19/Flu): ${c.weeklyDemand.covid19} / ${c.weeklyDemand.flu}
      - Urgency: A clinic is urgent if its current stock is less than 50% of its weekly demand for either vaccine.
    `).join('')}

    **3. Road Conditions:**
    ${roadConditions.map(r => `- ${r.road}: ${r.status}${r.delayMinutes > 0 ? ` (Est. Delay: ${r.delayMinutes} mins)` : ''}`).join('\n')}
    
    **Constraints and Objectives:**
    - Assume each delivery truck has a capacity of 2000 total vaccine doses.
    - Prioritize clinics with the lowest stock-to-demand ratio. These are the most urgent.
    - Group clinics geographically to create efficient routes.
    - Plan deliveries to bring each clinic's stock up to at least 100% of its weekly demand. Do not over-supply.
    - Avoid roads that are 'Closed'. Account for delays on roads with 'Heavy Traffic'.
    - Create a logical, multi-stop route for each vehicle to minimize travel time.
    - The number of vehicles should be based on the number of efficient routes needed. Start naming them 'Truck-A', 'Truck-B', etc.

    **Your Task:**
    Based on all the provided data, generate a distribution plan. Your response MUST be a JSON object that strictly adheres to the provided schema. The JSON should contain a summary of your plan and an array of routes.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    // FIX: The model returns the DistributionPlan object directly, not nested within a 'plan' key.
    const parsedPlan: DistributionPlan = JSON.parse(jsonText);
    
    if (!parsedPlan || !parsedPlan.routes) {
        throw new Error("Invalid plan structure received from API.");
    }
    
    return parsedPlan;
    
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate a distribution plan. The AI model may be temporarily unavailable.");
  }
}
