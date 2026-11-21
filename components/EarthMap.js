import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function EarthMap({ disasters }) {
  return (
    <MapContainer 
      center={[16.5, 80.5]} 
      zoom={5} 
      style={{ height: '100%', width: '100%', background: '#0b1120' }}
      zoomControl={false}
    >
      {/* Dark Mode Base Map */}
      <TileLayer
        attribution="© Esri, HERE, Garmin, OpenStreetMap contributors"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
      />
      {/* Dark Mode Labels */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
      />

      {/* Render Active Cyclone Hazard Zones safely */}
      {disasters.map((storm) => {
        const lat = storm.lat ?? storm.latitude;
        const lng = storm.lng ?? storm.longitude;
        
        if (lat === undefined || lng === undefined) return null;

        return (
          <div key={storm.id || Math.random()}>
            {/* Eyewall Core (Red) */}
            <Circle 
              center={[lat, lng]}
              radius={80000} 
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.4 }} 
            />
            {/* Gale Wind Field (Orange) */}
            <Circle 
              center={[lat, lng]}
              radius={200000} 
              pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.15 }} 
            />
            {/* Outer Influence (Dashed/Faint) */}
            <Circle 
              center={[lat, lng]}
              radius={350000} 
              pathOptions={{ color: '#f59e0b', weight: 1, fillOpacity: 0.05 }} 
            >
              <Popup className="font-mono text-xs text-slate-800">
                <strong className="text-red-600 font-bold tracking-widest">
                  {(storm.type || 'STORM').toUpperCase()} {storm.id}
                </strong><br/>
                WIND: {storm.wind || 'Unknown'} km/h<br/>
                COMMS: 78% Signal Attenuation
              </Popup>
            </Circle>
          </div>
        );
      })}
      
      {/* ISRO Ground Station (Cyan) */}
      <Circle 
        center={[13.0, 80.2]} 
        radius={25000} 
        pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.8 }} 
      />
    </MapContainer>
  );
}