import { RegionTheme } from './models';

export interface IFloatDataProvider {
    /**
     * Bootstraps the application by returning the baseline domains.
     * Future Argovis integration will hit spatial bounding box endpoints to assemble these organically.
     */
    getRegions(): Promise<Record<string, RegionTheme>>;
    
    // Future Methods (Stubbed Architecture):
    // getObservations(polygonGeoJSON: any): Promise<ArgoObservation[]>;
    // getTrajectory(floatId: string): Promise<any>;
}
