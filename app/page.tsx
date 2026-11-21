"use client";

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '../utils/supabase';

// Dynamically import map/globe components
const OrbitalGlobe = dynamic(() => import('../components/OrbitalGlobe'), { ssr: false });
const EarthMap = dynamic(() => import('../components/EarthMap'), { ssr: false });

const LEO_SWARM = Array.from({ length: 450 }, (_, i) => ({
  id: `SWARM-${i}`,
  name: `LEO-NODE-${i}`,
  alt: Math.random() * 1200 + 200, 
  lat: (Math.random() - 0.5) * 180,
  lng: (Math.random() - 0.5) * 360,
}));

const HERO_SATS = [
  { id: 1, name: 'CARTOSAT-3', alt: 509, lat: 13.0, lng: 80.2 },
  { id: 2, name: 'RISAT-2BR1', alt: 576, lat: 15.5, lng: 75.0 },
  { id: 3, name: 'INSAT-3DS', alt: 35786, lat: 0, lng: 82.0 },
  { id: 4, name: 'CHANDRAYAAN-3', alt: 150, lat: -12.5, lng: 60.1 },
];

// Pre-defined AI Assessments for the LLAMA-3 Terminal
const AI_ASSESSMENTS = [
  "[PRIORITY ALERT] CYCLONE DANA-II (155 KM/H) CAUSING 78% S-BAND ATTENUATION AT SDSC SHAR. RECOMMEND IMMEDIATE HANDOFF TO ISTRAC BENGALURU & ORBITAL MANEUVER CHECK FOR INSAT-3D.",
  "[UPDATE] DEBRIS OBJ #8832 TRAJECTORY SHIFT DETECTED. COLLISION PROBABILITY (Pc) REDUCED TO 1.05e-5. NO FURTHER MANEUVERS REQUIRED AT THIS TIME.",
  "[SYSTEM ALERT] HIGH SOLAR FLARE ACTIVITY DETECTED. EXPECT TEMPORARY L-BAND DEGRADATION ACROSS INDIAN SUBCONTINENT FOR THE NEXT 4 HOURS.",
  "[ANALYSIS] CARTOSAT-3 IMAGING OF CYCLONE DANA-II IMPACT ZONES COMPLETE. 45GB RAW SYNTHETIC APERTURE RADAR DATA QUEUED FOR DOWNLINK."
];

// Pool of random telemetry logs to feed into the ISRO terminal
const LOG_POOL = [
  { type: "TELEM", color: "text-cyan-600", msg: "INSAT-3D ORBITAL PARAMETERS STABLE. GYROS NOMINAL." },
  { type: "SYS", color: "text-slate-600", msg: "PERFORMING ROUTINE BACKGROUND HANDSHAKE WITH NETRA..." },
  { type: "NETRA", color: "text-emerald-600", msg: "TRACKING 454 LEO OBJECTS. DEBRIS FIELD STATUS: GREEN." },
  { type: "TELEM", color: "text-cyan-600", msg: "RISAT-2BR1 SAR PAYLOAD CALIBRATION COMPLETE." },
  { type: "WEATHER", color: "text-amber-600", msg: "CYCLONE DANA-II GUSTS EXCEEDING 160 KM/H AT PARADIP COAST." },
  { type: "HANDOFF", color: "text-purple-600", msg: "COMM LINK SECURED VIA BYALALU DEEP SPACE NETWORK." }
];

