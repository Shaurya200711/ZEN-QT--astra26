import { MapContainer, TileLayer, CircleMarker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function ClickWatcher({ onSelectLocation }) {
  useMapEvents({
    click(e) {
      onSelectLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function EarthMap({ onSelectLocation, selectedCoords }) {
  return (
    <MapContainer center={[20, 0]} zoom={2} className="h-full w-full">
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenStreetMap &copy; CARTO"
      />
      <ClickWatcher onSelectLocation={onSelectLocation} />
      {selectedCoords && (
        <CircleMarker
          center={[selectedCoords.lat, selectedCoords.lng]}
          radius={10}
          pathOptions={{ color: "#22d3ee", fillColor: "#22d3ee", fillOpacity: 0.7 }}
        />
      )}
    </MapContainer>
  );
}