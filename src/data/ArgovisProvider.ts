import { IFloatDataProvider } from './DataProvider';
import { RegionTheme, ArgoObservation } from './models';
import { REGIONS } from '../mockData';

export class ArgovisProvider implements IFloatDataProvider {

    async getRegions(): Promise<Record<string, RegionTheme>> {
        const outRegions: Record<string, RegionTheme> = {};
        for (const key of Object.keys(REGIONS)) {
            const base = REGIONS[key];
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
        }
        return outRegions;
    }

    async fetchViewportData(bounds: [number, number, number, number], regionName: string): Promise<RegionTheme> {
        let [w, s, e, n] = bounds;

        // Coordinate Normalization handling endless map wrapping continuously panning beyond -180/180
        w = ((w + 180) % 360 + 360) % 360 - 180;
        e = ((e + 180) % 360 + 360) % 360 - 180;

        const polygonsToFetch: string[] = [];
        if (s < -90) s = -90;
        if (n > 90) n = 90;
        
        if (w > e) {
             polygonsToFetch.push(`[[-180,${s}],[${e},${s}],[${e},${n}],[-180,${n}],[-180,${s}]]`);
             polygonsToFetch.push(`[[${w},${s}],[180,${s}],[180,${n}],[${w},${n}],[${w},${s}]]`);
        } else {
             polygonsToFetch.push(`[[${w},${s}],[${e},${s}],[${e},${n}],[${w},${n}],[${w},${s}]]`);
        }
        
        return this.fetchPolygonsMulti(polygonsToFetch, regionName, { w, s, e, n });
    }
    
    async fetchSpatialPolygon(polygonGeoJSON: string, regionName: string): Promise<RegionTheme> {
        return this.fetchPolygonsMulti([polygonGeoJSON], regionName, null);
    }

    async getRegion(regionId: string): Promise<RegionTheme> {
        const base = REGIONS[regionId];
        const [[w, s], [e, n]] = base.bounds as [[number, number], [number, number]];
        return this.fetchViewportData([w, s, e, n], `${base.name}`);
    }

