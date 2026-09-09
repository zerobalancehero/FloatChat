import React, { useState, useEffect, useRef } from 'react';
import DeckGL from '@deck.gl/react';
import { _GlobeView as GlobeView, LightingEffect, AmbientLight, DirectionalLight, FlyToInterpolator } from '@deck.gl/core';
import { CONSTANTS } from './mockData';
import { DataService } from './data';
import { renderMapLayers } from './components/MapLayers';
import { TopNav, LeftDock, RightDock, BottomDock, DepthSlicer } from './components/CommandDocks';

// Provide lighting effect to resolve luma.gl v9 uniform block reflection crashes in GlobeView
const ambientLight = new AmbientLight({ color: [255, 255, 255], intensity: 1.0 });
const dirLight = new DirectionalLight({ color: [255, 255, 255], intensity: 1.0, direction: [-3, -4, -5] });
const lightingEffect = new LightingEffect({ ambientLight, dirLight });

const INITIAL_VIEW_STATE = {
  longitude: 142.0,
  latitude: 34.0,
  zoom: 3.5, 
  minZoom: 1.5,
  maxZoom: 6,
  pitch: 50,
  maxPitch: 75,
  bearing: 15
};

export function pointInPolygon(point: number[], vs: number[][]) {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function doLineSegmentsIntersect(p1: number[], p2: number[], p3: number[], p4: number[]) {
  const [x1, y1] = p1; const [x2, y2] = p2;
  const [x3, y3] = p3; const [x4, y4] = p4;

  const denominator = ((x2 - x1) * (y4 - y3)) - ((y2 - y1) * (x4 - x3));
  if (Math.abs(denominator) < 1e-9) return false;

  const a = y1 - y3;
  const b = x1 - x3;
  const numerator1 = ((x4 - x3) * a) - ((y4 - y3) * b);
  const numerator2 = ((x2 - x1) * a) - ((y2 - y1) * b);

  const aMatch = numerator1 / denominator;
  const bMatch = numerator2 / denominator;

  return (aMatch >= -1e-9 && aMatch <= 1 + 1e-9) && (bMatch >= -1e-9 && bMatch <= 1 + 1e-9);
}

export function segmentIntersectsPolygon(p1: number[], p2: number[], polygon: number[][]) {
  if (!polygon || polygon.length < 3) return false;
  for (let i = 0; i < polygon.length; i++) {
    const nextNode = i === polygon.length - 1 ? 0 : i + 1;
    const p3 = polygon[i];
    const p4 = polygon[nextNode];
    if (doLineSegmentsIntersect(p1, p2, p3, p4)) return true;
  }
  return false;
}

function App() {
  const [regionsData, setRegionsData] = useState<any>(null);
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  
  useEffect(() => {
    DataService.getRegions().then(data => setRegionsData(data));
  }, []);

  // App Shared State
  const [mode, setMode] = useState('EXECUTIVE'); // AGGREGATION, EXECUTIVE, DARWIN, DRAW
  const [depthFilter, setDepthFilter] = useState(-2000);
  const [currentTime, setCurrentTime] = useState(CONSTANTS.START_TIME);
  const [isPlaying, setIsPlaying] = useState(false);
  const [drawPoints, setDrawPoints] = useState<any[]>([]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [localDiscoveryData, setLocalDiscoveryData] = useState<any>(null);
  
  const [activeRegionId, setActiveRegionId] = useState('kuroshio');
  const activeRegion = regionsData ? regionsData[activeRegionId] : null;

  const [darwinResult, setDarwinResult] = useState<any>(null);
  const [isDarwinProcessing, setIsDarwinProcessing] = useState(false);

  const executeDarwinQuery = async (query: string) => {
    setIsDarwinProcessing(true);
    setMode('DARWIN_ANALYST');
    setDarwinResult(null);

    let targetRegionId = activeRegionId;
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('kuroshio')) targetRegionId = 'kuroshio';
    else if (lowerQuery.includes('gulf stream')) targetRegionId = 'gulf_stream';
    else if (lowerQuery.includes('agulhas')) targetRegionId = 'agulhas';
    else if (lowerQuery.includes('california')) targetRegionId = 'california';
    else if (lowerQuery.includes('southern ocean')) targetRegionId = 'southern_ocean';
    
    if (targetRegionId !== activeRegionId) {
       setActiveRegionId(targetRegionId);
    }

    await new Promise(r => setTimeout(r, 600)); // UI pacing simulation

    const regionData = regionsData[targetRegionId];
    if (!regionData || !regionData.tsData || regionData.tsData.length === 0) {
        setDarwinResult({ type: 'NO_DATA', query });
        setIsDarwinProcessing(false);
        return;
    }

    const ts = regionData.tsData;
    let sumT = 0, minT = 999, maxT = -999;
    let sumS = 0, minS = 999, maxS = -999;
    
    ts.forEach((obs: any) => {
        if(obs.temp !== null) {
            sumT += obs.temp;
            if (obs.temp < minT) minT = obs.temp;
            if (obs.temp > maxT) maxT = obs.temp;
        }
        if(obs.salinity !== null) {
            sumS += obs.salinity;
            if (obs.salinity < minS) minS = obs.salinity;
            if (obs.salinity > maxS) maxS = obs.salinity;
        }
    });

    const meanT = (ts.length > 0) ? (sumT / ts.length) : 0;
    const meanS = (ts.length > 0) ? (sumS / ts.length) : 0;

    let sumSqT = 0;
    ts.forEach((obs: any) => { if(obs.temp !== null) sumSqT += Math.pow(obs.temp - meanT, 2); });
    const stdDevT = (ts.length > 0) ? Math.sqrt(sumSqT / ts.length) : 0;

    const tempAnomalies = ts.filter((obs: any) => obs.temp !== null && Math.abs(obs.temp - meanT) > (stdDevT * 2));
    
    setDarwinResult({
        type: 'SUCCESS',
        query,
        observationCount: ts.length,
        profileCount: new Set(ts.map((o:any)=>o.cycle)).size,
        stats: { meanT, minT, maxT, meanS, minS, maxS, stdDevT },
        anomalies: tempAnomalies
    });
    setIsDarwinProcessing(false);
  };
  
  const animationRef = useRef<number>();
  const lastUpdateRef = useRef(Date.now());

  useEffect(() => {
    if (!activeRegion) return;
    setMode('EXECUTIVE');
    setDrawPoints([]);
    setLocalDiscoveryData(null);
    setViewState(vs => ({
      ...vs,
      longitude: activeRegion.center.longitude,
      latitude: activeRegion.center.latitude,
      zoom: activeRegion.center.zoom,
      transitionDuration: 3000,
      transitionInterpolator: new FlyToInterpolator()
    }));
  }, [activeRegionId, activeRegion]);

  useEffect(() => {
    const animate = () => {
      if (isPlaying) {
        const now = Date.now();
        const delta = (now - lastUpdateRef.current) * playbackSpeed * 0.02;
        setCurrentTime(t => (t + delta) % CONSTANTS.END_TIME);
        lastUpdateRef.current = now;
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (isPlaying) {
      lastUpdateRef.current = Date.now(); // reset on play
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  if (!regionsData || !activeRegion) {
    return (
      <div style={{ background: '#040711', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4', fontFamily: 'monospace' }}>
        INITIALIZING OCEANOGRAPHIC DATA LAYER...
      </div>
    );
  }

  const allRegionsList = Object.values(regionsData) as any[];
  
  const globalTrajectories = allRegionsList.flatMap((r: any) => 
    r.trajectories.map((traj: any) => ({ ...traj, regionId: r.id }))
  );
  const globalDivePaths = allRegionsList.flatMap((r: any) => 
    r.divePaths.map((path: any) => ({ ...path, regionId: r.id }))
  );
  const globalAnomalies = allRegionsList.flatMap((r: any) => 
    r.anomaly.map((a: any) => ({ ...a, regionId: r.id }))
  );
  const globalBounds = allRegionsList.map((r: any) => ({ bounds: r.bounds, regionId: r.id }));

  const layers = renderMapLayers({ 
    currentTime, 
    depthFilter, 
    mode, 
    drawPoints, 
    activeRegion, 
    localDiscoveryData,
    globalTrajectories,
    globalDivePaths,
    globalAnomalies,
    globalBounds
  });

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      
      {/* 4D WebGL Ocean Globe Canvas */}
      <DeckGL
        views={new GlobeView()}
        initialViewState={viewState}
        controller={{ dragRotate: mode !== 'DRAW', dragPan: mode !== 'DRAW', touchZoom: true, keyboard: true }}
        onViewStateChange={({ viewState }: any) => setViewState(viewState)}
        style={{ background: '#040711' }}
        layers={layers as any}
        effects={[lightingEffect]}
        getCursor={({isDragging}: any) => mode === 'DRAW' ? 'crosshair' : isDragging ? 'grabbing' : 'grab'}
        onDragStart={(info: any) => {
          if (mode === 'DRAW' && info.coordinate) {
            setDrawPoints([info.coordinate]);
          }
        }}
        onDrag={(info: any) => {
          if (mode === 'DRAW' && info.coordinate) {
            setDrawPoints(prev => [...prev, info.coordinate]);
          }
        }}
        onDragEnd={() => {
          if (mode === 'DRAW') {
            if (drawPoints.length < 3) {
              setMode('EXECUTIVE');
              setDrawPoints([]);
              return;
            }
            
            // Execute genuine localized query against global trajectory loops preserving geometric crossings
            const localSubsetTrajectories = globalTrajectories.map((traj: any) => {
               const pointsInsidePoly = [];
               for(let i=0; i<traj.path.length; i++) {
                  const p1 = traj.path[i];
                  const inside = pointInPolygon([p1[0], p1[1]], drawPoints);
                  if (inside) {
                     pointsInsidePoly.push(p1);
                     continue;
                  }
                  if (i > 0) {
                     const p0 = traj.path[i-1];
                     if(segmentIntersectsPolygon([p0[0], p0[1]], [p1[0], p1[1]], drawPoints)) {
                        pointsInsidePoly.push(p1);
                     }
                  }
               }
               if (pointsInsidePoly.length === 0) {
                  for(let i=1; i<traj.path.length; i++) {
                      const p0 = traj.path[i-1];
                      const p1 = traj.path[i];
                      if(segmentIntersectsPolygon([p0[0], p0[1]], [p1[0], p1[1]], drawPoints)) {
                          pointsInsidePoly.push(p0, p1);
                      }
                  }
               }
               return { ...traj, localPath: pointsInsidePoly };
            }).filter((traj: any) => traj.localPath.length > 0);
            
            if (localSubsetTrajectories.length === 0) {
               setMode('EMPTY_DISCOVERY');
               setLocalDiscoveryData(null);
               setDrawPoints([]);
            } else {
               // Mathematically extract the parent domain using hit rates
               const hitCounts = localSubsetTrajectories.reduce((acc: any, traj: any) => {
                  acc[traj.regionId] = (acc[traj.regionId] || 0) + 1;
                  return acc;
               }, {});
               const dominantRegionId = Object.keys(hitCounts).reduce((a, b) => hitCounts[a] > hitCounts[b] ? a : b);
               const hitRegion = regionsData[dominantRegionId];
               
               const localAnomalyPoints = hitRegion.anomaly.filter((a: any) => 
                 pointInPolygon([a.position[0], a.position[1]], drawPoints)
               );
               const hasAnomaly = localAnomalyPoints.length > 5;
               
               const cLon = drawPoints.reduce((acc, p) => acc + p[0], 0) / drawPoints.length;
               const cLat = drawPoints.reduce((acc, p) => acc + p[1], 0) / drawPoints.length;
               
               const localRadar = [{ position: [cLon, cLat, 0] }];
               
               const totalLocalObservations = localSubsetTrajectories.reduce((acc: number, traj: any) => acc + traj.localPath.length, 0);
               const totalRegionObservations = hitRegion.trajectories.reduce((acc: number, traj: any) => acc + traj.path.length, 0);
               
               const ratio = totalLocalObservations / totalRegionObservations;
               const tsCount = Math.max(5, Math.floor(hitRegion.tsData.length * ratio));
               
               setLocalDiscoveryData({
                 sourceRegion: hitRegion,
                 count: localSubsetTrajectories.length,
                 observationCount: totalLocalObservations,
                 anomaly: localAnomalyPoints,
                 hasAnomaly: hasAnomaly,
                 radarBase: localRadar,
                 centroid: [cLon, cLat],
                 tsData: hitRegion.tsData.slice(0, tsCount)
               });
               setMode('DARWIN');
               setDrawPoints([]);
            }
          }
        }}
      >
      </DeckGL>

      {/* Floating UI Overlay */}
      <div 
        style={{ 
          position: 'absolute', 
          inset: 0, 
          pointerEvents: 'none'
        }}
      >
        {/* Top Navigation */}
        <TopNav mode={mode} setMode={setMode} activeRegionId={activeRegionId} setActiveRegionId={setActiveRegionId} executeDarwinQuery={executeDarwinQuery} />

        {/* Left HUD Docks */}
        <DepthSlicer depthFilter={depthFilter} setDepthFilter={setDepthFilter} />
        <LeftDock mode={mode} activeRegion={activeRegion} localDiscoveryData={localDiscoveryData} darwinResult={darwinResult} isDarwinProcessing={isDarwinProcessing} />

        {/* Right Telemetry Dock */}
        <RightDock mode={mode} activeRegion={activeRegion} localDiscoveryData={localDiscoveryData} />

        {mode === 'EMPTY_DISCOVERY' && (
           <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(127, 29, 29, 0.8)', padding: '24px', borderRadius: '8px', border: '1px solid #ef4444', zIndex: 100, textAlign: 'center', pointerEvents: 'auto', backdropFilter: 'blur(10px)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fca5a5', marginBottom: '8px' }}>NO DATA AVAILABLE</div>
              <div style={{ fontSize: '14px', color: 'white', opacity: 0.9 }}>No oceanographic observations were found in the selected region.<br/>Try selecting another area or expanding the selection.</div>
              <button 
                 onClick={() => { setMode('EXECUTIVE'); setDrawPoints([]); }} 
                 style={{ marginTop: '16px', padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                 Clear Selection
              </button>
           </div>
        )}

        {/* Bottom Timeline */}
        <BottomDock 
          time={currentTime} 
          setTime={setCurrentTime} 
          isPlaying={isPlaying} 
          setIsPlaying={setIsPlaying}
          setPlaybackSpeed={setPlaybackSpeed}
        />
      </div>
    </div>
  );
}

export default App;
