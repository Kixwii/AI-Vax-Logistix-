
import React, { useState, useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { generateDistributionPlan } from './services/geminiService';
// FIX: Import `RoadCondition` to be used for typing.
import type { DistributionPlan, VaccineStock, Clinic, RoadCondition } from './types';
import { MOCK_CLINICS, INITIAL_VACCINE_STOCKS } from './constants';

const App: React.FC = () => {
  const [distributionPlan, setDistributionPlan] = useState<DistributionPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [vaccineStocks] = useState<VaccineStock[]>(INITIAL_VACCINE_STOCKS);
  const [clinics] = useState<Clinic[]>(MOCK_CLINICS);

  const handleGeneratePlan = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setDistributionPlan(null);

    // In a real app, this would be fetched from a live service.
    // FIX: Explicitly type `mockRoadConditions` as `RoadCondition[]` to match the expected type.
    const mockRoadConditions: RoadCondition[] = [
      { road: 'Highway 101', status: 'Clear', delayMinutes: 0 },
      { road: 'Route 5', status: 'Heavy Traffic', delayMinutes: 25 },
      { road: 'Oak Street Bridge', status: 'Closed', delayMinutes: -1 }, // -1 indicates impassable
    ];

    try {
      const plan = await generateDistributionPlan(clinics, vaccineStocks, mockRoadConditions);
      setDistributionPlan(plan);
    } catch (err) {
      console.error("Error generating plan:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred. Check the console for details.");
    } finally {
      setIsLoading(false);
    }
  }, [clinics, vaccineStocks]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-700 tracking-tight">Health Logistics Planner</h1>
            <div className="text-sm text-blue-600 font-semibold">AI-Powered Supply Chain</div>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Dashboard
          clinics={clinics}
          vaccineStocks={vaccineStocks}
          distributionPlan={distributionPlan}
          isLoading={isLoading}
          error={error}
          onGeneratePlan={handleGeneratePlan}
        />
      </main>
    </div>
  );
};

export default App;
