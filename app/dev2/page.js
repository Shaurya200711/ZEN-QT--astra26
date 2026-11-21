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
    </main>
  );
}