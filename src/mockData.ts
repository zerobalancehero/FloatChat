// mockData.ts
export const CONSTANTS = {
  START_TIME: 0,
  END_TIME: 1000,
};

// Generative Math Functions to dynamically build distinct global oceanographic regions
function genTrajectories(lon: number, lat: number, count: number, dx: number, dy: number) {
  return Array.from({length: count}, (_, i) => {
    const startLon = lon + (Math.random() - 0.5) * 8;
    const startLat = lat + (Math.random() - 0.5) * 8;
    const path = [];
    let cLon = startLon, cLat = startLat;
    const speed = 0.5 + Math.random() * 0.5;
    for (let t = 0; t <= 1000; t += Math.random() * 20 + 10) {
      cLon += (dx * speed) + Math.sin(t/100 + i) * 0.05;
      cLat += (dy * speed) + Math.cos(t/120 + i * 0.5) * 0.05;
      path.push([cLon, cLat, 0, t]);
    }
    return { vendor: i % 3 === 0 ? 1 : 0, path };
  });
}

function genDivePaths(lon: number, lat: number, count: number) {
  return Array.from({length: count}, (_, i) => {
    const baseLon = lon + (Math.random() - 0.5) * 10;
    const baseLat = lat + (Math.random() - 0.5) * 10;
    const path = [];
    for (let d = 0; d >= -2000; d -= 50) {
      const radius = 0.2 * (1 + (Math.abs(d) / 2000));
      path.push([baseLon + Math.sin(d/50 + i) * radius, baseLat + Math.cos(d/50 + i) * radius, d]);
    }
    return { path, color: i % 2 === 0 ? [6, 182, 212] : [245, 158, 11] };
  });
}

function genAnomaly(lon: number, lat: number) {
  return Array.from({length: 400}, (_, i) => {
    const theta = i * 0.2;
    const radius = (i / 400) * 1.0;
    return {
      position: [lon + Math.cos(theta) * radius, lat + Math.sin(theta) * radius, -(i / 400) * 3000], 
      size: 2, 
      color: [217, 70, 239, 120] 
    };
  });
}

function genRadar(lon: number, lat: number) {
  return [{ position: [lon, lat, 0] }];
}

function genTS(salBase: number, tempBase: number, regionName: string) {
  return Array.from({length: 40}, (_, i) => {
    const sal = salBase + Math.random() * 1.5;
    const temp = tempBase + Math.random() * 15;
    const sig0 = (sal - 35) * 0.8 - (temp - 15) * 0.2 + 25; 
    const wmk = temp < 5 ? (sal < 34.5 ? 'AABW' : 'CDW') : (temp > 15 ? 'Subtropical Mode' : 'Intermediate Water');
    return {
      id: Math.floor(4000000 + Math.random() * 1000000),
      cycle: i * 3 + Math.floor(Math.random() * 5),
      depth: Math.floor(100 + Math.random() * 1500),
      salinity: sal,
      temp: temp,
      density: sig0,
      classification: wmk,
      regionName,
      anomaly: Math.random() > 0.8 ? (Math.random() * 1.5).toFixed(1) : null
    };
  });
}

function genIsopycnals(salBase: number) {
  return Array.from({length: 20}, (_, i) => {
    const sal = salBase + (i / 19) * 2;
    return {
      salinity: sal,
      iso24: 24 - (sal - salBase) * 8.5,
      iso26: 18 - (sal - salBase) * 8.5,
      iso28: 12 - (sal - salBase) * 8.5,
    };
  });
}

function genProfile(thermoclineDepth: number, maxTemp: number) {
  return Array.from({length: 22}, (_, i) => {
    let depth = -i * 100;
    if(i === 1) depth = -thermoclineDepth;
    let t = maxTemp - (i * i * 0.05); 
    if (depth === -thermoclineDepth) t = maxTemp - 2; 
    return { depth, temp: t };
  }).sort((a, b) => b.depth - a.depth);
}

function genMHW(severity: number) {
  return Array.from({length: 30}, (_, i) => ({
    day: i,
    anomaly: i > 15 ? severity + Math.sin((i-15)/4) * 1.5 : Math.random() * 0.5
  }));
}

