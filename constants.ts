
import type { Clinic, VaccineStock } from './types';

export const INITIAL_VACCINE_STOCKS: VaccineStock[] = [
  { vaccine: 'COVID-19', quantity: 10000 },
  { vaccine: 'Flu', quantity: 8000 },
];

export const MOCK_CLINICS: Clinic[] = [
  {
    id: 'C001',
    name: 'North Valley Clinic',
    address: '123 Health Rd, Northville',
    coords: { x: 20, y: 15 },
    currentStock: { covid19: 150, flu: 200 },
    weeklyDemand: { covid19: 400, flu: 300 },
  },
  {
    id: 'C002',
    name: 'Eastside Medical',
    address: '456 Wellness Ave, Easton',
    coords: { x: 80, y: 40 },
    currentStock: { covid19: 80, flu: 100 },
    weeklyDemand: { covid19: 350, flu: 250 },
  },
  {
    id: 'C003',
    name: 'Southpoint Urgent Care',
    address: '789 Cure Blvd, Southburg',
    coords: { x: 55, y: 85 },
    currentStock: { covid19: 250, flu: 300 },
    weeklyDemand: { covid19: 500, flu: 450 },
  },
  {
    id: 'C004',
    name: 'Westwood Primary',
    address: '101 Care Ln, West City',
    coords: { x: 10, y: 60 },
    currentStock: { covid19: 120, flu: 90 },
    weeklyDemand: { covid19: 300, flu: 200 },
  },
  {
    id: 'C005',
    name: 'Downtown Health Hub',
    address: '55 Central Plaza, Metro City',
    coords: { x: 48, y: 52 },
    currentStock: { covid19: 500, flu: 600 },
    weeklyDemand: { covid19: 800, flu: 700 },
  },
];
