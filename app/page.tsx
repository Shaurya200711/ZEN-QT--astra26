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
          </div>
        </div>

      </div>
    </main>
  );
}