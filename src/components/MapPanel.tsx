import React, { useEffect, useRef } from 'react';
import type { Clinic } from '@/types';

interface MapPanelProps {
  clinics: Clinic[];
}

export const MapPanel: React.FC<MapPanelProps> = ({ clinics }) => {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Central depot coordinates (you can adjust these)
  const depotCoords = { lat: 0.0, lng: 37.5 };

  // Convert clinic percentage coords to lat/lng if needed
  // Assuming clinics already have lat/lng in coords, otherwise we need to convert
  const getClinicLatLng = (clinic: Clinic) => {
    // If clinics have actual lat/lng:
    if (clinic.coords.lat !== undefined && clinic.coords.lng !== undefined) {
      return { lat: clinic.coords.lat, lng: clinic.coords.lng };
    }
    
    // Otherwise convert from percentage-based coords to lat/lng
    // This is a simple conversion - adjust the bounds as needed for your region
    const latRange = 5; // degrees of latitude visible
    const lngRange = 5; // degrees of longitude visible
    
    return {
      lat: depotCoords.lat + ((50 - clinic.coords.y) / 100) * latRange,
      lng: depotCoords.lng + ((clinic.coords.x - 50) / 100) * lngRange
    };
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Load Leaflet CSS and JS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => initMap();
    document.body.appendChild(script);

    const initMap = () => {
      const L = (window as any).L;
      if (!L) return;

      // Calculate bounds to fit all clinics
      const allLats = clinics.map(c => getClinicLatLng(c).lat);
      const allLngs = clinics.map(c => getClinicLatLng(c).lng);
      
      const centerLat = allLats.length > 0 
        ? (Math.min(...allLats) + Math.max(...allLats)) / 2 
        : depotCoords.lat;
      const centerLng = allLngs.length > 0 
        ? (Math.min(...allLngs) + Math.max(...allLngs)) / 2 
        : depotCoords.lng;

      const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], 8);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      mapRef.current = { map, L, markers: [] };
      updateMarkers();
    };

    return () => {
      if (mapRef.current?.map) {
        mapRef.current.map.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      updateMarkers();
    }
  }, [clinics]);

  const updateMarkers = () => {
    if (!mapRef.current) return;
    const { map, L, markers } = mapRef.current;

    // Clear existing markers
    markers.forEach((m: any) => map.removeLayer(m));
    markers.length = 0;

    // Add depot marker
    const depotIcon = L.divIcon({
      className: 'custom-depot-marker',
      html: `
        <div class="relative">
          <div class="w-12 h-12 bg-blue-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
            <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
          </div>
          <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
            Central Depot
          </div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 48]
    });

    const depotMarker = L.marker([depotCoords.lat, depotCoords.lng], {
      icon: depotIcon
    }).addTo(map).bindPopup('<b>Central Depot</b><br>Main vaccine distribution center');
    markers.push(depotMarker);

    // Add clinic markers
    clinics.forEach(clinic => {
      const coords = getClinicLatLng(clinic);
      
      // Determine urgency color
      const covid19Ratio = clinic.currentStock.covid19 / clinic.weeklyDemand.covid19;
      const fluRatio = clinic.currentStock.flu / clinic.weeklyDemand.flu;
      const minRatio = Math.min(covid19Ratio, fluRatio);
      
      let color = '#10b981'; // green - good
      if (minRatio < 0.5) color = '#ef4444'; // red - urgent
      else if (minRatio < 0.75) color = '#f59e0b'; // amber - warning
      
      const clinicIcon = L.divIcon({
        className: 'custom-clinic-marker',
        html: `
          <div class="relative">
            <div class="w-10 h-10 rounded-full border-4 border-white shadow-xl flex items-center justify-center animate-pulse" style="background-color: ${color}">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      });

      const popupContent = `
        <div class="p-2">
          <h3 class="font-bold text-sm mb-2">${clinic.name}</h3>
          <p class="text-xs text-gray-600 mb-2">${clinic.address}</p>
          <div class="text-xs space-y-1">
            <div class="flex justify-between">
              <span>COVID-19 Stock:</span>
              <span class="font-semibold">${clinic.currentStock.covid19} / ${clinic.weeklyDemand.covid19}</span>
            </div>
            <div class="flex justify-between">
              <span>Flu Stock:</span>
              <span class="font-semibold">${clinic.currentStock.flu} / ${clinic.weeklyDemand.flu}</span>
            </div>
            <div class="mt-2 pt-2 border-t">
              <span class="font-semibold ${minRatio < 0.5 ? 'text-red-600' : minRatio < 0.75 ? 'text-amber-600' : 'text-green-600'}">
                ${minRatio < 0.5 ? '⚠ Urgent' : minRatio < 0.75 ? '⚠ Low Stock' : '✓ Good'}
              </span>
            </div>
          </div>
        </div>
      `;

      const marker = L.marker([coords.lat, coords.lng], {
        icon: clinicIcon
      }).addTo(map).bindPopup(popupContent);
      markers.push(marker);
    });

    // Fit bounds to show all markers
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg h-full flex flex-col">
      <h2 className="text-xl font-bold text-slate-700 mb-4 border-b pb-3">Regional Map</h2>
      
      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-blue-600"></div>
          <span>Central Depot</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span>Good Stock</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-amber-500"></div>
          <span>Low Stock</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span>Urgent</span>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        className="flex-1 rounded-lg overflow-hidden shadow-inner border-2 border-slate-300"
        style={{ minHeight: '400px' }}
      ></div>
      
      <div className="mt-2 text-xs text-slate-500 text-center">
        Click markers for details • Map powered by OpenStreetMap
      </div>
    </div>
  );
};