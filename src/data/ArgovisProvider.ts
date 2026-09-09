import { IFloatDataProvider } from './DataProvider';
import { RegionTheme, ArgoObservation } from './models';
import { REGIONS } from '../mockData'; // Default fallback templates

export class ArgovisProvider implements IFloatDataProvider {

    async getRegions(): Promise<Record<string, RegionTheme>> {
        const outRegions: Record<string, RegionTheme> = {};

        // To prevent massive network overhead, we use Promise.all to fetch 10-day windows across all 5 bounds concurrently
        const fetchPromises = Object.keys(REGIONS).map(async (key) => {
            const baseRegion = { ...REGIONS[key] };
            outRegions[key] = baseRegion;

            try {
                // Convert [west, south], [east, north] to a full closed geojson polygon boundary
                const [[w, s], [e, n]] = baseRegion.bounds;
                const polygon = `[[${w},${s}],[${e},${s}],[${e},${n}],[${w},${n}],[${w},${s}]]`;
                
                // Fetch up-to-date data (e.g. past 30 days) from local proxy
                // Note: Argovis requires explicit startDate/endDate strings or it defaults to whole history which is massive. We'll simulate fetching 2023 data or last 30 days.
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 30);
                
                const url = `http://localhost:3000/api/argovis/argo?polygon=${encodeURIComponent(polygon)}&startDate=${startDate.toISOString()}&endDate=${new Date().toISOString()}`;
                
                const res = await fetch(url);
                if (!res.ok) {
                    console.warn(`Argovis proxy returned ${res.status} for ${key}. Falling back to mock data.`);
                    return; // Retains mocked trajectories / tsData naturally
                }
                const data = await res.json();
                
                // Normalization step: Argovis usually returns arrays of profiles [{ _id, timestamp, geolocation: { type: 'Point', coordinates: [lon, lat] }, measurements: [...] }]
                // We will map these into our native formats: `globalTrajectories` (nodes) and `tsData` (scatter coords).
                
                    if (data && data.length > 0) {
                    // Reset mock telemetry securely for the newly populated real data
                    baseRegion.name = `${baseRegion.name} [ARGOVIS_LIVE]`;
                    
                    const realTsData: ArgoObservation[] = [];
                    
                    data.slice(0, 100).forEach((profile: any, i: number) => {
                        const lon = profile.geolocation?.coordinates?.[0] || baseRegion.center.longitude;
                        const lat = profile.geolocation?.coordinates?.[1] || baseRegion.center.latitude;
                        
                        // Parse first valid measurement or fallback to null (never mock!)
                        const measurement = profile.measurements && profile.measurements.length > 0 
                            ? profile.measurements[0] 
                            : { temp: null, psal: null, pres: null };
                        
                        const temp = measurement.temp;
                        const sal = measurement.psal;
                        let sig0 = null;
                        
                        if (temp !== undefined && temp !== null && sal !== undefined && sal !== null) {
                             sig0 = (sal - 35) * 0.8 - (temp - 15) * 0.2 + 25; 
                        }
                        
                        realTsData.push({
                            id: profile._id || `unknown-${i}`,
                            cycle: profile.cycle_number ?? null,
                            depth: measurement.pres ?? null,
                            salinity: sal ?? null,
                            temp: temp ?? null,
                            density: sig0,
                            classification: 'Live Observation',
                            regionName: baseRegion.name,
                            anomaly: null
                        });
                    });
                    
                    // We DO NOT fabricate `trajectoryPath` connections between independent Argo profiles simply to render line layers.
                    // Instead, we retain the original Mock trajectories strictly as separated fallback UI visualizers,
                    // but the explicit T-S and Draw/Discover mechanics mapping onto point clouds run on true realTsData.
                    baseRegion.tsData = realTsData.filter(obs => obs.temp !== null && obs.salinity !== null);
                }

            } catch (err) {
                console.warn(`Network error hitting Argovis proxy for ${key}. Falling back to Mock data.`, err);
            }
        });

        await Promise.all(fetchPromises);
        return outRegions;
    }
}
