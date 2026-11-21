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
    </main>
  );
}