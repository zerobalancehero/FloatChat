import { PathLayer, ScatterplotLayer, PolygonLayer } from '@deck.gl/layers';
import { TileLayer, TripsLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';

export function renderMapLayers({ currentTime, depthFilter, mode, drawPoints, activeRegion, localDiscoveryData, globalTrajectories, globalDivePaths, globalAnomalies, globalBounds, globalCurrents }: any) {
  
  // ESRI World Imagery (No API Key Required!) mapped with a slight navy scientific tint
  const tileLayer = new TileLayer({
    id: 'base-map-tiles',
    data: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    minZoom: 0,
    maxZoom: 16,
    tileSize: 256,
    renderSubLayers: (props: any) => {
      const {
        bbox: {west, south, east, north}
      } = props.tile;

      return new BitmapLayer(props, {
        data: null,
        image: props.data,
        bounds: [west, south, east, north],
        tintColor: [160, 180, 210, 255]  // Subtly darkens the satellite imagery to fit the slate-navy UI while keeping physical earth colors explicitly visible
      });
    }
  });

  const regionBoundsLayer = new PolygonLayer({
    id: 'region-bounds',
    data: globalBounds.map((gb: any) => ({
      polygon: [
        [gb.bounds[0][0], gb.bounds[0][1]],
        [gb.bounds[1][0], gb.bounds[0][1]],
        [gb.bounds[1][0], gb.bounds[1][1]],
        [gb.bounds[0][0], gb.bounds[1][1]]
      ],
      regionId: gb.regionId
    })),
    getPolygon: (d: any) => d.polygon,
    getFillColor: (d: any) => d.regionId === activeRegion.id ? [6, 182, 212, 10] : [6, 182, 212, 2],
    getLineColor: (d: any) => d.regionId === activeRegion.id ? [6, 182, 212, 100] : [6, 182, 212, 20],
    lineWidthMinPixels: 1,
    stroked: true,
    filled: true,
  });

  const tripsLayer = new TripsLayer({
    id: 'trips-layer',
    data: globalTrajectories,
    getPath: (d: any) => d.path.map((p:any) => [p[0], p[1], p[2]]),
    getTimestamps: (d: any) => d.path.map((p: any) => p[3]),
    getColor: (d: any) => {
       const base = d.vendor === 0 ? [6, 182, 212] : [245, 158, 11];
       return d.regionId === activeRegion.id ? [...base, 255] : [...base, 80];
    },
    opacity: 0.8,
    widthMinPixels: 2,
    rounded: true,
    fadeTrail: true,
    trailLength: 60 * 24 * 60 * 60 * 1000, // 60 days in milliseconds
    currentTime: currentTime,
  });

  const filteredDepthPoints: any[] = [];
  if (activeRegion?.divePaths && depthFilter < -10) {
      activeRegion.divePaths.forEach((dive: any) => {
         let closest = null;
         let minDiff = 50; 
         dive.path.forEach((p: any) => {
             const diff = Math.abs(p[2] - depthFilter);
             if (diff < minDiff) { minDiff = diff; closest = p; }
         });
         if (closest) filteredDepthPoints.push(closest);
      });
  }

  const diveLayer = new ScatterplotLayer({
    id: 'depth-cloud-layer',
    data: filteredDepthPoints,
    getPosition: (d: any) => d,
    getFillColor: [6, 182, 212, 160],
    getRadius: 3000,
    radiusMinPixels: 2,
    radiusMaxPixels: 6,
    updateTriggers: {
       data: [depthFilter, activeRegion]
    }
  });

  const anomalyLayer = new ScatterplotLayer({
    id: 'anomaly-layer',
    data: mode === 'DARWIN' ? (localDiscoveryData?.anomaly || []) : globalAnomalies,
    getPosition: (d: any) => d.position,
    getFillColor: (d: any) => d.regionId && d.regionId !== activeRegion.id ? [217, 70, 239, 10] : d.color,
    getRadius: (d: any) => d.size,
    radiusUnits: 'pixels',
    radiusMinPixels: 3,
  });

  const radarLayer = new ScatterplotLayer({
    id: 'radar-layer',
    data: mode === 'DARWIN' ? (localDiscoveryData?.radarBase || []) : [],
    getPosition: (d: any) => d.position,
    getFillColor: [217, 70, 239, 50],
    getLineColor: [217, 70, 239, 255],
    stroked: true,
    lineWidthMinPixels: 2,
    getRadius: () => 50000 + (Math.sin(currentTime / 50) * 20000),
    radiusUnits: 'meters',
    updateTriggers: {
      getRadius: currentTime
    }
  });
  
  const radarCoreLayer = new ScatterplotLayer({
    id: 'radar-core-layer',
    data: mode === 'DARWIN' ? (localDiscoveryData?.radarBase || []) : [],
    getPosition: (d: any) => d.position,
    getFillColor: [217, 70, 239, 255],
    getRadius: 2000,
    radiusUnits: 'meters',
  });

  const lassoLayer = new PathLayer({
    id: 'lasso-layer',
    data: drawPoints && drawPoints.length > 0 ? [{ path: drawPoints }] : [],
    getPath: (d: any) => d.path,
    getColor: [217, 70, 239, 255],
    widthMinPixels: 3,
  });

  const currentsLayer = new PathLayer({
    id: 'ocean-currents-layer',
    data: globalCurrents,
    getPath: (d: any) => d.path,
    getColor: (d: any) => d.velocity > 1 ? [16, 185, 129, 200] : [122, 222, 128, 90], 
    widthMinPixels: 1,
    opacity: 0.4,
  });

  return [tileLayer, regionBoundsLayer, currentsLayer, tripsLayer, diveLayer, anomalyLayer, radarLayer, radarCoreLayer, lassoLayer];
}
