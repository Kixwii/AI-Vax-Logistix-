
import React from 'react';
import type { Clinic } from '../types';
import { ClinicIcon } from './icons/ClinicIcon';
import { DepotIcon } from './icons/DepotIcon';

interface MapPanelProps {
  clinics: Clinic[];
}

export const MapPanel: React.FC<MapPanelProps> = ({ clinics }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg h-full">
      <h2 className="text-xl font-bold text-slate-700 mb-4 border-b pb-3">Regional Map</h2>
      <div className="relative aspect-square bg-slate-200 rounded-md overflow-hidden border-2 border-slate-300">
        <div className="absolute inset-0 bg-grid-slate-300/[0.2] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>

        {/* Depot */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
          style={{ top: '50%', left: '50%' }}
        >
          <DepotIcon />
          <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-slate-800 text-white text-xs rounded py-1 px-2 shadow-lg">
            Central Depot
          </div>
        </div>
        
        {/* Clinics */}
        {clinics.map(clinic => (
          <div 
            key={clinic.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{ top: `${clinic.coords.y}%`, left: `${clinic.coords.x}%` }}
          >
            <ClinicIcon />
            <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-slate-800 text-white text-xs rounded py-1 px-2 shadow-lg">
              {clinic.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
