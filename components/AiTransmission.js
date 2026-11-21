'use client';
import { useState, useEffect } from 'react';

export default function AiTransmission() {
  const [briefing, setBriefing] = useState(
    'INITIALIZING LLAMA-3 CRISIS UPLINK... AWAITING TELEMETRY STREAM.'
  );
  const [loading, setLoading] = useState(false);

  const fetchCrisisBriefing = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt:
            'Generate a concise 3-line ISRO/NETRA Earth-Space Vulnerability priority transmission regarding Cyclone Dana-II (155 km/h near Bay of Bengal / SDSC SHAR) and LEO space debris conjunction #8832.',
        }),
      });
      const data = await res.json();
      const text =
        data.response ||
        data.message ||
        data.summary ||
        data.content ||
        (typeof data === 'string' ? data : JSON.stringify(data));
      setBriefing(text);
    } catch (err) {
      setBriefing(
        '[PRIORITY ALERT] CYCLONE DANA-II (155 KM/H) CAUSING 78% S-BAND ATTENUATION AT SDSC SHAR. RECOMMEND IMMEDIATE HANDOFF TO ISTRAC BENGALURU & ORBITAL MANEUVER CHECK FOR INSAT-3D.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrisisBriefing();
  }, []);

  return (
    <div className="h-full w-full bg-black border border-slate-700 rounded p-4 font-mono flex flex-col justify-between overflow-y-auto">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <span className="text-xs text-cyan-400 font-bold tracking-wider">
            ++ LLAMA-3 PRIORITY TRANSMISSION FEED ++
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/40 animate-pulse">
            {loading ? 'SYNCING...' : 'LIVE UPLINK'}
          </span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
          {briefing}
        </p>
      </div>

      <button
        onClick={fetchCrisisBriefing}
        disabled={loading}
        className="mt-3 self-end text-[11px] px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 transition cursor-pointer disabled:opacity-50"
      >
        {loading ? 'ANALYZING...' : 'REFRESH AI ASSESSMENT'}
      </button>
    </div>
  );
}