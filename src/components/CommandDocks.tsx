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
              value={activeRegionId} 
              onChange={e => setActiveRegionId(e.target.value)}
              style={{ background: 'transparent', color: 'white', border: 'none', outline: 'none', fontSize: '12px', cursor: 'pointer' }}
            >
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

export function LeftDock({ mode, activeRegion, localDiscoveryData, darwinResult, isDarwinProcessing }: any) {
  const [sqlOpen, setSqlOpen] = useState(false);

  return (
    <div className="glass-panel" style={{ position: 'absolute', left: '72px', top: '90px', width: '340px', display: 'flex', flexDirection: 'column', padding: '16px', gap: '16px', pointerEvents: 'auto', zIndex: 10 }}>
      <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
        {mode === 'AGGREGATION' ? 'Spatial Region Aggregation' : 
         mode === 'EXECUTIVE' ? 'Executive Ocean State Summary' : 
         mode === 'DARWIN_ANALYST' ? 'Ocean Darwin Scientific Brief' :
         'Ocean Darwin — Autonomous Discovery'}
      </div>

      {mode === 'EXECUTIVE' && (
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ padding: '12px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Profiles</div>
               <div style={{ fontSize: '20px', fontWeight: 300, color: '#06b6d4' }}>1,254</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Anomaly</div>
               <div style={{ fontSize: '20px', fontWeight: 300, color: '#f59e0b' }}>+2.4°C</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>MLD</div>
               <div style={{ fontSize: '20px', fontWeight: 300 }}>38.5m</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Confidence</div>
               <div style={{ fontSize: '20px', fontWeight: 300, color: '#4ade80' }}>94.2%</div>
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
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ padding: '12px', borderRadius: '4px', background: 'rgba(217,70,239,0.1)', border: '1px solid rgba(217,70,239,0.3)' }}>
               <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Local Observations</div>
               <div style={{ fontSize: '20px', fontWeight: 300, color: '#d946ef' }}>{localDiscoveryData.observationCount}</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '4px', background: 'rgba(217,70,239,0.1)', border: '1px solid rgba(217,70,239,0.3)' }}>
               <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Gradient ΔS/ΔP</div>
               <div style={{ fontSize: '20px', fontWeight: 300, color: '#f59e0b' }}>0.015</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '4px', background: 'rgba(217,70,239,0.1)', border: '1px solid rgba(217,70,239,0.3)' }}>
               <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Displacement</div>
               <div style={{ fontSize: '20px', fontWeight: 300 }}>11.2σ</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '4px', background: 'rgba(217,70,239,0.1)', border: '1px solid rgba(217,70,239,0.3)' }}>
               <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Persistence</div>
               <div style={{ fontSize: '20px', fontWeight: 300, color: '#4ade80' }}>14 Days</div>
            </div>
         </div>
      )}

      {/* Briefing */}
      {mode !== 'DARWIN' && mode !== 'DARWIN_ANALYST' && (
      <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>
         <ul style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Strong eddy rotation detected at thermocline depth.</li>
            <li>Thermal inversions highly correlated with recent advection.</li>
            <li>Potential density displacement occurring in the Kuroshio flow.</li>
         </ul>
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

export function RightDock({ mode, activeRegion, localDiscoveryData }: any) {
  const [hoveredTSPoint, setHoveredTSPoint] = useState<any>(null);
  const [hoverPosition, setHoverPosition] = useState({x: 0, y: 0});
  const { tsData, isopycnalsData, depthProfileData, mhwData, thermoclinePoint, name } = activeRegion;
  const displayTsData = localDiscoveryData ? localDiscoveryData.tsData : tsData;
  return (
    <div className="glass-panel" style={{ position: 'absolute', right: '24px', top: '90px', width: '360px', display: 'flex', flexDirection: 'column', padding: '16px', gap: '16px', pointerEvents: 'auto', zIndex: 10, height: 'calc(100vh - 160px)', overflowY: 'auto' }}>
      
      {/* T-S Diagram */}
      <div 
        style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', height: '220px', position: 'relative', flexShrink: 0 }}
        onMouseMove={(e) => {
           const rect = e.currentTarget.getBoundingClientRect();
           setHoverPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
        onMouseLeave={() => setHoveredTSPoint(null)}
      >
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px', zIndex: 2 }}>T-S Diagram (Θ vs S_A)</div>
        <div style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>σ0 contours</div>
        <div style={{ flex: 1, width: '100%', height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart margin={{ top: 5, right: 5, bottom: -10, left: -25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" dataKey="salinity" domain={[34, 36]} stroke="rgba(255,255,255,0.4)" tick={{fontSize: 9, fill: 'rgba(255,255,255,0.4)'}} tickLine={false} axisLine={false} />
              <YAxis type="number" dataKey="temp" domain={[0, 24]} stroke="rgba(255,255,255,0.4)" tick={{fontSize: 9, fill: 'rgba(255,255,255,0.4)'}} tickLine={false} axisLine={false} />
              
              {/* Density contours as curves */}
              <Line data={isopycnalsData} type="monotone" dataKey="iso24" stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" dot={false} isAnimationActive={false} />
              <Line data={isopycnalsData} type="monotone" dataKey="iso26" stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" dot={false} isAnimationActive={false} />
              <Line data={isopycnalsData} type="monotone" dataKey="iso28" stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" dot={false} isAnimationActive={false} />
              
              <Scatter 
                name="Water Mass" 
                data={displayTsData} 
                fill="#06b6d4" 
                onMouseEnter={(data: any) => {
                  setHoveredTSPoint(data.payload || data);
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
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Thermocline Profile (Depth vs Temp)</div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={depthProfileData} layout="vertical" margin={{ top: 5, right: 35, left: -10, bottom: 5 }}>
            <XAxis type="number" dataKey="temp" stroke="rgba(255,255,255,0.4)" tick={{fontSize: 9}} domain={['auto', 'auto']} hide />
            <YAxis type="number" dataKey="depth" stroke="rgba(255,255,255,0.4)" tick={{fontSize: 9}} domain={[-2000, 0]} />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
            <Tooltip contentStyle={{backgroundColor: '#040711', border: '1px solid #06b6d4', fontSize: '12px', color: 'white'}} />
            <ReferenceArea y1={-150} y2={-130} fill="rgba(245, 158, 11, 0.2)" />
            <ReferenceLine y={-thermoclinePoint} stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 3" label={{ position: 'right', value: `${thermoclinePoint}m Peak`, fill: '#f59e0b', fontSize: 10, fontWeight: 'bold' }} />
            <Line type="monotone" dataKey="temp" stroke="#06b6d4" strokeWidth={2} dot={(props: any) => {
               if(props.payload.depth === -thermoclinePoint) {
                  return <circle cx={props.cx} cy={props.cy} r={5} fill="#f59e0b" stroke="none" />;
               }
               return <circle cx={props.cx} cy={props.cy} r={2} fill="#06b6d4" stroke="none" />;
            }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* MHW Alert Card */}
      <div style={{ background: 'rgba(127, 29, 29, 0.4)', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.5)', padding: '12px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
         <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#f87171', textTransform: 'uppercase' }}>Marine Heatwave Alert</div>
         <div style={{ fontSize: '16px', fontWeight: 300, marginTop: '4px' }}>Category II — Strong</div>
         <div style={{ fontSize: '12px', marginTop: '4px', color: '#fca5a5' }}>+2.4°C to +3.1°C deviation</div>
         <div style={{ width: '100%', height: '40px', marginTop: '12px' }}>
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={mhwData} margin={{top:0, bottom:0, left:0, right:0}}>
                  <Area type="monotone" dataKey="anomaly" stroke="#ef4444" fill="rgba(239,68,68,0.3)" />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* Darwin Widgets */}
      {mode === 'DARWIN' && localDiscoveryData && (
         <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
           <div style={{ background: 'rgba(217, 70, 239, 0.1)', borderRadius: '4px', border: '1px solid rgba(217, 70, 239, 0.3)', padding: '12px' }}>
               <div style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#d946ef' }}>Observation Gap Radar</div>
               <div style={{ fontSize: '12px', marginTop: '8px', color: 'rgba(217, 70, 239, 0.7)' }}>
                  Recommended Float Deployment:<br/><br/>
                  <strong style={{ color: 'white' }}>📍 {(localDiscoveryData.radarBase[0].position[1]).toFixed(1)}°N, {(localDiscoveryData.radarBase[0].position[0]).toFixed(1)}°E</strong><br/>
                  (Source: {localDiscoveryData.sourceRegion.name})
               </div>
           </div>
           
           <div style={{ background: 'rgba(217, 70, 239, 0.1)', borderRadius: '4px', border: '1px solid rgba(217, 70, 239, 0.3)', padding: '12px', flex: 1 }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#d946ef' }}>Ocean Phenomenon Family Tree</div>
              <ul style={{ fontSize: '12px', margin: 0, paddingLeft: '16px', color: 'rgba(255,255,255,0.8)', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <li>Subsurface Events
                    <ul style={{ paddingLeft: '16px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <li>Thermal Inversion</li>
                      <li style={{ color: '#d946ef', fontWeight: 'bold' }}>↳ Pattern Ω-17 (Active Focus)</li>
                    </ul>
                 </li>
                 <li>Salinity Anomalies</li>
              </ul>
           </div>
         </div>
      )}
    </div>
  );
}

export function BottomDock({ time, setTime, isPlaying, setIsPlaying, setPlaybackSpeed }: any) {
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
         <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>{(time).toFixed(0)}</span>
         <input 
           type="range" 
           min="0" max="1000" 
           value={time}
           onChange={(e) => setTime(Number(e.target.value))}
           style={{ flex: 1, accentColor: '#06b6d4', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', cursor: 'pointer' }}
         />
         <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)' }}>1000</span>
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