    private async fetchPolygonsMulti(polygons: string[], regionName: string, activeBounds: any = null): Promise<RegionTheme> {
        const outRegion: RegionTheme = {
                id: 'custom_viewport',
                name: `${regionName} [LIVE]`,
                center: { longitude: 0, latitude: 0, zoom: 0 },
                bounds: [[0, 0], [0, 0]],
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

        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            
            const fetchPromises = polygons.map(polygon => {
                const url = `http://localhost:3000/api/argovis/argo?polygon=${encodeURIComponent(polygon)}&startDate=${startDate.toISOString()}&endDate=${new Date().toISOString()}&data=all`;
                return fetch(url).then(res => res.ok ? res.json() : []);
            });
            
            if (activeBounds) {
               // Extract Open-Meteo Current Array Native Vectors precisely mapping to grid
               const gridPoints: {lat: number, lon: number}[] = [];
               const { w, s, e, n } = activeBounds;
               for (let i = 1; i <= 4; i++) {
                 for (let j = 1; j <= 4; j++) {
                    let clon = w + ((e < w ? e + 360 : e) - w) * (i / 5);
                    if (clon > 180) clon -= 360;
                    const clat = s + (n - s) * (j / 5);
                    gridPoints.push({ lat: clat, lon: clon });
                 }
               }
               const latStr = gridPoints.map(p => p.lat.toFixed(2)).join(',');
               const lonStr = gridPoints.map(p => p.lon.toFixed(2)).join(',');
               const meteoUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${latStr}&longitude=${lonStr}&hourly=ocean_current_velocity,ocean_current_direction`;
               fetchPromises.push(fetch(meteoUrl).then(res => res.ok ? res.json() : []));
            }
            
            const results = await Promise.all(fetchPromises);
            
            // Extract meteo dataset if present synchronously natively mapping endpoints
            let meteoData: any = null;
            if (activeBounds && results.length > polygons.length) {
                meteoData = results.pop();
            }
            const flatData = results.flat();
            
            // Map Open Meteo vectors explicitly isolated
            if (meteoData && Array.isArray(meteoData)) {
               meteoData.forEach((pointData: any, idx: number) => {
                  if (pointData.hourly && pointData.hourly.ocean_current_velocity && pointData.hourly.ocean_current_direction) {
                     const vel = pointData.hourly.ocean_current_velocity[0];
                     const dir = pointData.hourly.ocean_current_direction[0];
                     if (vel !== null && dir !== null) {
                         // Open-Meteo returns multiple points in matching array mapping logic gracefully
                         // We reconstruct coordinates from the original grid directly iteratively!
                         const w = activeBounds.w;
                         const e = activeBounds.e;
                         const s = activeBounds.s;
                         const n = activeBounds.n;
                         const gridI = Math.floor(idx / 4) + 1;
                         const gridJ = (idx % 4) + 1;
                         let cl = w + ((e < w ? e + 360 : e) - w) * (gridI / 5);
                         if (cl > 180) cl -= 360;
                         const ca = s + (n - s) * (gridJ / 5);
                         
                         const vScale = 0.5; // Roughly scale vector representation based on map physical arrays bounds (velocity * scale factor degrees)
                         const rad = dir * Math.PI / 180;
                         const dLat = Math.cos(rad) * vel * vScale;
                         const dLon = Math.sin(rad) * vel * vScale / Math.cos(ca * Math.PI / 180);
                         
                         outRegion.currentVectors.push({
                            path: [[cl, ca], [cl + dLon, ca + dLat]],
                            velocity: vel,
                            direction: dir
                         });
                     }
                  }
               });
            }
            
            if (flatData && flatData.length > 0) {
                const realTsData: ArgoObservation[] = [];
                const floatGroups: Record<string, any[]> = {};
                const depthProfileMap: Record<number, { sumTemp: number, count: number }> = {};
                
                flatData.forEach((profile: any) => {
                    const lon = profile.geolocation?.coordinates?.[0];
                    const lat = profile.geolocation?.coordinates?.[1];
                    if (lon === undefined || lat === undefined) return;
                    
                    const platformId = profile.platform_number || profile._id?.split('_')[0] || profile._id || 'unknown';
                    
                    if (!floatGroups[platformId]) floatGroups[platformId] = [];
                    floatGroups[platformId].push(profile);

                    const cols = profile.data_info ? profile.data_info[0] : [];
                    const pIdx = cols.indexOf('pressure');
                    const tIdx = cols.indexOf('temperature');
                    const sIdx = cols.indexOf('salinity');

                    if (profile.data && pIdx >= 0 && tIdx >= 0 && sIdx >= 0) {
                        const pArr = profile.data[pIdx];
                        const tArr = profile.data[tIdx];
                        const sArr = profile.data[sIdx];
                        const mLength = pArr.length;
                        const profileDivePath: number[][] = [];
                        let firstValidObs: any = null;

                        const profileObs: ArgoObservation[] = [];

                        for(let i=0; i<mLength; i++) {
                            const pres = pArr[i];
                            const temp = tArr[i];
                            const psal = sArr[i];

                            if (pres !== undefined && pres !== null && temp !== undefined && temp !== null && psal !== undefined && psal !== null) {
                                const isValid = Math.abs(temp) < 40 && Math.abs(psal) < 45 && pres >= 0 && Math.abs(pres) < 15000 && temp !== 99999 && psal !== 99999;
                                if (isValid) {
                                    profileDivePath.push([lon, lat, -pres]);
                                    const sig0 = (psal - 35) * 0.8 - (temp - 15) * 0.2 + 25; 
                                    profileObs.push({
                                        id: platformId as never as number,
                                        cycle: profile.cycle_number ?? null,
                                        depth: Math.round(pres),
                                        salinity: psal,
                                        temp: temp,
                                        density: sig0,
                                        classification: 'Live Observation',
                                        regionName: outRegion.name,
                                        anomaly: null
                                    });

                                    const depthBucket = Math.round(pres / 10) * 10;
                                    if(!depthProfileMap[depthBucket]) depthProfileMap[depthBucket] = { sumTemp: 0, count: 0 };
                                    depthProfileMap[depthBucket].sumTemp += temp;
                                    depthProfileMap[depthBucket].count += 1;
                                    if (!firstValidObs) firstValidObs = { pres, temp, psal };
                                }
                            }
                        }
                        if (profileObs.length > 0) {
                             if (!outRegion.profiles[platformId]) outRegion.profiles[platformId] = [];
                             outRegion.profiles[platformId] = outRegion.profiles[platformId].concat(profileObs);
                        }
                        
                        if (profileDivePath.length > 1) {
                             outRegion.divePaths.push({ path: profileDivePath, color: [6, 182, 212] });
                        }
                        if (firstValidObs) {
                             const sig0 = (firstValidObs.psal - 35) * 0.8 - (firstValidObs.temp - 15) * 0.2 + 25; 
                             realTsData.push({
                                id: profile._id,
                                cycle: profile.cycle_number ?? null,
                                depth: firstValidObs.pres,
                                salinity: firstValidObs.psal,
                                temp: firstValidObs.temp,
                                density: sig0,
                                classification: 'Live Observation',
                                regionName: outRegion.name,
                                anomaly: null
                            });
                        }
                    }
                });

                Object.values(floatGroups).forEach((profiles: any[]) => {
                    if (profiles.length >= 1) {
                        profiles.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                        const path = profiles.map(p => [p.geolocation.coordinates[0], p.geolocation.coordinates[1], 0, new Date(p.timestamp).getTime()]);
                        const floatId = profiles[0].platform_number || profiles[0]._id?.split('_')[0] || profiles[0]._id || 'unknown';
                        outRegion.trajectories.push({ id: floatId, vendor: 1, path });
                    }
                });

                Object.keys(depthProfileMap).map(Number).sort((a, b) => a - b).forEach(d => {
                    const meanTemp = depthProfileMap[d].sumTemp / depthProfileMap[d].count;
                    outRegion.depthProfileData.push({ depth: -d, temp: meanTemp });
                });

                if (outRegion.depthProfileData.length > 1) {
                    let maxGrad = -1;
                    let tPoint = 0;
                    for(let i=1; i<outRegion.depthProfileData.length; i++) {
                        const p0 = outRegion.depthProfileData[i-1];
                        const p1 = outRegion.depthProfileData[i];
                        if(p1.depth === p0.depth) continue;
                        const grad = Math.abs((p1.temp - p0.temp) / (p1.depth - p0.depth));
                        if (grad > maxGrad) { maxGrad = grad; tPoint = Math.abs(p1.depth); }
                    }
                    outRegion.thermoclinePoint = tPoint;
                }
                outRegion.tsData = realTsData;
            }
        } catch (err) {
            console.warn(`Network error hitting Argovis proxy. Returning empty structured layout.`, err);
        }
        return outRegion;
    }
}
