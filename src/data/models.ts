export type ArgoObservation = {
  id: number;
  cycle: number;
  depth: number;
  salinity: number;
  temp: number;
  density: number;
  classification: string;
  regionName: string;
  anomaly: string | null;
};

export type RegionTheme = {
   id: string;
   name: string;
   center: { longitude: number, latitude: number, zoom: number };
   trajectories: any[];
   divePaths: any[];
   anomaly: any[];
   radarBase: any[];
   tsData: ArgoObservation[];
   isopycnalsData: any[];
   depthProfileData: any[];
   mhwData: any[];
   thermoclinePoint: number;
   bounds: [[number, number], [number, number]];
};
