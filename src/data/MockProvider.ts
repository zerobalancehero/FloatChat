import { IFloatDataProvider } from './DataProvider';
import { RegionTheme } from './models';
import { REGIONS } from '../mockData';

export class MockProvider implements IFloatDataProvider {
    async getRegions(): Promise<Record<string, RegionTheme>> {
        // Simulate network-layer delay (200ms) representing standard REST fetch parsing overhead
        return new Promise(resolve => {
            const outRegions: Record<string, any> = {};
            Object.keys(REGIONS).forEach((key) => {
                const base = (REGIONS as any)[key];
                outRegions[key] = {
                    id: key,
                    name: base.name,
                    center: base.center,
                    bounds: base.bounds,
                    trajectories: [],
                    divePaths: [],
                    anomaly: [],
                    radarBase: [],
                    tsData: [],
                    isopycnalsData: [],
                    depthProfileData: [],
                    mhwData: [],
                    thermoclinePoint: -1,
                    currentVectors: [],
                    profiles: {}
                };
            });
            setTimeout(() => {
                resolve(outRegions);
            }, 200);
        });
    }

    async getRegion(regionId: string): Promise<RegionTheme> {
        return new Promise(resolve => setTimeout(() => resolve(REGIONS[regionId] as any), 200));
    }

    async fetchSpatialPolygon(polygonGeoJSON: string, regionName: string): Promise<RegionTheme> {
        return new Promise(resolve => setTimeout(() => resolve(REGIONS['kuroshio'] as any), 200));
    }

    async fetchViewportData(bounds: [number, number, number, number], regionName: string): Promise<RegionTheme> {
        return new Promise(resolve => setTimeout(() => resolve(REGIONS['kuroshio'] as any), 200));
    }
}
