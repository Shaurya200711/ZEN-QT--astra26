'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Cyclone wind field telemetry (Bay of Bengal tracking)
const CYCLONE_ZONES = [
  {
    id: 'vardah-eyewall',
    name: 'CYCLONE DANA-II // EYEWALL CORE',
    windSpeed: '155 km/h (Cat-2)',
    uplinkDegradation: '78% Signal Attenuation',
    center: [13.65, 80.95],
    radius: 130000, // meters
    color: '#ef4444', // Red-500
    fillColor: '#dc2626',
    fillOpacity: 0.45,
  },
  {
    id: 'vardah-gale',
    name: 'CYCLONE DANA-II // OUTER GALE BAND',
    windSpeed: '92 km/h',
    uplinkDegradation: '41% Rain-Fade Loss',
    center: [14.1, 81.65],
    radius: 250000,
    color: '#f97316', // Orange-500
    fillColor: '#ea580c',
    fillOpacity: 0.26,
  },
  {
    id: 'shear-zone-b2',
    name: 'DEPRESSION B-04 // OVERLAPPING SHEAR',
    windSpeed: '68 km/h',
    uplinkDegradation: '24% Telemetry Jitter',
    center: [12.3, 82.1],
    radius: 200000,
    color: '#fb923c', // Orange-400
    fillColor: '#f97316',
    fillOpacity: 0.22,
  },
];

// ISRO Ground Telemetry & Launch Stations
const GROUND_STATIONS = [
  {
    id: 'shar',
    name: 'SDSC SHAR (Sriharikota)',
    role: 'Launch Complex & S-Band Tracking',
    status: 'WIND ADVISORY',
    center: [13.7199, 80.2304],
    radius: 35000,
    color: '#38bdf8', // Sky-400
  },
  {
    id: 'istrac',
    name: 'ISTRAC HQ (Bengaluru)',
    role: 'Mission Control & NETRA Core',
    status: 'NOMINAL',
    center: [13.0358, 77.5132],
    radius: 35000,
    color: '#22c55e', // Green-500
  },
];

// Inner map component that strictly executes in the browser
function LeafletMapCore() {
  const { MapContainer, TileLayer, Circle, Popup } = require('react-leaflet');
  const [selectedZone, setSelectedZone] = useState(CYCLONE_ZONES[0]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-lg overflow-hidden border border-slate-800 bg-slate-950 font-mono">
      {/* Scoped Leaflet CSS so layout.js / globals.css never need to be touched */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      {/* Top-Right Active Telemetry Inspector Card */}
      <div className="absolute top-3 right-3 z-[1000] max-w-[250px] bg-slate-950/90 backdrop-blur-sm border border-red-500/40 rounded p-2.5 text-[11px] text-slate-200 shadow-lg">
        <div className="text-[9px] text-red-400 uppercase tracking-wider mb-0.5">
          SELECTED SURFACE HAZARD
        </div>
        <div className="font-bold text-white truncate">{selectedZone.name}</div>
        <div className="mt-1 flex justify-between text-slate-400">
          <span>WIND:</span>
          <span className="text-orange-400 font-semibold">{selectedZone.windSpeed}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>COMMS:</span>
          <span className="text-red-400 font-semibold">{selectedZone.uplinkDegradation}</span>
        </div>
      </div>

      <MapContainer
        center={[13.2, 80.5]}
        zoom={6}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[420px] z-0"
        style={{ background: '#090d16' }}
      >
        {/* Keyless Esri Dark Gray Canvas Base + Labels */}
        <TileLayer
          attribution="&copy; Esri, HERE, Garmin, OpenStreetMap contributors"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
        />

        {/* Overlapping Red/Orange Cyclone Wind Fields */}
        {CYCLONE_ZONES.map((zone) => (
          <Circle
            key={zone.id}
            center={zone.center}
            radius={zone.radius}
            eventHandlers={{
              click: () => setSelectedZone(zone),
            }}
            pathOptions={{
              color: zone.color,
              fillColor: zone.fillColor,
              fillOpacity: zone.fillOpacity,
              weight: selectedZone.id === zone.id ? 3 : 1.5,
            }}
          >
            <Popup>
              <div className="text-xs font-mono text-slate-900">
                <strong>{zone.name}</strong>
                <br />
                Wind: {zone.windSpeed}
                <br />
                Impact: {zone.uplinkDegradation}
              </div>
            </Popup>
          </Circle>
        ))}

        {/* ISRO Ground Stations */}
        {GROUND_STATIONS.map((station) => (
          <Circle
            key={station.id}
            center={station.center}
            radius={station.radius}
            pathOptions={{
              color: station.color,
              fillColor: station.color,
              fillOpacity: 0.5,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-xs font-mono text-slate-900">
                <strong>{station.name}</strong>
                <br />
                {station.role}
                <br />
                Status: {station.status}
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>

      {/* Bottom HUD Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded text-[11px] text-slate-300 flex items-center gap-3 pointer-events-none">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Cyclone Core
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          Gale Field
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          ISRO Ground Node
        </span>
      </div>
    </div>
  );
}

// Dynamic wrapper with SSR disabled
const DynamicLeafletMap = dynamic(() => Promise.resolve(LeafletMapCore), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] flex items-center justify-center bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-400">
      INITIALIZING SURFACE TELEMETRY LAYER...
    </div>
  ),
});

export default function EarthMap() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full min-h-[420px] flex items-center justify-center bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-400">
        INITIALIZING SURFACE TELEMETRY LAYER...
      </div>
    );
  }

  return <DynamicLeafletMap />;
}