
export interface Coordinates {
  x: number; // percentage for positioning
  y: number; // percentage for positioning
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  coords: Coordinates;
  currentStock: {
    covid19: number;
    flu: number;
  };
  weeklyDemand: {
    covid19: number;
    flu: number;
  };
}

export interface VaccineStock {
  vaccine: string;
  quantity: number;
}

export interface RoadCondition {
  road: string;
  status: 'Clear' | 'Heavy Traffic' | 'Closed';
  delayMinutes: number;
}

export interface Delivery {
  covid19: number;
  flu: number;
}

export interface RouteStop {
  clinicId: string;
  clinicName: string;
  delivery: Delivery;
  estimatedArrivalTime: string;
}

export interface Route {
  vehicleId: string;
  routeRationale: string;
  stops: RouteStop[];
}

export interface DistributionPlan {
  summary: string;
  routes: Route[];
}
