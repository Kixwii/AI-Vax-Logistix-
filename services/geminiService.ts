import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { Clinic, DistributionPlan, RoadCondition, VaccineStock } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    summary: {
      type: SchemaType.STRING,
      description: "A brief summary of the distribution plan's strategy.",
    },
    routes: {
      type: SchemaType.ARRAY,
      description: "An array of delivery routes for the vehicles.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          vehicleId: {
            type: SchemaType.STRING,
            description: "A unique identifier for the delivery vehicle, e.g., 'Truck-A'."
          },
          routeRationale: {
            type: SchemaType.STRING,
            description: "A short explanation of why this route is efficient (e.g., geographic clustering, urgency)."
          },
          stops: {
            type: SchemaType.ARRAY,
            description: "A sequence of clinic stops for this vehicle.",
            items: {
              type: SchemaType.OBJECT,
              properties: {
                clinicId: { type: SchemaType.STRING },
                clinicName: { type: SchemaType.STRING },
                delivery: {
                  type: SchemaType.OBJECT,
                  properties: {
                    covid19: { type: SchemaType.INTEGER, description: "Number of COVID-19 vaccine doses to deliver." },
                    flu: { type: SchemaType.INTEGER, description: "Number of Flu vaccine doses to deliver." }
                  },
                  required: ['covid19', 'flu']
                },
                estimatedArrivalTime: { 
                    type: SchemaType.STRING,
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
  
  // Check API key
  if (!apiKey) {
    throw new Error("API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.");
  }

  const prompt = `You are a highly-skilled logistics and supply chain expert specializing in public health and vaccine distribution for a government health agency.

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
Based on all the provided data, generate a distribution plan. Your response MUST be a JSON object that strictly adheres to the provided schema. The JSON should contain a summary of your plan and an array of routes.`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      }
    });

    const response = result.response;
    const jsonText = response.text();
    const parsedPlan: DistributionPlan = JSON.parse(jsonText);
    
    if (!parsedPlan || !parsedPlan.routes) {
      throw new Error("Invalid plan structure received from API.");
    }
    
    return parsedPlan;
    
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate distribution plan: ${error.message}`);
    }
    throw new Error("Failed to generate a distribution plan. The AI model may be temporarily unavailable.");
  }
}