export type RegionTheme = {
   id: string;
   name: string;
   center: { longitude: number, latitude: number, zoom: number };
   trajectories: any[];
   divePaths: any[];
   anomaly: any[];
   radarBase: any[];
   tsData: any[];
   isopycnalsData: any[];
   depthProfileData: any[];
   mhwData: any[];
   thermoclinePoint: number;
   bounds: [[number, number], [number, number]];
};

export const REGIONS: Record<string, RegionTheme> = {
  kuroshio: {
    id: 'kuroshio', name: 'Kuroshio Extension', center: { longitude: 142.0, latitude: 34.0, zoom: 3.5 },
    bounds: [[138.0, 30.0], [146.0, 38.0]],
    trajectories: genTrajectories(142.0, 34.0, 60, 0.15, 0.05),
    divePaths: genDivePaths(142.0, 34.0, 30),
    anomaly: genAnomaly(142.0, 34.0),
    radarBase: genRadar(142.0, 34.0),
    tsData: genTS(34.0, 2.0, 'Kuroshio Extension'),
    isopycnalsData: genIsopycnals(34.0),
    depthProfileData: genProfile(142, 20),
    mhwData: genMHW(1.0),
    thermoclinePoint: 142
  },
  gulf_stream: {
    id: 'gulf_stream', name: 'Gulf Stream', center: { longitude: -70.0, latitude: 35.0, zoom: 3.5 },
    bounds: [[-74.0, 31.0], [-66.0, 39.0]],
    trajectories: genTrajectories(-70.0, 35.0, 60, 0.2, 0.1),
    divePaths: genDivePaths(-70.0, 35.0, 25),
    anomaly: genAnomaly(-70.0, 35.0),
    radarBase: genRadar(-70.0, 35.0),
    tsData: genTS(35.5, 4.0, 'Gulf Stream'),
    isopycnalsData: genIsopycnals(35.5),
    depthProfileData: genProfile(120, 22),
    mhwData: genMHW(2.5),
    thermoclinePoint: 120
  },
  agulhas: {
    id: 'agulhas', name: 'Agulhas Current', center: { longitude: 20.0, latitude: -40.0, zoom: 3.5 },
    bounds: [[16.0, -44.0], [24.0, -36.0]],
    trajectories: genTrajectories(20.0, -40.0, 45, -0.1, -0.05),
    divePaths: genDivePaths(20.0, -40.0, 20),
    anomaly: genAnomaly(20.0, -40.0),
    radarBase: genRadar(20.0, -40.0),
    tsData: genTS(34.5, 1.0, 'Agulhas Current'),
    isopycnalsData: genIsopycnals(34.5),
    depthProfileData: genProfile(160, 18),
    mhwData: genMHW(0.5),
    thermoclinePoint: 160
  },
  california: {
    id: 'california', name: 'California Current', center: { longitude: -125.0, latitude: 35.0, zoom: 4.0 },
    bounds: [[-129.0, 31.0], [-121.0, 39.0]],
    trajectories: genTrajectories(-125.0, 35.0, 40, 0.05, -0.15),
    divePaths: genDivePaths(-125.0, 35.0, 15),
    anomaly: genAnomaly(-125.0, 35.0),
    radarBase: genRadar(-125.0, 35.0),
    tsData: genTS(33.0, 0.0, 'California Current'),
    isopycnalsData: genIsopycnals(33.0),
    depthProfileData: genProfile(90, 15),
    mhwData: genMHW(3.2),
    thermoclinePoint: 90
  },
  southern_ocean: {
    id: 'southern_ocean', name: 'Southern Ocean ACC', center: { longitude: 0.0, latitude: -60.0, zoom: 2.5 },
    bounds: [[-4.0, -64.0], [4.0, -56.0]],
    trajectories: genTrajectories(0.0, -60.0, 80, 0.25, 0.01),
    divePaths: genDivePaths(0.0, -60.0, 40),
    anomaly: genAnomaly(0.0, -60.0),
    radarBase: genRadar(0.0, -60.0),
    tsData: genTS(34.2, -1.0, 'Southern Ocean ACC'),
    isopycnalsData: genIsopycnals(34.2),
    depthProfileData: genProfile(200, 5),
    mhwData: genMHW(0.2),
    thermoclinePoint: 200
  }
};
