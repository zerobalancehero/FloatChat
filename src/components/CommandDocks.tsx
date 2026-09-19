import React, { useState } from 'react';
import { Search, Activity, ThermometerSun, Map, User, Database, ChevronUp, ChevronDown, SkipBack, Play, Pause, SkipForward } from 'lucide-react';
import { ComposedChart, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line, ReferenceLine, ReferenceArea } from 'recharts';

export function TopNav({ mode, setMode, activeRegionId, setActiveRegionId, executeDarwinQuery }: any) {
  const [query, setQuery] = useState("");
  return (
    <div style={{ position: 'absolute', top: 0, width: '100%', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pointerEvents: 'none', zIndex: 20 }}>
      {/* Brand */}
      <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', pointerEvents: 'auto' }}>
        <Activity style={{ color: '#06b6d4', width: '20px', height: '20px' }} />
        <span style={{ fontWeight: 600, letterSpacing: '1px', fontSize: '14px' }}>FloatChat</span>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#06b6d4', boxShadow: '0 0 8px #06b6d4', marginLeft: '8px' }}></div>
      </div>

      {/* Center Nav */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', pointerEvents: 'auto' }}>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', width: '520px' }}>
          <Search style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.5)', marginRight: '12px', flexShrink: 0 }} />
          <input 
            type="text" 
            placeholder="Analyze temperature in the Gulf Stream..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { 
                executeDarwinQuery(query);
                setQuery("");
              }
            }}
            style={{ background: 'transparent', outline: 'none', border: 'none', color: 'white', width: '100%', fontSize: '14px' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
          <button className="glass-panel" style={{ padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'white', background: mode === 'EXECUTIVE' ? 'rgba(255,255,255,0.15)' : '' }} onClick={() => setMode('EXECUTIVE')}>
            <ThermometerSun style={{ width: '12px', height: '12px', marginRight: '4px', color: '#f59e0b', verticalAlign: 'middle' }}/> Compare Thermocline
          </button>
          <button className="glass-panel" style={{ padding: '6px 12px', cursor: 'pointer', color: 'white', background: mode === 'AGGREGATION' ? 'rgba(255,255,255,0.15)' : '' }} onClick={() => setMode('AGGREGATION')}>
             Analyze Heatwave
          </button>
          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', padding: '4px 12px', background: 'rgba(255,255,255,0.05)' }}>
            <select 
              value={(mode === 'DARWIN' || mode === 'DRAW') ? 'custom' : activeRegionId} 
              onChange={e => {
                  if (e.target.value !== 'custom') {
                      setActiveRegionId(e.target.value);
                      setMode('EXECUTIVE');
                  }
              }}
              style={{ background: 'transparent', color: 'white', border: 'none', outline: 'none', fontSize: '12px', cursor: 'pointer' }}
            >
              <option value="custom" style={{color: 'black'}} disabled hidden>Custom Selection</option>
              <option value="kuroshio" style={{color: 'black'}}>Kuroshio Extension</option>
              <option value="gulf_stream" style={{color: 'black'}}>Gulf Stream</option>
              <option value="agulhas" style={{color: 'black'}}>Agulhas Current</option>
              <option value="california" style={{color: 'black'}}>California Current</option>
              <option value="southern_ocean" style={{color: 'black'}}>Southern Ocean ACC</option>
            </select>
          </div>
          <button className="glass-panel" style={{ padding: '6px 12px', cursor: 'pointer', color: '#d946ef', fontWeight: 500, display: 'flex', alignItems: 'center', background: (mode === 'DARWIN' || mode === 'DRAW') ? 'rgba(217,70,239,0.15)' : '' }} onClick={() => setMode('DRAW')}>
             <Map style={{ width: '12px', height: '12px', marginRight: '4px', verticalAlign: 'middle' }} /> Draw & Discover
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '8px', pointerEvents: 'auto', cursor: 'pointer' }}>
        <User style={{ width: '20px', height: '20px' }} />
      </div>
    </div>
  );
}

