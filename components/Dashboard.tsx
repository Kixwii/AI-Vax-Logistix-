
import React from 'react';
import type { DistributionPlan, VaccineStock, Clinic } from '../types';
import { ControlPanel } from './ControlPanel';
import { MapPanel } from './MapPanel';
import { PlanPanel } from './PlanPanel';

interface DashboardProps {
  clinics: Clinic[];
  vaccineStocks: VaccineStock[];
  distributionPlan: DistributionPlan | null;
  isLoading: boolean;
  error: string | null;
  onGeneratePlan: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  clinics,
  vaccineStocks,
  distributionPlan,
  isLoading,
  error,
  onGeneratePlan,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      {/* Left Column */}
      <div className="lg:col-span-3 space-y-6">
        <ControlPanel
          vaccineStocks={vaccineStocks}
          onGeneratePlan={onGeneratePlan}
          isLoading={isLoading}
        />
      </div>

      {/* Center Column */}
      <div className="lg:col-span-4">
        <MapPanel clinics={clinics} />
      </div>

      {/* Right Column */}
      <div className="lg:col-span-5">
        <PlanPanel
          plan={distributionPlan}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
};
