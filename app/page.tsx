<<<<<<< HEAD
"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '../utils/supabase';

// Dynamically import map/globe components to prevent Next.js server crashes
const OrbitalGlobe = dynamic(() => import('../components/OrbitalGlobe'), { ssr: false });
const EarthMap = dynamic(() => import('../components/EarthMap'), { ssr: false });

// Generate a dense web of 450 simulated satellites to make the globe look active and cinematic
const LEO_SWARM = Array.from({ length: 450 }, (_, i) => ({
  id: `SWARM-${i}`,
  name: `LEO-NODE-${i}`,
  alt: Math.random() * 1200 + 200, // Random LEO altitudes between 200km and 1400km
  lat: (Math.random() - 0.5) * 180,
  lng: (Math.random() - 0.5) * 360,
}));

const HERO_SATS = [
  { id: 1, name: 'CARTOSAT-3', alt: 509, lat: 13.0, lng: 80.2 },
  { id: 2, name: 'RISAT-2BR1', alt: 576, lat: 15.5, lng: 75.0 },
  { id: 3, name: 'INSAT-3DS', alt: 35786, lat: 0, lng: 82.0 },
  { id: 4, name: 'CHANDRAYAAN-3 ORBITER', alt: 150, lat: -12.5, lng: 60.1 },
];