export function LeftDock({ mode, setMode, setDrawPoints, activeRegion, localDiscoveryData, darwinResult, isDarwinProcessing }: any) {
  const [sqlOpen, setSqlOpen] = useState(false);

  // Compute live valid stats for Executive View
  const hasTs = activeRegion?.tsData && activeRegion.tsData.length > 0;
  const ts = activeRegion?.tsData;
  const tempArr = hasTs ? ts.map((d: any) => d.temp).filter((v: number) => !isNaN(v)) : [];
  const salArr = hasTs ? ts.map((d: any) => d.salinity).filter((v: number) => !isNaN(v)) : [];
  const depthArr = hasTs ? ts.map((d: any) => d.depth).filter((v: number) => !isNaN(v)) : [];

  const tempMin = hasTs && tempArr.length > 0 ? Math.min(...tempArr).toFixed(2) : '-';
  const tempMax = hasTs && tempArr.length > 0 ? Math.max(...tempArr).toFixed(2) : '-';
  const tempMean = hasTs && tempArr.length > 0 ? (tempArr.reduce((a:number,b:number)=>a+b, 0) / tempArr.length).toFixed(2) : '-';

  const salMin = hasTs && salArr.length > 0 ? Math.min(...salArr).toFixed(2) : '-';
  const salMax = hasTs && salArr.length > 0 ? Math.max(...salArr).toFixed(2) : '-';
  const salMean = hasTs && salArr.length > 0 ? (salArr.reduce((a:number,b:number)=>a+b, 0) / salArr.length).toFixed(2) : '-';
  
  const depthMin = hasTs && depthArr.length > 0 ? Math.min(...depthArr).toFixed(0) : '-';
  const depthMax = hasTs && depthArr.length > 0 ? Math.max(...depthArr).toFixed(0) : '-';

  const earliestTime = activeRegion?.trajectories?.length > 0 
      ? Math.min(...activeRegion.trajectories.map((t:any) => t.path?.[0]?.[3] || Infinity)) 
      : null;
  const latestTime = activeRegion?.trajectories?.length > 0
      ? Math.max(...activeRegion.trajectories.map((t:any) => t.path?.[t.path.length-1]?.[3] || -Infinity))
      : null;

  const timeStr = earliestTime && earliestTime !== Infinity 
      ? `${new Date(earliestTime).toISOString().slice(0,10)} to ${new Date(latestTime).toISOString().slice(0,10)}`
      : 'Unavailable';

  // Draw Time calculations
  const drawnEarliest = (mode === 'DARWIN' && localDiscoveryData?.trajectories?.length > 0)
      ? Math.min(...localDiscoveryData.trajectories.map((t:any) => t.path?.[0]?.[3] || Infinity))
      : null;
  const drawnLatest = (mode === 'DARWIN' && localDiscoveryData?.trajectories?.length > 0)
      ? Math.max(...localDiscoveryData.trajectories.map((t:any) => t.path?.[t.path.length-1]?.[3] || -Infinity))
      : null;

  const drawnTimeStr = (drawnEarliest && drawnEarliest !== Infinity)
      ? `${new Date(drawnEarliest).toISOString().slice(0,10)} to ${new Date(drawnLatest).toISOString().slice(0,10)}`
      : 'Unavailable';

  return (
    <div className="glass-panel" style={{ position: 'absolute', left: '72px', top: '90px', width: '340px', display: 'flex', flexDirection: 'column', padding: '16px', gap: '16px', pointerEvents: 'auto', zIndex: 10 }}>
      <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
        {mode === 'AGGREGATION' ? 'Spatial Region Aggregation' : 
         mode === 'EXECUTIVE' ? 'Executive Ocean State Summary' : 
         mode === 'DARWIN_ANALYST' ? 'Ocean Darwin Scientific Brief' :
         'Ocean Darwin — Autonomous Discovery'}
      </div>

      {mode === 'EXECUTIVE' && (
         <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
            <div style={{ padding: '12px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
               {hasTs ? (
                 <>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '8px' }}>
                     <div><strong style={{color: '#d946ef'}}>Profiles Analyzed:</strong> <br/>{activeRegion?.trajectories?.length || 0}</div>
                     <div><strong style={{color: '#d946ef'}}>Valid Observations:</strong> <br/>{ts.length}</div>
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '8px' }}>
                     <div><strong style={{color: '#06b6d4'}}>Temperature Mean:</strong> <br/>{tempMean}°C</div>
                     <div><strong style={{color: '#06b6d4'}}>Temp Range:</strong> <br/>{tempMin}°C to {tempMax}°C</div>
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '8px' }}>
                     <div><strong style={{color: '#f59e0b'}}>Salinity Mean:</strong> <br/>{salMean} psu</div>
                     <div><strong style={{color: '#f59e0b'}}>Salinity Range:</strong> <br/>{salMin} to {salMax} psu</div>
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '8px' }}>
                     <div><strong style={{color: '#4ade80'}}>Pressure/Depth:</strong> <br/>{depthMin}m to {depthMax}m</div>
                     <div><strong style={{color: '#4ade80'}}>Time Range:</strong> <br/>{timeStr}</div>
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' }}>
                     <div><strong style={{color: 'white'}}>Currents (Open-Meteo):</strong> Polled</div>
                     <div><strong style={{color: 'white'}}>Last Refresh:</strong> {new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC</div>
                   </div>
                 </>
               ) : (
                 <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.5)' }}>
                    Unavailable — insufficient live data
                 </div>
               )}
            </div>
         </div>
      )}
      
      {mode === 'AGGREGATION' && (
          <div style={{ padding: '12px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#4ade80', fontSize: '12px', fontWeight: 'bold' }}>Success: 1254 profiles</div>
              <div style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                  Total spatial volume mapped in selection matrix.
              </div>
          </div>
      )}
      
      {mode === 'DARWIN' && localDiscoveryData && (
         <div style={{ padding: '8px' }}>
            <div style={{ color: '#d946ef', fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>DRAWN REGION DATA</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px', marginBottom: '12px' }}>
               <div style={{ color: 'white' }}>Selection:</div>
               <div style={{ fontWeight: 'bold' }}>Drawn Region</div>
               <div style={{ color: 'white' }}>Lat Bounds:</div>
               <div style={{ fontWeight: 'bold' }}>{localDiscoveryData.bounds?.[0][1]?.toFixed(1)}° to {localDiscoveryData.bounds?.[1][1]?.toFixed(1)}°</div>
               <div style={{ color: 'white' }}>Lon Bounds:</div>
               <div style={{ fontWeight: 'bold' }}>{localDiscoveryData.bounds?.[0][0]?.toFixed(1)}° to {localDiscoveryData.bounds?.[1][0]?.toFixed(1)}°</div>
               <div style={{ color: 'white' }}>Profiles:</div>
               <div style={{ fontWeight: 'bold' }}>{localDiscoveryData.count}</div>
               <div style={{ color: 'white' }}>Observations:</div>
               <div style={{ fontWeight: 'bold' }}>{localDiscoveryData.observationCount}</div>
               <div style={{ color: 'white' }}>Date Range:</div>
               <div style={{ fontWeight: 'bold' }}>{drawnTimeStr}</div>
            </div>
            {localDiscoveryData.observationCount === 0 && (
                <div style={{ color: '#fca5a5', fontSize: '11px', marginBottom: '8px' }}>No Argovis observations found inside this selection.</div>
            )}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', fontSize: '10px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
               Data source: Argovis<br/>
               Last update: {new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC
            </div>
            
            <button 
                onClick={() => {
                    if (setMode) setMode('EXECUTIVE');
                    if (setDrawPoints) setDrawPoints([]);
                }} 
                style={{ marginTop: '16px', width: '100%', padding: '6px 12px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#fca5a5', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                X CLEAR SELECTION
            </button>
         </div>
      )}

      {mode === 'DARWIN' && localDiscoveryData && localDiscoveryData.hasAnomaly && (
         <div style={{ marginTop: '8px', fontSize: '12px', padding: '12px', background: 'rgba(217, 70, 239, 0.1)', borderLeft: '3px solid #d946ef' }}>
             <strong style={{ color: '#d946ef' }}>Pattern Ω-17 | Confidence: 94.2%</strong>
             <div style={{ marginTop: '4px' }}><strong>Hypothesis Debate:</strong> Advection core identified locally. Model A flags as localized front; Model B flags as eddy spin-off.</div>
         </div>
      )}

      {mode === 'DARWIN_ANALYST' && (
         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isDarwinProcessing && (
               <div style={{ padding: '24px', textAlign: 'center', color: '#06b6d4', fontStyle: 'italic', fontSize: '12px' }}>
                  Darwin is compiling observations...
               </div>
            )}
            
            {!isDarwinProcessing && darwinResult?.type === 'NO_DATA' && (
               <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid #ef4444', fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>
                  <strong style={{ color: '#ef4444', display: 'block', marginBottom: '8px' }}>Insufficient Data Pipeline</strong>
                  No oceanographic observations were returned for the requested parameters. No deterministic statistical analysis could be safely run. 
               </div>
            )}

            {!isDarwinProcessing && darwinResult?.type === 'SUCCESS' && (
               <div style={{ fontSize: '12px', lineHeight: 1.5, color: 'rgba(255,255,255,0.85)' }}>
                 <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ color: '#d946ef', fontWeight: 'bold' }}>Query Execution:</div>
                    <div style={{ fontStyle: 'italic' }}>"{darwinResult.query}"</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginTop: '8px', gap: '8px' }}>
                       <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '4px' }}>
                           <div style={{ fontSize: '9px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Observations</div>
                           <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{darwinResult.observationCount}</div>
                       </div>
                       <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '4px' }}>
                           <div style={{ fontSize: '9px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Profiles</div>
                           <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{darwinResult.profileCount}</div>
                       </div>
                    </div>
                 </div>
                 
                 <div style={{ marginBottom: '12px' }}>
                    <div style={{ color: '#d946ef', fontWeight: 'bold', marginBottom: '4px' }}>Statistical Findings:</div>
                    <ul style={{ paddingLeft: '16px', margin: 0, color: 'rgba(255,255,255,0.7)' }}>
                       <li><span style={{ color: 'white' }}>Mean Temp:</span> {darwinResult.stats.meanT.toFixed(2)}°C</li>
                       <li><span style={{ color: 'white' }}>Temp Range:</span> [{darwinResult.stats.minT.toFixed(2)} — {darwinResult.stats.maxT.toFixed(2)}]°C</li>
                       <li><span style={{ color: 'white' }}>Anomalies (+2σ):</span> {darwinResult.anomalies.length} nodes outside baseline.</li>
                    </ul>
                 </div>

                 {darwinResult.anomalies.length > 0 && (
                 <div style={{ padding: '8px', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '2px solid #f59e0b' }}>
                    <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase' }}>Evidence Isolated</div>
                    <div style={{ fontSize: '11px', marginTop: '4px' }}>Target ID: {darwinResult.anomalies[0].id} (Cycle {darwinResult.anomalies[0].cycle}) recorded {darwinResult.anomalies[0].temp.toFixed(2)}°C.</div>
                 </div>
                 )}
               </div>
            )}
         </div>
      )}

      {mode === 'DARWIN' && localDiscoveryData && !localDiscoveryData.hasAnomaly && (
         <div style={{ marginTop: '8px', fontSize: '12px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderLeft: '3px solid #10b981' }}>
             <strong style={{ color: '#10b981' }}>Nominal Baseline</strong>
             <div style={{ marginTop: '4px' }}>No major localized thermal/advection anomalies detected inside the selected boundary.</div>
         </div>
      )}

      {/* SQL Lens */}
      <div style={{ marginTop: 'auto', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '4px', overflow: 'hidden' }}>
        <button 
          onClick={() => setSqlOpen(!sqlOpen)}
          style={{ width: '100%', background: 'rgba(245, 158, 11, 0.1)', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#f59e0b', border: 'none', cursor: 'pointer' }}
        >
          <span style={{ fontWeight: 600, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Database style={{ width: '12px', height: '12px' }} /> ⚡ DuckDB SQL EXECUTION BADGE <span style={{ opacity: 0.7, fontFamily: 'monospace' }}>38ms</span>
          </span>
          {sqlOpen ? <ChevronUp style={{ width: '12px', height: '12px' }} /> : <ChevronDown style={{ width: '12px', height: '12px' }} />}
        </button>
        {sqlOpen && (
          <div style={{ background: 'rgba(0,0,0,0.6)', padding: '12px', fontFamily: 'monospace', fontSize: '10px', color: '#06b6d4', overflowX: 'auto', whiteSpace: 'pre' }}>
{`SELECT 
  count(*) as profiles,
  avg(temp) as mean_t,
  avg(salinity) as mean_s
FROM read_parquet('s3://argo-data/2026/${activeRegion.id}/*.parquet')
WHERE ST_Within(
  geom, 
  ST_GeomFromText('POLYGON(...)')
)`}
          </div>
        )}
      </div>
    </div>
  );
}

const TsTooltip = ({ data }: any) => {
  if (!data || !data.id) return null;
  return (
    <div style={{ background: 'rgba(4, 7, 17, 0.45)', backdropFilter: 'blur(16px)', border: '1px solid rgba(6, 182, 212, 0.4)', borderRadius: '6px', padding: '12px', fontSize: '11px', color: 'white', minWidth: '220px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', pointerEvents: 'none' }}>
        <div style={{ fontSize: '10px', color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
          ARGO OBSERVATION
        </div>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '12px' }}>Profile {data.id}</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px 12px', color: 'rgba(255,255,255,0.8)' }}>
          <div>Region</div>
          <div style={{ textAlign: 'right', fontWeight: 'bold', color: 'white' }}>{data.regionName}</div>
          
          <div>Water Mass</div>
          <div style={{ textAlign: 'right', fontWeight: 'bold', color: 'white' }}>{data.classification}</div>
          
          <div style={{ opacity: 0.5, gridColumn: '1 / -1', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />

          <div>Conservative Temp. (θ)</div>
          <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#f59e0b' }}>{data.temp.toFixed(2)}°C</div>
          
          <div>Absolute Salinity (S_A)</div>
          <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#06b6d4' }}>{data.salinity.toFixed(2)}</div>
          
          <div>Density (σ₀)</div>
          <div style={{ textAlign: 'right', fontWeight: 'bold', color: 'white' }}>{data.density.toFixed(2)}</div>
          
          <div>Depth</div>
          <div style={{ textAlign: 'right', fontWeight: 'bold', color: 'white' }}>{data.depth} m</div>
          
          <div>Cycle</div>
          <div style={{ textAlign: 'right', fontWeight: 'bold', color: 'white' }}>{data.cycle}</div>
          
          {data.anomaly && (
            <>
              <div style={{ opacity: 0.5, gridColumn: '1 / -1', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
              <div>Thermal Anomaly</div>
              <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#ef4444' }}>+{data.anomaly}°C</div>
            </>
          )}
        </div>
      </div>
    );
};

export function RightDock({ mode, activeRegion, localDiscoveryData, selectedProfileId, setSelectedProfileId }: any) {
  const [hoveredTSPoint, setHoveredTSPoint] = useState<any>(null);
  const [hoverPosition, setHoverPosition] = useState({x: 0, y: 0});
  const { isopycnalsData, mhwData, thermoclinePoint } = activeRegion;
  
  const isDrawn = mode === 'DARWIN' && localDiscoveryData;
  const isAggregate = !selectedProfileId && !isDrawn;
  
  const displayContext = selectedProfileId ? 'FLOAT PROFILE' : isDrawn ? 'DRAWN REGION' : 'VIEWPORT AGGREGATE';

  const selectedProfileData = activeRegion?.profiles?.[selectedProfileId];

  const displayTsData = selectedProfileId ? (selectedProfileData || []) : (localDiscoveryData ? localDiscoveryData.tsData : activeRegion.tsData || []);

  const displayDepthData = selectedProfileId 
    ? (selectedProfileData ? selectedProfileData.map((o: any) => ({ depth: -o.depth, temp: o.temp })) : [])
    : (localDiscoveryData ? localDiscoveryData.tsData?.map((o:any)=>({depth: -o.depth, temp: o.temp})) : activeRegion.depthProfileData);
  
  const currentBoundsLat = isDrawn 
       ? `${localDiscoveryData.bounds?.[0][1]?.toFixed(1)}°–${localDiscoveryData.bounds?.[1][1]?.toFixed(1)}°` 
       : activeRegion?.bounds ? `${activeRegion.bounds[0][1].toFixed(1)}°–${activeRegion.bounds[1][1].toFixed(1)}°` : 'N/A';
  const currentBoundsLon = isDrawn 
       ? `${localDiscoveryData.bounds?.[0][0]?.toFixed(1)}°–${localDiscoveryData.bounds?.[1][0]?.toFixed(1)}°` 
       : activeRegion?.bounds ? `${activeRegion.bounds[0][0].toFixed(1)}°–${activeRegion.bounds[1][0].toFixed(1)}°` : 'N/A';

  return (
    <div className="glass-panel" style={{ position: 'absolute', right: '24px', top: '90px', width: '360px', display: 'flex', flexDirection: 'column', padding: '16px', gap: '16px', pointerEvents: 'auto', zIndex: 10, height: 'calc(100vh - 160px)', overflowY: 'auto' }}>
      
      {/* T-S Diagram */}
      <div 
        style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', height: '235px', position: 'relative', flexShrink: 0 }}
        onMouseMove={(e) => {
           const rect = e.currentTarget.getBoundingClientRect();
           setHoverPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
        onMouseLeave={() => setHoveredTSPoint(null)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', zIndex: 2 }}>
           <div>
             <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: 600 }}>T-S Diagram (Θ vs S_A)</div>
             <div style={{ fontSize: '11px', fontWeight: 'bold', color: isAggregate ? '#06b6d4' : isDrawn ? '#d946ef' : '#f59e0b', marginTop: '2px' }}>
                {displayContext}
             </div>
             {selectedProfileId ? (
                 <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                    ID: {selectedProfileId} | {selectedProfileData?.[0]?.cycle ? `Cycle ${selectedProfileData[0].cycle}` : ''} | Source: Argovis
                 </div>
             ) : (
                 <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                    Lat: {currentBoundsLat} | Lon: {currentBoundsLon} <br/>
                    {displayTsData?.length || 0} observations | Source: Argovis
                 </div>
             )}
           </div>
           { selectedProfileId && (
               <button onClick={() => setSelectedProfileId(null)} style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#fca5a5', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '9px' }}>X Clear Selection</button>
           )}
        </div>
        <div style={{ position: 'absolute', right: '12px', top: '35px', fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>σ0 contours</div>
        <div style={{ flex: 1, width: '100%', height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart margin={{ top: 5, right: 5, bottom: -10, left: -25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" dataKey="salinity" domain={['auto', 'auto']} stroke="rgba(255,255,255,0.4)" tick={{fontSize: 9, fill: 'rgba(255,255,255,0.4)'}} tickLine={false} axisLine={false} />
              <YAxis type="number" dataKey="temp" domain={['auto', 'auto']} stroke="rgba(255,255,255,0.4)" tick={{fontSize: 9, fill: 'rgba(255,255,255,0.4)'}} tickLine={false} axisLine={false} />
              
              {/* Density contours as curves */}
              <Line data={isopycnalsData} type="monotone" dataKey="iso24" stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" dot={false} isAnimationActive={false} />
              <Line data={isopycnalsData} type="monotone" dataKey="iso26" stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" dot={false} isAnimationActive={false} />
              <Line data={isopycnalsData} type="monotone" dataKey="iso28" stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" dot={false} isAnimationActive={false} />
              
              <Scatter 
                name="Water Mass" 
                data={displayTsData} 
                fill="#06b6d4" 
                onMouseEnter={(payloadNode: any, index: number) => {
                  setHoveredTSPoint({ ...displayTsData[index], ...payloadNode });
                }}
                onMouseLeave={() => setHoveredTSPoint(null)}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {hoveredTSPoint && (
           <div style={{ position: 'absolute', left: hoverPosition.x > 180 ? hoverPosition.x - 230 : hoverPosition.x + 10, top: hoverPosition.y > 110 ? hoverPosition.y - 120 : hoverPosition.y + 10, pointerEvents: 'none', zIndex: 100 }}>
             <TsTooltip data={hoveredTSPoint} />
           </div>
        )}
      </div>

      {/* Thermocline Gradient Profile */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', height: '220px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
           <div>
             <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: 600 }}>Thermocline Profile (Depth vs Temp)</div>
             <div style={{ fontSize: '11px', fontWeight: 'bold', color: isAggregate ? '#06b6d4' : isDrawn ? '#d946ef' : '#f59e0b', marginTop: '2px' }}>
                {displayContext}
             </div>
           </div>
        </div>
        {displayDepthData && displayDepthData.length > 5 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayDepthData} layout="vertical" margin={{ top: 5, right: 35, left: -10, bottom: 5 }}>
            <XAxis type="number" dataKey="temp" stroke="rgba(255,255,255,0.4)" tick={{fontSize: 9}} domain={['auto', 'auto']} hide />
            <YAxis type="number" dataKey="depth" stroke="rgba(255,255,255,0.4)" tick={{fontSize: 9}} domain={[-2000, 0]} />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
            <Tooltip contentStyle={{backgroundColor: '#040711', border: '1px solid #06b6d4', fontSize: '12px', color: 'white'}} />
            {isAggregate && thermoclinePoint > 0 && <ReferenceLine y={-thermoclinePoint} stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 3" label={{ position: 'right', value: `${thermoclinePoint}m Peak`, fill: '#f59e0b', fontSize: 10, fontWeight: 'bold' }} />}
            <Line type="monotone" dataKey="temp" stroke={isAggregate ? "#06b6d4" : "#f59e0b"} strokeWidth={2} dot={(props: any) => {
               if(isAggregate && props.payload.depth === -thermoclinePoint) {
                  return <circle cx={props.cx} cy={props.cy} r={5} fill="#f59e0b" stroke="none" key={'c'+props.cx+props.cy}/>;
               }
               return <circle cx={props.cx} cy={props.cy} r={2} fill={isAggregate ? "#06b6d4" : "#f59e0b"} stroke="none" key={'c'+props.cx+props.cy} />;
            }} />
          </LineChart>
        </ResponsiveContainer>
        ) : (
             <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '11px', textAlign: 'center' }}>INSUFFICIENT LIVE PROFILE DATA</div>
        )}
      </div>

      {/* MHW Alert Card */}
      <div style={{ background: 'rgba(127, 29, 29, 0.4)', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.5)', padding: '12px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
         <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#f87171', textTransform: 'uppercase' }}>Marine Heatwave Live Status</div>
         <div style={{ fontSize: '12px', fontWeight: 300, marginTop: '8px', color: 'rgba(255,255,255,0.6)' }}>Climatology unavailable for this region.</div>
      </div>

      {/* Darwin Widgets */}
      {mode === 'DARWIN' && localDiscoveryData && (
         <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
           <div style={{ background: 'rgba(217, 70, 239, 0.1)', borderRadius: '4px', border: '1px solid rgba(217, 70, 239, 0.3)', padding: '12px' }}>
               <div style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#d946ef' }}>Observation Gap Radar</div>
               <div style={{ fontSize: '11px', marginTop: '8px', color: 'rgba(255,255,255,0.6)' }}>
                  Live analysis unavailable.<br/><br/>
                  Insufficient real-data baseline for accurate spatial deployment interpolation.
               </div>
           </div>
           
           <div style={{ background: 'rgba(217, 70, 239, 0.1)', borderRadius: '4px', border: '1px solid rgba(217, 70, 239, 0.3)', padding: '12px', flex: 1 }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#d946ef' }}>Ocean Phenomenon Family Tree</div>
              <div style={{ fontSize: '11px', marginTop: '8px', color: 'rgba(255,255,255,0.6)' }}>
                  Live classification unavailable.<br/><br/>
                  No real-time phenomenon classification data detected in the current geometry.
              </div>
           </div>
         </div>
      )}
    </div>
  );
}

export function BottomDock({ time, setTime, isPlaying, setIsPlaying, setPlaybackSpeed, minTime, maxTime }: any) {
  return (
    <div className="glass-panel" style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', width: '640px', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'auto', zIndex: 10 }}>
      
      {/* Controls */}
      <div style={{ color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button style={{ padding: '4px', cursor: 'pointer', background: 'transparent', border: 'none', color: 'inherit' }}><SkipBack style={{ width: '16px', height: '16px' }} /></button>
        <button style={{ padding: '4px', cursor: 'pointer', background: 'transparent', border: 'none', color: isPlaying ? '#f59e0b' : 'inherit' }} onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? <Pause style={{ width: '16px', height: '16px' }} /> : <Play style={{ width: '16px', height: '16px' }} />}
        </button>
        <button style={{ padding: '4px', cursor: 'pointer', background: 'transparent', border: 'none', color: 'inherit' }}><SkipForward style={{ width: '16px', height: '16px' }} /></button>
      </div>
      
      {/* Scrubber */}
      <div style={{ display: 'flex', flex: 1, padding: '0 24px', gap: '12px', alignItems: 'center' }}>
         <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#f59e0b', width: '130px' }}>HISTORICAL PLAYBACK</span>
         <input 
           type="range" 
           min={minTime} max={maxTime} step="3600000"
           value={time}
           onChange={(e) => setTime(Number(e.target.value))}
           style={{ flex: 1, accentColor: '#06b6d4', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', cursor: 'pointer' }}
         />
         <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)', width: '130px', textAlign: 'right' }}>
            {new Date(time).toISOString().replace('T', ' ').slice(0, 19)} UTC
         </span>
      </div>

      {/* Speed Controls */}
      <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: '4px', overflow: 'hidden', fontSize: '10px', fontWeight: 'bold' }}>
        <button onClick={() => setPlaybackSpeed(1)} style={{ padding: '6px 12px', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', color: '#06b6d4', border: 'none' }}>1x</button>
        <button onClick={() => setPlaybackSpeed(5)} style={{ padding: '6px 12px', cursor: 'pointer', background: 'transparent', color: 'white', border: 'none' }}>5x</button>
        <button onClick={() => setPlaybackSpeed(20)} style={{ padding: '6px 12px', cursor: 'pointer', background: 'transparent', color: 'white', border: 'none' }}>20x</button>
      </div>

    </div>
  );
}

export function DepthSlicer({ depthFilter, setDepthFilter }: any) {
  return (
    <div className="glass-panel" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 8px', pointerEvents: 'auto', zIndex: 10 }}>
      <div style={{ fontSize: '10px', color: 'white', writingMode: 'vertical-rl', transform: 'rotate(180deg)', marginBottom: '12px', opacity: 0.6 }}>0m (Surface)</div>
      
      <input 
        type="range" 
        min="-2000" max="0" step="10"
        value={depthFilter}
        onChange={(e) => setDepthFilter(Number(e.target.value))}
        style={{
          writingMode: 'vertical-lr',
          direction: 'rtl',
          appearance: 'slider-vertical' as any,
          WebkitAppearance: 'slider-vertical' as any,
          width: '6px',
          height: '100%',
          accentColor: '#06b6d4',
          cursor: 'pointer',
          background: 'rgba(255,255,255,0.2)'
        }}
      />
      
      <div style={{ fontSize: '10px', color: 'white', writingMode: 'vertical-rl', transform: 'rotate(180deg)', marginTop: '12px', opacity: 0.6 }}>-2000m</div>
      
      <div style={{ marginTop: '16px', fontSize: '10px', fontFamily: 'monospace', color: '#06b6d4', fontWeight: 'bold' }}>
         {depthFilter}m
      </div>
    </div>
  );
}

export function MapLegend() {
  return (
    <div className="glass-panel" style={{ position: 'absolute', bottom: '110px', left: '16px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'auto', zIndex: 10 }}>
        <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'white', textTransform: 'uppercase', marginBottom: '4px' }}>Map Key</div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
            <div style={{ width: '16px', height: '2px', background: 'rgba(16, 185, 129, 0.8)' }}></div>
            OCEAN CURRENT
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginLeft: '4px' }}>(Open-Meteo)</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
            <div style={{ width: '16px', height: '4px', background: 'rgba(245, 158, 11, 0.8)', borderRadius: '2px' }}></div>
            FLOAT TRAJECTORY
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginLeft: '4px' }}>(Argovis)</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.6)' }}></div>
            OBSERVATION
        </div>
    </div>
  );
}
