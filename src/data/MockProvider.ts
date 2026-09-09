import { IFloatDataProvider } from './DataProvider';
import { RegionTheme } from './models';
import { REGIONS } from '../mockData';

export class MockProvider implements IFloatDataProvider {
    async getRegions(): Promise<Record<string, RegionTheme>> {
        // Simulate network-layer delay (200ms) representing standard REST fetch parsing overhead
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(REGIONS as any);
            }, 200);
        });
    }
}