export default function CommandCenter() {
  const [satellites, setSatellites] = useState<any[]>([...LEO_SWARM, ...HERO_SATS]);
  const [disasters, setDisasters] = useState<any[]>([
    { id: 'DANA-II', type: 'Cyclone', lat: 13.5, lng: 82.5, wind: 155, category: 2 }
  ]);
  
  const [currentTime, setCurrentTime] = useState("");
  const [activeSat, setActiveSat] = useState('INSAT-3DS');

  const conjunctionMetrics: Record<string, { pc: string, tca: string, status: string, directive: string }> = {
    'CARTOSAT-3': { 
      pc: '1.24e-4', tca: '42m 10s', status: 'WARNING', 
      directive: 'Monitor trajectory. Debris pass nominal. Minimal impact on surface imaging expected.' 
    },
    'RISAT-2BR1': { 
      pc: '3.05e-3', tca: '12m 05s', status: 'ELEVATED', 
      directive: 'Prepare for potential maneuver. Radar imaging for coastal zones may be briefly interrupted if burn is executed.' 
    },
    'INSAT-3DS': { 
      pc: '9.42e-2', tca: '04m 12s', status: 'CRITICAL', 
      directive: 'Severe cyclonic storm (DANA-II) active. Immediate delta-V burn required. WARNING: Avoidance maneuver will cause 45-minute blackout of meteorological telemetry over Bay of Bengal.' 
    },
    'CHANDRAYAAN-3 ORBITER': { 
      pc: '7.65e-2', tca: '19m 40s', status: 'CRITICAL', 
      directive: 'Radial miss distance critical. Immediate prograde burn required for orbital separation.' 
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + " IST");
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchTelemetry() {
      const { data: satData } = await supabase.from('satellites').select('*');
      if (satData && satData.length > 0) {
        // Merge real Supabase satellites with the massive visual swarm
        setSatellites([...LEO_SWARM, ...satData]);
      }

      const { data: disData } = await supabase.from('disasters').select('*');
      if (disData && disData.length > 0) setDisasters(disData);
    }
    fetchTelemetry();
  }, []);

  const activeMetrics = conjunctionMetrics[activeSat] || conjunctionMetrics['INSAT-3DS'];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-300 p-4 font-sans selection:bg-red-900 selection:text-white">
      
      <header className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-2xl font-bold tracking-widest text-white flex items-center gap-3">
            EARTH-SPACE VULNERABILITY INDEX <span className="text-slate-600">//</span> ASTRA 2026
          </h1>
          <p className="text-xs font-mono tracking-widest mt-1 text-slate-500 uppercase">Unified Command Nexus</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-emerald-950/30 border border-emerald-900 text-emerald-500 px-3 py-1 text-xs font-mono flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            ZONE ISOLATED
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        <div className="flex flex-col gap-4">
          {/* ORBITAL GLOBE */}
          <div className="bg-[#0b1120] border border-slate-800 rounded-lg overflow-hidden flex flex-col h-[400px]">
            <div className="bg-slate-900/50 border-b border-slate-800 p-2 px-4 flex justify-between items-center">
              <span className="text-xs font-mono text-slate-400">MODULE 2 // ORBITAL KINEMATICS</span>
              <span className="text-xs font-mono text-emerald-500">SATS TRACKED: {satellites.length}</span>
            </div>
            <div className="flex-grow relative bg-black cursor-move">
              <OrbitalGlobe satellites={satellites} />
              <div className="absolute bottom-2 left-2 text-[10px] font-mono text-slate-600">INTERACTIVE 3D RENDER // DRAG TO ROTATE</div>
            </div>
          </div>

          {/* TERRESTRIAL MAP */}
          <div className="bg-[#0b1120] border border-slate-800 rounded-lg overflow-hidden flex flex-col h-[400px]">
             <div className="bg-slate-900/50 border-b border-slate-800 p-2 px-4 flex justify-between items-center">
              <span className="text-xs font-mono text-slate-400">MODULE 1 // TERRESTRIAL HAZARD MAP</span>
              <span className="text-xs font-mono text-amber-500">ACTIVE: {disasters.length}</span>
            </div>
            <div className="flex-grow relative bg-slate-950">
              <EarthMap disasters={disasters} />
            </div>
          </div>
        </div>

        {/* AI CRISIS UPLINK */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#0b1120] border border-slate-800 rounded-lg p-5 flex flex-col h-full shadow-2xl transition-all duration-300">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className={`font-bold font-mono text-lg flex items-center gap-2 ${activeMetrics.status === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`}>
                {activeMetrics.status === 'CRITICAL' && <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute"></div>}
                <div className={`w-3 h-3 rounded-full relative ${activeMetrics.status === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                ISTRAC // NETRA AI CRISIS UPLINK
              </h2>
              <div className="flex items-center gap-3">
                <span className={`border px-3 py-1 text-xs font-bold tracking-widest ${activeMetrics.status === 'CRITICAL' ? 'bg-red-950/50 text-red-500 border-red-900' : 'bg-amber-950/50 text-amber-500 border-amber-900'}`}>
                  {activeMetrics.status}
                </span>
                <span className="text-slate-400 font-mono text-sm">{currentTime}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {['CARTOSAT-3', 'RISAT-2BR1', 'INSAT-3DS', 'CHANDRAYAAN-3 ORBITER'].map((btn) => (
                <button 
                  key={btn}
                  onClick={() => setActiveSat(btn)}
                  className={`text-[10px] sm:text-xs font-mono py-2 transition-colors border ${
                    activeSat === btn 
                      ? (activeMetrics.status === 'CRITICAL' ? 'bg-red-900/40 border-red-500 text-red-200 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-amber-900/40 border-amber-500 text-amber-200')
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {btn.replace(' ORBITER', '')}
                </button>
              ))}
            </div>

            <div className="flex gap-2 mb-6">
              <input type="text" value={activeSat} readOnly className="bg-slate-950 border border-slate-700 text-slate-300 font-mono text-sm p-2 w-1/2 focus:outline-none" />
              <input type="text" value={activeMetrics.pc} readOnly className={`bg-slate-950 border border-slate-700 font-mono text-sm p-2 w-1/4 focus:outline-none text-center ${activeMetrics.status === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`} />
              <div className="flex flex-col w-1/4 gap-1">
                <div className="text-[10px] text-slate-500 font-mono text-center border border-slate-700 bg-slate-900 py-1">{activeMetrics.tca}</div>
                <button className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold py-1 w-full transition-colors">TRANSMIT</button>
              </div>
            </div>

            <div className={`border rounded p-4 font-mono text-sm mb-6 leading-relaxed shadow-inner transition-colors duration-300 ${activeMetrics.status === 'CRITICAL' ? 'bg-[#0a0505] border-red-900/50 text-red-400' : 'bg-[#0a0a05] border-amber-900/50 text-amber-400'}`}>
              {">>"} ISTRAC NETRA detects incoming Space Debris (Obj #8832) on collision trajectory with {activeSat}. Probability of Collision (Pc): {activeMetrics.pc}. Time of Closest Approach (TCA): {activeMetrics.tca}. {activeMetrics.directive}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-auto">
              <div className="border border-slate-800 bg-slate-900/30 p-3">
                <h3 className="text-[10px] text-slate-500 font-mono tracking-widest mb-2 uppercase border-b border-slate-800 pb-1">Delta-V Protocol</h3>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                  {activeMetrics.status === 'CRITICAL' ? 'Execute prograde delta-V burn for radial separation.' : 'Maintain current orbital vector. No burn required.'}
                </p>
              </div>
              <div className="border border-slate-800 bg-slate-900/30 p-3">
                <h3 className="text-[10px] text-slate-500 font-mono tracking-widest mb-2 uppercase border-b border-slate-800 pb-1">Surface Link Status</h3>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                  {activeSat === 'INSAT-3DS' ? 'Warning: Cyclone DANA-II telemetry will be lost during maneuver.' : 'Ground station uplink signal strength nominal.'}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800">
              <button className="border border-emerald-900 text-emerald-500 bg-emerald-950/20 hover:bg-emerald-900/40 px-4 py-2 text-xs font-mono transition-colors">
                SIMULATE AVOIDANCE BURN
              </button>
              <button className={`${activeMetrics.status === 'CRITICAL' ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'} font-bold px-6 py-2 text-xs font-mono transition-colors`}>
                RE-PING TELEMETRY
              </button>
            </div>

=======
import OrbitalGlobe from '@/components/OrbitalGlobe';
import TelemetryTerminal from '@/components/TelemetryTerminal';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 flex flex-col gap-6">
      
      {/* Header */}
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-widest font-mono">
          ESVI <span className="text-slate-500">:: EARTH-SPACE VULNERABILITY INDEX</span>
        </h1>
        <div className="text-red-500 text-sm font-mono mt-1 animate-pulse">
          CONDITION: NOMINAL
        </div>
      </header>

      {/* 3-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
        
        {/* Left Column: Earth Map (Teammate's Zone) */}
        <div className="bg-black border border-slate-800 rounded flex items-center justify-center text-slate-600 font-mono">
          [ 2D TERRESTRIAL MAP RENDERING HERE ]
        </div>

        {/* Center Column: 3D Orbital Globe (Your Zone) */}
        <div className="h-full">
          <OrbitalGlobe />
        </div>

        {/* Right Column: Telemetry & AI (Your Zone) */}
        <div className="flex flex-col gap-6 h-full">
          <div className="h-1/2">
            <TelemetryTerminal />
          </div>
          <div className="h-1/2 bg-black border border-slate-800 rounded p-4 flex items-center justify-center text-slate-600 font-mono">
            [ Llama 3 PRIORITY TRANSMISSION FEED ]
>>>>>>> 19d606d48d6fabdba824bd02999675112e3036b7
          </div>
        </div>

      </div>
<<<<<<< HEAD
    </div>
=======
    </main>
>>>>>>> 19d606d48d6fabdba824bd02999675112e3036b7
  );
}