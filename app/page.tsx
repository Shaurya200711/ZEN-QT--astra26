"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

export default function CommandCenter() {
  const [satellites, setSatellites] = useState<any[]>([]);
  const [disasters, setDisasters] = useState<any[]>([]);
  const [riskScore, setRiskScore] = useState(45);
  const [telemetryLogs, setTelemetryLogs] = useState([
    "[SYS] INITIALIZING ESVI NEXUS ENGINE...",
    "[SYS] AWAITING ORBITAL TELEMETRY..."
  ]);

  useEffect(() => {
    async function fetchTelemetry() {
      const { data: satData } = await supabase.from('satellites').select('*');
      if (satData) setSatellites(satData);

      const { data: disData } = await supabase.from('disasters').select('*');
      if (disData) setDisasters(disData);
    }
    fetchTelemetry();
  }, []);

  // Simulate scrolling telemetry feed for aesthetic effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryLogs(prev => {
        const newLogs = [...prev, `[SYS] SENSOR SWEEP NOMINAL - T+${Math.floor(Date.now() / 1000 % 10000)}`];
        return newLogs.slice(-5); // Keep only the last 5 logs
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const isConditionRed = riskScore > 75;

  return (
    <div className={`min-h-screen p-6 font-mono transition-colors duration-500 ${isConditionRed ? 'bg-red-950 text-red-400' : 'bg-black text-cyan-500'}`}>
      
      {/* HUD Header */}
      <header className={`mb-8 border-b pb-4 flex justify-between items-end ${isConditionRed ? 'border-red-500' : 'border-cyan-800'}`}>
        <div>
          <h1 className="text-4xl font-bold tracking-widest">ESVI COMMAND CENTER</h1>
          <p className="text-sm tracking-widest mt-1 opacity-75">EARTH-SPACE VULNERABILITY INDEX | ASTRA 2026</p>
        </div>
        <div className="text-right">
          <p className="text-xs tracking-widest mb-1">UNIFIED RISK SCORE</p>
          <p className={`text-5xl font-bold ${isConditionRed ? 'animate-pulse text-red-500' : 'text-green-500'}`}>
            {riskScore} <span className="text-xl opacity-50">/ 100</span>
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* DEV 1 ZONE: ORBITAL */}
        <div className={`border p-4 rounded-sm min-h-[350px] flex flex-col ${isConditionRed ? 'border-red-800' : 'border-cyan-900 bg-cyan-950/10'}`}>
          <h2 className="text-xl mb-4 tracking-wider border-b border-current pb-2">MODULE 2: ORBITAL VIEW</h2>
          <div className="flex-grow flex items-center justify-center border border-dashed border-current opacity-50 mb-4">
            <p>[ 3D GLOBE RENDER TARGET ]</p>
          </div>
          <div className="text-sm space-y-1">
            <p>STATUS: <span className="text-green-500">DB CONNECTED</span></p>
            <p>SATS TRACKED: {satellites.length}</p>
          </div>
        </div>

        {/* DEV 2 ZONE: TERRESTRIAL */}
        <div className={`border p-4 rounded-sm min-h-[350px] flex flex-col ${isConditionRed ? 'border-red-800' : 'border-cyan-900 bg-cyan-950/10'}`}>
          <h2 className="text-xl mb-4 tracking-wider border-b border-current pb-2">MODULE 1: TERRESTRIAL MAP</h2>
          <div className="flex-grow flex items-center justify-center border border-dashed border-current opacity-50 mb-4">
            <p>[ 2D TERRESTRIAL MAP RENDERING HERE ]</p>
          </div>
          <div className="text-sm space-y-1">
            <p>ACTIVE DISASTERS: {disasters.length}</p>
            <p>VULNERABILITY: ASSESSING...</p>
          </div>
        </div>

        {/* DEV 1 ZONE: TELEMETRY */}
        <div className={`border p-4 rounded-sm h-[250px] overflow-hidden ${isConditionRed ? 'border-red-800' : 'border-cyan-900 bg-cyan-950/10'}`}>
          <h2 className="text-xl mb-4 tracking-wider border-b border-current pb-2">MODULE 4: TELEMETRY TERMINAL</h2>
          <div className="text-xs space-y-2 opacity-80">
            {telemetryLogs.map((log, i) => (
              <p key={i}>{log}</p>
            ))}
            {satellites.length > 0 && (
              <p className="text-green-500 animate-pulse">[DB] SUPABASE SYNCED: {satellites.length} SATS, {disasters.length} STORMS</p>
            )}
          </div>
        </div>

        {/* DEV 2 ZONE: AI */}
        <div className={`border p-4 rounded-sm h-[250px] flex flex-col ${isConditionRed ? 'border-red-800' : 'border-cyan-900 bg-cyan-950/10'}`}>
          <h2 className="text-xl mb-4 tracking-wider border-b border-current pb-2">MODULE 3: AI DIRECTIVES (GROQ LLAMA 3)</h2>
          <p className="text-sm italic opacity-75 mt-2">
            "Awaiting orbital conjunction trigger to generate rescue impact assessment..."
          </p>
          <div className="mt-auto opacity-50 text-xs border-t border-dashed border-current pt-2">
            <p>[ PRIORITY TRANSMISSION FEED READY ]</p>
          </div>
        </div>
      </div>

      {/* Hidden test button */}
      <button 
        onClick={() => setRiskScore(prev => prev === 45 ? 85 : 45)}
        className="fixed bottom-4 right-4 text-xs border border-current px-2 py-1 opacity-20 hover:opacity-100 transition-opacity"
      >
        TEST: TOGGLE RISK LEVEL
      </button>

    </div>
  );
}