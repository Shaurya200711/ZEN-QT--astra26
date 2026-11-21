<<<<<<< HEAD
import EarthMap from '@/components/EarthMap';
import AiTransmission from '@/components/AiTransmission';

export default function Dev2ZonePreview() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 font-mono">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 border-b border-slate-800 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white tracking-wider">
              EARTH-SPACE VULNERABILITY INDEX // DEV 2 ZONE PREVIEW
            </h1>
            <p className="text-xs text-slate-400">
              Isolated test route (/dev2) — app/page.js remains untouched
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
            ZONE ISOLATED
          </span>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[460px]">
          <EarthMap />
          <AiTransmission />
        </div>
      </div>
=======
"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { analyzeCoordinates } from "@/lib/analyzeLocation";

const EarthMap = dynamic(() => import("@/components/EarthMap"), { ssr: false });

export default function Dev2Dashboard() {
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleMapClick = async (coords) => {
    setSelectedCoords(coords);
    setLoading(true);
    setAnalysis(null);

    try {
      const answer = await analyzeCoordinates(coords);
      setAnalysis(answer);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black text-white">
      <EarthMap onSelectLocation={handleMapClick} selectedCoords={selectedCoords} />

      {selectedCoords && (
        <aside className="absolute bottom-6 left-6 z-[1000] w-96 rounded-xl border border-cyan-500/40 bg-zinc-950/90 p-5">
          <div className="flex justify-between font-mono text-xs text-cyan-400">
            <span>{analysis?.region || "SCANNING..."}</span>
            <span>{selectedCoords.lat.toFixed(1)}°, {selectedCoords.lng.toFixed(1)}°</span>
          </div>

          {loading ? (
            <p className="mt-3 text-sm text-zinc-400 animate-pulse">
              Asking the AI brain...
            </p>
          ) : analysis ? (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">{analysis.primaryThreat}</span>
                <span className="rounded bg-red-500/20 px-2 py-1 font-mono text-xs text-red-400">
                  DANGER: {analysis.riskScore}/100
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Space Storm Risk: <strong className="text-white">{analysis.spaceWeatherExposure}</strong>
              </p>
              <p className="text-sm text-zinc-300">{analysis.summary}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-red-400">Oops! Check your GROQ_API_KEY.</p>
          )}
        </aside>
      )}
>>>>>>> 19d606d48d6fabdba824bd02999675112e3036b7
    </main>
  );
}