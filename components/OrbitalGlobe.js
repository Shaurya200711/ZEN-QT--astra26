'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

export default function OrbitalGlobe() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-slate-500 font-mono animate-pulse border border-slate-700 rounded">
        [SYS] INITIATING ORBITAL TRACKING ENGINE...
      </div>
    );
  }

  const gData = [
    { lat: 15.2, lng: 89.1, maxR: 0.5, color: '#22c55e', name: 'INSAT-3D' }, 
    { lat: 14.8, lng: 88.5, maxR: 0.2, color: '#ef4444', name: 'DEBRIS' }  
  ];

  return (
    <div className="w-full h-full cursor-move flex items-center justify-center bg-black border border-slate-700 rounded overflow-hidden">
      <Globe
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        backgroundColor="rgba(0,0,0,1)"
        pointsData={gData}
        pointAltitude={d => d.maxR}
        pointColor={d => d.color}
        pointRadius={0.5}
        pointsMerge={false}
        width={600}
        height={600}
      />
    </div>
  );
}