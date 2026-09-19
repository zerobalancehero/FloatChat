import { RegionTheme } from './models';

export interface IFloatDataProvider {
    /**
     * Bootstraps the application by returning the baseline domains.
     * Future Argovis integration will hit spatial bounding box endpoints to assemble these organically.
     */
    getRegions(): Promise<Record<string, RegionTheme>>;
    getRegion(regionId: string): Promise<RegionTheme>;
    fetchSpatialPolygon(polygonGeoJSON: string, regionName: string): Promise<RegionTheme>;
    fetchViewportData(bounds: [number, number, number, number], regionName: string): Promise<RegionTheme>;
}
