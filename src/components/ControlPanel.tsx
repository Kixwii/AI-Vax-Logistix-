
import React from 'react';
import type { VaccineStock } from '@/types';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface ControlPanelProps {
  vaccineStocks: VaccineStock[];
  onGeneratePlan: () => void;
  isLoading: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  vaccineStocks,
  onGeneratePlan,
  isLoading,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg h-full flex flex-col">
      <h2 className="text-xl font-bold text-slate-700 mb-4 border-b pb-3">Central Depot Inventory</h2>
      <div className="space-y-3 flex-grow">
        {vaccineStocks.map((stock) => (
          <div key={stock.vaccine} className="flex justify-between items-center bg-slate-50 p-3 rounded-md">
            <span className="font-semibold text-slate-600">{stock.vaccine}</span>
            <span className="font-mono text-blue-600 bg-blue-100 px-2 py-1 rounded">{stock.quantity.toLocaleString()}</span>
          </div>
        ))}
      </div>
      <button
        onClick={onGeneratePlan}
        disabled={isLoading}
        className="mt-6 w-full flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-300"
      >
        {isLoading ? (
          <>
            <SpinnerIcon />
            Generating Plan...
          </>
        ) : (
          'Generate Distribution Plan'
        )}
      </button>
    </div>
  );
};
