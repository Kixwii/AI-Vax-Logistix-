
import React from 'react';
import type { DistributionPlan } from '../types';
import { TruckIcon } from './icons/TruckIcon';

interface PlanPanelProps {
  plan: DistributionPlan | null;
  isLoading: boolean;
  error: string | null;
}

const PlanSkeleton: React.FC = () => (
    <div className="animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 rounded w-3/4"></div>
        <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
                <div key={i} className="p-4 border border-slate-200 rounded-lg space-y-3">
                    <div className="h-5 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                </div>
            ))}
        </div>
    </div>
);

export const PlanPanel: React.FC<PlanPanelProps> = ({ plan, isLoading, error }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg h-full">
      <h2 className="text-xl font-bold text-slate-700 mb-4 border-b pb-3">Distribution Plan</h2>
      <div className="h-[400px] lg:h-[calc(100%-4rem)] overflow-y-auto pr-2">
        {isLoading && <PlanSkeleton />}
        {error && (
          <div className="flex flex-col items-center justify-center h-full text-center">
             <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
          </div>
        )}
        {!isLoading && !error && !plan && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="font-semibold">No plan generated yet.</p>
            <p className="text-sm">Click "Generate Distribution Plan" to create a new schedule.</p>
          </div>
        )}
        {plan && (
          <div>
            <p className="text-sm text-slate-600 bg-blue-50 p-3 rounded-md mb-6">{plan.summary}</p>
            <div className="space-y-6">
              {plan.routes.map((route, index) => (
                <div key={index} className="bg-slate-50 border border-slate-200 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <TruckIcon />
                    <h3 className="text-lg font-bold text-slate-800">{route.vehicleId}</h3>
                  </div>
                  <p className="text-xs italic text-slate-500 mb-4">{route.routeRationale}</p>
                  <ol className="relative border-l border-slate-300 ml-2">
                    {route.stops.map((stop, stopIndex) => (
                      <li key={stopIndex} className="mb-6 ml-6">
                        <span className="absolute flex items-center justify-center w-5 h-5 bg-blue-200 rounded-full -left-2.5 ring-4 ring-white">
                          <span className="text-blue-800 text-xs font-bold">{stopIndex + 1}</span>
                        </span>
                        <h4 className="font-semibold text-slate-700">{stop.clinicName}</h4>
                        <time className="block mb-2 text-xs font-normal leading-none text-slate-400">ETA: {stop.estimatedArrivalTime}</time>
                        <div className="text-sm text-slate-600">
                            <p>COVID-19: <span className="font-medium text-blue-600">{stop.delivery.covid19} doses</span></p>
                            <p>Flu: <span className="font-medium text-green-600">{stop.delivery.flu} doses</span></p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
