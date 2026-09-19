import React, { useState, useEffect, useRef } from 'react';
import DeckGL from '@deck.gl/react';
import { _GlobeView as GlobeView, LightingEffect, AmbientLight, DirectionalLight, FlyToInterpolator } from '@deck.gl/core';
import { CONSTANTS } from './mockData';
import { DataService } from './data';
import { renderMapLayers } from './components/MapLayers';
import { TopNav, LeftDock, RightDock, BottomDock, DepthSlicer, MapLegend } from './components/CommandDocks';

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
  const [viewportRegion, setViewportRegion] = useState<any>(null);
  const [viewportStatus, setViewportStatus] = useState('LOADING'); // LOADING, READY, EMPTY, ERROR

  // App Shared State
  const [mode, setMode] = useState('EXECUTIVE'); // AGGREGATION, EXECUTIVE, DARWIN, DRAW
  const [depthFilter, setDepthFilter] = useState(-2000);
  const [currentTime, setCurrentTime] = useState(CONSTANTS.START_TIME);
  const [isPlaying, setIsPlaying] = useState(false);
  const [drawPoints, setDrawPoints] = useState<any[]>([]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [localDiscoveryData, setLocalDiscoveryData] = useState<any>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  
  const [activeRegionId, setActiveRegionId] = useState('kuroshio');

  useEffect(() => {
    DataService.getRegions().then(data => setRegionsData(data));
  }, []);

  // Use Refs preventing race conditions across async boundaries natively
  const fetchCounter = useRef(0);
  const lastFetchedView = useRef({ longitude: -999, latitude: -999, zoom: -999 });

  useEffect(() => {
    const handler = setTimeout(() => {
        // Debounce threshold: Ignore micro-pans to prevent flashing the Sync state
        const dLon = Math.abs(viewState.longitude - lastFetchedView.current.longitude);
        const dLat = Math.abs(viewState.latitude - lastFetchedView.current.latitude);
        const dZoom = Math.abs(viewState.zoom - lastFetchedView.current.zoom);
        if (dLon < 2 && dLat < 2 && dZoom < 0.5) return;

        setViewportStatus('LOADING');
        const span = Math.min(30, 360 / Math.pow(2, Math.max(0, viewState.zoom - 1.2)));
        const hw = span / 2;
        let w = viewState.longitude - hw;
        let e = viewState.longitude + hw;
        let s = Math.max(-90, viewState.latitude - hw);
        let n = Math.min(90, viewState.latitude + hw);

        lastFetchedView.current = { longitude: viewState.longitude, latitude: viewState.latitude, zoom: viewState.zoom };

        fetchCounter.current += 1;
        const currentFetchId = fetchCounter.current;

        DataService.fetchViewportData([w, s, e, n], 'Current Viewport').then(res => {
            if (fetchCounter.current !== currentFetchId) return; // Ignore stale async resolutions safely
            if (!res.tsData || res.tsData.length === 0) {
                setViewportStatus('EMPTY');
            } else {
                setViewportStatus('READY');
            }
            setViewportRegion(res);
        }).catch(() => {
            if (fetchCounter.current === currentFetchId) setViewportStatus('ERROR');
        });

    }, 800);
    
    return () => clearTimeout(handler);
  }, [viewState.longitude, viewState.latitude, viewState.zoom]);

 

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

    const regionData = viewportRegion;
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
    if (!regionsData || !regionsData[activeRegionId]) return;
    const base = regionsData[activeRegionId];
    setMode('EXECUTIVE');
    setDrawPoints([]);
    setLocalDiscoveryData(null);
    setDarwinResult(null);
    setViewState(vs => ({
      ...vs,
      longitude: base.center.longitude,
      latitude: base.center.latitude,
      zoom: base.center.zoom,
      transitionDuration: 2000,
      transitionInterpolator: new FlyToInterpolator()
    }));
    setSelectedProfileId(null);
  }, [activeRegionId, regionsData]);

  useEffect(() => {
    const animate = () => {
      if (isPlaying) {
        const now = Date.now();
        const minT = viewportRegion?.trajectories?.length > 0 ? Math.min(...viewportRegion.trajectories.map((t:any) => t.path.length > 0 ? t.path[0][3] : 0)) : CONSTANTS.START_TIME;
        const maxT = viewportRegion?.trajectories?.length > 0 ? Math.max(...viewportRegion.trajectories.map((t:any) => t.path.length > 0 ? t.path[t.path.length-1][3] : 1000)) : CONSTANTS.END_TIME;
        const span = maxT - minT;
        // Move at exactly `playbackSpeed` percentage per frame scaling logically across unix time
        const step = (span > 0 ? span : 1000) * 0.001 * playbackSpeed;
        setCurrentTime(t => {
            if (t < minT || t > maxT + step * 2) {
                return minT;
            }
            let nt = t + step;
            if (nt > maxT) nt = minT;
            return nt;
        });
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
  }, [isPlaying, playbackSpeed, viewportRegion?.trajectories?.length]);

  if (!viewportRegion) {
    return (
      <div style={{ background: '#040711', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4', fontFamily: 'monospace' }}>
        LOADING INITIAL SPATIAL VIEWPORT DATA...
      </div>
    );
  }

  const activeRegion = viewportRegion;
  const globalTrajectories = viewportRegion.trajectories.map((traj: any) => ({ ...traj, regionId: viewportRegion.id }));
  const globalDivePaths = viewportRegion.divePaths.map((path: any) => ({ ...path, regionId: viewportRegion.id }));
  const globalAnomalies = viewportRegion.anomaly.map((a: any) => ({ ...a, regionId: viewportRegion.id }));
  const globalCurrents = viewportRegion.currentVectors ? viewportRegion.currentVectors.map((v: any) => ({ ...v, regionId: viewportRegion.id })) : [];
  // Display borders for ALL initialized regions purely as presets securely without needing telemetry
  const globalBounds = regionsData ? Object.values(regionsData).map((r: any) => ({ bounds: r.bounds, regionId: r.id })) : [];

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
    globalBounds,
    globalCurrents,
    selectedProfileId,
    setSelectedProfileId
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
            
            // Execute genuine localized spatial query against Argovis bypassing generic datasets inherently isolating coordinates
            setViewportStatus('LOADING');
            const closedPoly = [...drawPoints, drawPoints[0]];
            const polyString = JSON.stringify(closedPoly.map(p => [Math.round(p[0]*100)/100, Math.round(p[1]*100)/100]));
            
            DataService.fetchSpatialPolygon(polyString, 'Drawn Selection').then((hitRegion: any) => {
                setViewportStatus('READY');
                if (!hitRegion.tsData || hitRegion.tsData.length === 0) {
                   setMode('EMPTY_DISCOVERY');
                   setLocalDiscoveryData(null);
                   setDrawPoints([]);
                } else {
                   const cLon = closedPoly.reduce((acc, p) => acc + p[0], 0) / closedPoly.length;
                   const cLat = closedPoly.reduce((acc, p) => acc + p[1], 0) / closedPoly.length;
                   const lons = closedPoly.map(p => p[0]);
                   const lats = closedPoly.map(p => p[1]);
                   const polyBounds = [[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]];

                   setLocalDiscoveryData({
                     sourceRegion: hitRegion,
                     count: hitRegion.trajectories.length,
                     observationCount: hitRegion.tsData.length,
                     anomaly: hitRegion.anomaly,
                     hasAnomaly: hitRegion.anomaly.length > 5,
                     radarBase: [{ position: [cLon, cLat, 0] }],
                     centroid: [cLon, cLat],
                     tsData: hitRegion.tsData,
                     trajectories: hitRegion.trajectories,
                     bounds: polyBounds
                   });
                   setMode('DARWIN');
                   setDrawPoints([]);
                }
            }).catch(() => {
                setViewportStatus('ERROR');
                setMode('EMPTY_DISCOVERY');
                setDrawPoints([]);
            });
            
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
        {viewportStatus === 'LOADING' && (
          <div style={{ position: 'absolute', top: '24px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(4, 7, 17, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(6, 182, 212, 0.5)', padding: '6px 16px', borderRadius: '16px', zIndex: 1000, color: '#22d3ee', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', fontWeight: 600, fontSize: '12px', letterSpacing: '1px' }}>
             ◉ SYNCING ARGOVIS DATA...
          </div>
        )}
        
        {viewportStatus === 'EMPTY' && (
          <div style={{ position: 'absolute', top: '24px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(127, 29, 29, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(239, 68, 68, 0.5)', padding: '6px 16px', borderRadius: '16px', zIndex: 1000, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', fontWeight: 600, fontSize: '12px', letterSpacing: '1px' }}>
             ⚠ NO LIVE OBSERVATIONS IN VIEWPORT
          </div>
        )}
        {/* Top Navigation */}
        <TopNav mode={mode} setMode={setMode} activeRegionId={activeRegionId} setActiveRegionId={setActiveRegionId} executeDarwinQuery={executeDarwinQuery} />

        {/* Left HUD Docks */}
        <DepthSlicer depthFilter={depthFilter} setDepthFilter={setDepthFilter} />
        <LeftDock mode={mode} setMode={setMode} setDrawPoints={setDrawPoints} activeRegion={activeRegion} localDiscoveryData={localDiscoveryData} darwinResult={darwinResult} isDarwinProcessing={isDarwinProcessing} />
        <MapLegend />

        {/* Right Telemetry Dock */}
        <RightDock mode={mode} activeRegion={activeRegion} localDiscoveryData={localDiscoveryData} selectedProfileId={selectedProfileId} setSelectedProfileId={setSelectedProfileId} />

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
          minTime={globalTrajectories.length > 0 ? Math.min(...globalTrajectories.map((t:any) => t.path.length > 0 ? t.path[0][3] : 0)) : CONSTANTS.START_TIME}
          maxTime={globalTrajectories.length > 0 ? Math.max(...globalTrajectories.map((t:any) => t.path.length > 0 ? t.path[t.path.length-1][3] : 1000)) : CONSTANTS.END_TIME}
        />
      </div>
    </div>
  );
}

export default App;