export default function CommandCenter() {
  const [satellites, setSatellites] = useState<any[]>([...LEO_SWARM, ...HERO_SATS]);
  const [disasters, setDisasters] = useState<any[]>([
    { id: 'DANA-II', type: 'Cyclone', lat: 13.5, lng: 82.5, wind: 155, category: 2 }
  ]);
  
  const [currentTime, setCurrentTime] = useState("");
  const [activeSat, setActiveSat] = useState('INSAT-3DS');
  const [burnStatus, setBurnStatus] = useState<'idle' | 'executing' | 'cleared'>('idle');

  // New State for Live Terminals
  const [isroLogs, setIsroLogs] = useState([
    { time: "22:46:37 UTC", type: "TELEM", color: "text-cyan-600", msg: "CARTOSAT-3 ALT: 509.2 KM // VEL: 7.61 KM/S // NOMINAL" },
    { time: "22:46:39 UTC", type: "NETRA", color: "text-emerald-600", msg: "OBJ #8832 RELATIVE VELOCITY: 14.2 KM/S // MISS DIST: 180 M" },
    { time: "22:46:42 UTC", type: "WEATHER", color: "text-amber-600", msg: "CYCLONE DANA-II CORE PRESSURE: 968 HPA // GUSTS 155 KM/H" },
    { time: "22:46:44 UTC", type: "HANDOFF", color: "text-purple-600", msg: "SDSC SHAR -> ISTRAC BENGALURU BACKUP RELAY STANDBY" }
  ]);
  const [aiFeedIndex, setAiFeedIndex] = useState(0);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  
  // FIX: Using a ref on the scrollable container itself rather than the bottom element
  const terminalScrollRef = useRef<HTMLDivElement>(null);

  const conjunctionMetrics: Record<string, { pc: string, tca: string, status: string, directive: string }> = {
    'CARTOSAT-3': { 
      pc: '1.24e-4', tca: '42m 10s', status: 'WARNING', 
      directive: 'Debris pass nominal. Minimal impact on surface imaging expected.' 
    },
    'RISAT-2BR1': { 
      pc: '3.05e-3', tca: '12m 05s', status: 'ELEVATED', 
      directive: 'Prepare for potential maneuver. Radar imaging may be briefly interrupted.' 
    },
    'INSAT-3DS': { 
      pc: '9.42e-2', tca: '04m 12s', status: 'CRITICAL', 
      directive: 'Immediate delta-V burn required to dodge Obj #8832.' 
    },
    'CHANDRAYAAN-3': { 
      pc: '7.65e-2', tca: '19m 40s', status: 'CRITICAL', 
      directive: 'Radial miss distance critical. Immediate prograde burn required.' 
    }
  };

  // Clock Update
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + " IST");
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live ISRO Terminal Log Generator
  useEffect(() => {
    const logInterval = setInterval(() => {
      const now = new Date();
      const timeString = now.toISOString().substring(11, 19) + " UTC";
      const randomLog = LOG_POOL[Math.floor(Math.random() * LOG_POOL.length)];
      
      setIsroLogs(prevLogs => {
        const newLogs = [...prevLogs, { time: timeString, ...randomLog }];
        return newLogs.slice(-15); 
      });
    }, 3500); 

    return () => clearInterval(logInterval);
  }, []);

  // FIX: Isolated container scrolling so the main page stays perfectly still
  useEffect(() => {
    if (terminalScrollRef.current) {
      terminalScrollRef.current.scrollTo({
        top: terminalScrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [isroLogs]);

  const activeMetrics = conjunctionMetrics[activeSat] || conjunctionMetrics['INSAT-3DS'];

  const executeAvoidance = () => {
    setBurnStatus('executing');
    setTimeout(() => {
      setBurnStatus('cleared');
    }, 3000); 
  };

  useEffect(() => {
    setBurnStatus('idle');
  }, [activeSat]);

  // Handle LLAMA-3 Refresh
  const handleRefreshAI = () => {
    if (isAiProcessing) return;
    setIsAiProcessing(true);
    setTimeout(() => {
      setAiFeedIndex(prev => (prev + 1) % AI_ASSESSMENTS.length);
      setIsAiProcessing(false);
    }, 1500);
  };

  return (
    <>
      {/* 3D SATURN BACKGROUND CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .space-bg {
          background-color: #02040a;
          background-image: 
            radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)), 
            radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)), 
            radial-gradient(3px 3px at 50px 160px, #ddd, rgba(0,0,0,0)), 
            radial-gradient(2px 2px at 90px 40px, #fff, rgba(0,0,0,0)), 
            radial-gradient(2px 2px at 130px 80px, #fff, rgba(0,0,0,0));
          background-size: 200px 200px;
          animation: pan-stars 150s linear infinite;
        }
        
        .saturn-container {
          perspective: 1200px;
          transform-style: preserve-3d;
        }
        
        .saturn-planet {
          background: radial-gradient(circle at 30% 30%, #334155 0%, #0f172a 40%, #020617 80%, #000 100%);
          box-shadow: inset -30px -30px 60px rgba(0,0,0,0.9), 0 0 40px rgba(14, 165, 233, 0.1);
          transform: translate(-50%, -50%);
          animation: float-planet 20s ease-in-out infinite;
        }

        .saturn-rings-wrapper {
          transform: translate(-50%, -50%) rotateX(75deg) rotateY(-20deg);
          transform-style: preserve-3d;
          animation: float-planet 20s ease-in-out infinite;
        }

        .ring {
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .ring-inner {
          width: 800px; height: 800px;
          border: 2px solid rgba(14, 165, 233, 0.3);
          border-left: 2px dashed rgba(14, 165, 233, 0.6);
          box-shadow: 0 0 30px rgba(14, 165, 233, 0.1), inset 0 0 30px rgba(14, 165, 233, 0.1);
          animation: spin-debris 60s linear infinite;
        }

        .ring-outer {
          width: 950px; height: 950px;
          border: 1px dotted rgba(56, 189, 248, 0.4);
          box-shadow: 0 0 40px rgba(56, 189, 248, 0.1), inset 0 0 40px rgba(56, 189, 248, 0.1);
          animation: spin-debris 90s linear infinite reverse;
        }
        
        .ring-dust {
          width: 1100px; height: 1100px;
          border: 10px solid rgba(2, 6, 23, 0.5);
          box-shadow: 0 0 80px rgba(14, 165, 233, 0.05);
        }

        @keyframes pan-stars {
          0% { background-position: 0 0; }
          100% { background-position: -400px -400px; }
        }
        @keyframes float-planet {
          0%, 100% { margin-top: 0px; }
          50% { margin-top: -25px; }
        }
        @keyframes spin-debris {
          0% { transform: translate(-50%, -50%) rotateZ(0deg); }
          100% { transform: translate(-50%, -50%) rotateZ(360deg); }
        }

        /* Custom minimal scrollbar for terminal */
        .terminal-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .terminal-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .terminal-scroll::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.3);
          border-radius: 3px;
        }
      `}} />

      {/* FIXED 3D ANIMATED BACKGROUND */}
      <div className="fixed inset-0 z-[-1] space-bg overflow-hidden pointer-events-none saturn-container">
        {/* Saturn Sphere */}
        <div className="absolute top-1/2 left-1/2 saturn-planet w-[500px] h-[500px] rounded-full z-10"></div>
        {/* 3D Tilted Rings Wrapper */}
        <div className="absolute top-1/2 left-1/2 saturn-rings-wrapper w-full h-full z-20">
          <div className="ring ring-inner"></div>
          <div className="ring ring-outer"></div>
          <div className="ring ring-dust"></div>
        </div>
      </div>

      {/* FOREGROUND UI */}
      <div className="min-h-screen relative z-30 p-6 font-sans text-slate-300">
        
        {/* HEADER PANEL */}
        <header className="bg-[#040814]/80 backdrop-blur-md border border-cyan-900/50 shadow-[0_0_30px_rgba(6,182,212,0.1)] rounded-xl p-5 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-widest text-cyan-400 flex items-center gap-3 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
              EARTH-SPACE VULNERABILITY INDEX
            </h1>
            <p className="text-sm font-mono tracking-widest mt-1 text-slate-500 uppercase">Astra 2026 // Unified Nexus</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-cyan-950/40 border border-cyan-500/50 text-cyan-400 px-4 py-2 text-sm font-mono flex items-center gap-2 rounded-sm shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_#22d3ee]"></div>
              UPLINK ACTIVE
            </div>
          </div>
        </header>

        {/* MAIN TOP GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN: VISUALIZATIONS */}
          <div className="flex flex-col gap-8">
            
            {/* ORBITAL GLOBE */}
            <div className="bg-[#040814]/80 backdrop-blur-md border border-cyan-900/50 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-[400px]">
              <div className="bg-slate-950/80 border-b border-cyan-900/50 p-3 px-5 flex justify-between items-center">
                <span className="text-xs font-mono text-slate-400">MODULE 2 // ORBITAL KINEMATICS</span>
                <span className="text-xs font-mono text-cyan-500">SATS TRACKED: 454</span>
              </div>
              <div className="flex-grow relative bg-black cursor-move">
                <OrbitalGlobe satellites={satellites} />
              </div>
            </div>

            {/* TERRESTRIAL MAP */}
            <div className="bg-[#040814]/80 backdrop-blur-md border border-cyan-900/50 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-[400px]">
               <div className="bg-slate-950/80 border-b border-cyan-900/50 p-3 px-5 flex justify-between items-center">
                <span className="text-xs font-mono text-slate-400">MODULE 1 // TERRESTRIAL HAZARD MAP</span>
                <span className="text-xs font-mono text-red-500 animate-pulse">ACTIVE: CYCLONE DANA-II</span>
              </div>
              <div className="flex-grow relative bg-slate-950">
                <EarthMap disasters={disasters} />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: AI UPLINK & DEBRIS AVOIDANCE */}
          <div className="flex flex-col gap-8">
            <div className="bg-[#040814]/80 backdrop-blur-md border border-cyan-900/50 rounded-xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.6)] flex flex-col relative overflow-hidden">
              
              {/* Sci-Fi Satellite Graphic */}
              <div className="absolute top-4 right-6 opacity-30 pointer-events-none">
                  <svg viewBox="0 0 100 100" className="w-32 h-32 animate-[spin_30s_linear_infinite]">
                    <rect x="20" y="40" width="20" height="20" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                    <rect x="60" y="40" width="20" height="20" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                    <rect x="40" y="30" width="20" height="40" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                    <circle cx="50" cy="50" r="4" fill="#ef4444" className="animate-ping" />
                  </svg>
              </div>

              <div className="flex justify-between items-center mb-6 relative z-10">
                <h2 className="font-bold text-xl flex items-center gap-2 text-slate-100 font-mono">
                  <div className="w-3 h-3 bg-cyan-500 rounded-sm shadow-[0_0_10px_#06b6d4]"></div>
                  AI CRISIS RESPONSE
                </h2>
                <span className="text-cyan-400 font-mono text-sm bg-cyan-950/30 px-3 py-1 border border-cyan-800/50 rounded-sm">{currentTime}</span>
              </div>

              {/* Satellite Selection Tabs */}
              <div className="grid grid-cols-4 gap-2 mb-6 relative z-10">
                {['CARTOSAT-3', 'RISAT-2BR1', 'INSAT-3DS', 'CHANDRAYAAN-3'].map((btn) => (
                  <button 
                    key={btn}
                    onClick={() => setActiveSat(btn)}
                    className={`text-[10px] sm:text-xs font-mono py-3 transition-all rounded-sm border ${
                      activeSat === btn 
                        ? 'bg-cyan-900/60 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                        : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {btn}
                  </button>
                ))}
              </div>

              {/* Live Terminal */}
              <div className="bg-black/60 border border-slate-800 rounded-lg p-5 mb-6 relative z-10 shadow-inner">
                <h3 className="text-[10px] font-mono text-slate-500 mb-2 uppercase tracking-widest border-b border-slate-800 pb-2">Telemetry Feed</h3>
                <p className="font-mono text-sm leading-relaxed text-slate-300">
                  <span className={`${activeMetrics.status === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`}>
                    {">> "} {activeMetrics.status === 'CRITICAL' ? 'WARNING:' : 'NOTICE:'}
                  </span> Space Debris (Obj #8832) tracking relative to {activeSat}.<br/><br/>
                  <span className="text-slate-500">Pc:</span> {activeMetrics.pc} <br/>
                  <span className="text-slate-500">TCA:</span> {activeMetrics.tca} <br/>
                  <span className="text-cyan-400 mt-2 block">{">"} {activeMetrics.directive}</span>
                </p>
              </div>

              {/* Interactive Debris Avoidance System */}
              <div className="border border-slate-800 rounded-lg p-5 bg-slate-900/40 relative z-10">
                <h3 className="text-[10px] font-mono text-slate-500 mb-4 uppercase tracking-widest text-center">Thruster Control Override</h3>
                
                {burnStatus === 'idle' && (
                  <button 
                    onClick={executeAvoidance}
                    disabled={activeMetrics.status !== 'CRITICAL'}
                    className={`w-full py-4 text-xs font-mono tracking-widest rounded-sm border transition-all ${
                      activeMetrics.status === 'CRITICAL' 
                        ? 'bg-red-950/80 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:bg-red-900 hover:text-white' 
                        : 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {activeMetrics.status === 'CRITICAL' ? 'INITIATE DELTA-V BURN' : 'NO THREAT DETECTED'}
                  </button>
                )}

                {burnStatus === 'executing' && (
                  <div className="w-full py-4 bg-orange-950/80 border border-orange-500 text-orange-400 text-center text-xs font-mono tracking-widest rounded-sm animate-pulse shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                    FIRING THRUSTERS... ADJUSTING ORBITAL VECTOR
                  </div>
                )}

                {burnStatus === 'cleared' && (
                  <div className="w-full py-4 bg-emerald-950/80 border border-emerald-500 text-emerald-400 text-center text-xs font-mono tracking-widest rounded-sm shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    TRAJECTORY CLEARED. DEBRIS AVOIDED.
                  </div>
                )}
              </div>
            </div>

            {/* SCROLL DOWN EXPLANATION MENU */}
            <div className="bg-[#040814]/80 backdrop-blur-md border border-cyan-900/50 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-64">
               <div className="bg-slate-950/80 border-b border-cyan-900/50 p-3 px-5 sticky top-0 z-10">
                <span className="text-xs font-mono text-cyan-500 uppercase tracking-widest">System Documentation // Read Out</span>
              </div>
              <div className="p-6 overflow-y-auto font-sans font-light text-sm text-slate-400 space-y-5">
                <div>
                  <h4 className="font-bold text-slate-200 mb-1 font-mono text-xs text-cyan-400">1. Orbital Kinematics (3D Globe)</h4>
                  <p>This module tracks over 450 Low Earth Orbit (LEO) satellites and space debris objects in real-time. It provides immediate visual context of where our critical assets are located relative to impending space threats.</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 mb-1 font-mono text-xs text-cyan-400">2. Terrestrial Hazard Map</h4>
                  <p>Simultaneously maps ground-level disasters (e.g., Cyclone DANA-II). The rings indicate wind speed categories and communication signal attenuation zones, allowing us to see which areas rely on the satellites above.</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 mb-1 font-mono text-xs text-cyan-400">3. Automated Debris Avoidance</h4>
                  <p>When the system detects a high Probability of Collision (Pc), the AI Crisis Response terminal calculates a thruster maneuver (Delta-V burn). Clicking the protocol overrides shifts the satellite out of the debris path, saving the asset.</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 mb-1 font-mono text-xs text-cyan-400">4. The ESVI Connection</h4>
                  <p>The Earth-Space Vulnerability Index proves that saving a satellite from debris isn't just about the satellite—it's about ensuring uninterrupted communication and imaging for the people surviving the cyclone on the ground below.</p>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* BOTTOM ROW: LIVE TERMINALS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          
          {/* ISRO COMMAND TERMINAL (LIVE FEED) */}
          <div className="bg-[#040814]/80 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col h-64">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
              <span className="text-emerald-400 font-mono text-xs font-bold tracking-widest uppercase">ISRO COMMAND TERMINAL_v2.0</span>
              <span className="bg-red-950/50 border border-red-800 text-red-500 px-2 py-1 text-[10px] font-mono tracking-widest animate-pulse">STREAM ACTIVE</span>
            </div>
            {/* FIX: Using ref here to scroll strictly within this container */}
            <div 
              ref={terminalScrollRef}
              className="flex-grow overflow-y-auto font-mono text-[10px] sm:text-xs text-slate-400 space-y-3 pr-2 terminal-scroll"
            >
              {isroLogs.map((log, index) => (
                <p key={index}>
                  <span className="text-slate-500">{log.time}</span> <span className={log.color}>[{log.type}]</span> {log.msg}
                </p>
              ))}
              <p className="opacity-50 flex gap-2">
                <span className="text-slate-500">AWAITING TELEMETRY</span>
                <span className="animate-pulse">...</span>
              </p>
            </div>
          </div>

          {/* LLAMA-3 PRIORITY FEED (INTERACTIVE) */}
          <div className="bg-[#040814]/80 backdrop-blur-md border border-cyan-900/50 rounded-xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col h-64">
            <div className="flex justify-between items-center border-b border-cyan-900/50 pb-3 mb-4">
              <span className="text-cyan-400 font-mono text-xs font-bold tracking-widest uppercase">++ LLAMA-3 PRIORITY TRANSMISSION FEED ++</span>
              <span className="bg-red-950/50 border border-red-800 text-red-500 px-2 py-1 text-[10px] font-mono tracking-widest">LIVE UPLINK</span>
            </div>
            
            <div className={`flex-grow font-mono text-[10px] sm:text-xs leading-relaxed uppercase transition-opacity duration-300 ${isAiProcessing ? 'text-slate-500' : 'text-slate-300'}`}>
              {isAiProcessing ? (
                <div className="flex flex-col gap-2">
                  <span className="text-cyan-600 animate-pulse">[PROCESSING] CONNECTING TO NETRA MAINFRAME...</span>
                  <span className="text-cyan-600 animate-pulse delay-75">[PROCESSING] ANALYZING RECENT TELEMETRY...</span>
                </div>
              ) : (
                AI_ASSESSMENTS[aiFeedIndex]
              )}
            </div>
            
            <div className="flex justify-end mt-auto pt-4">
              <button 
                onClick={handleRefreshAI}
                disabled={isAiProcessing}
                className="bg-cyan-950/40 border border-cyan-800 text-cyan-400 hover:bg-cyan-900 hover:text-white px-4 py-2 text-[10px] font-mono tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAiProcessing ? 'ANALYZING...' : 'REFRESH AI ASSESSMENT'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}