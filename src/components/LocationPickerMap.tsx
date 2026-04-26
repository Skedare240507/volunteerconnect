"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import react-leaflet components to avoid window is not defined
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

// Wrapper for internal logic that uses map events
function LocationMarker({ onLocationSelect, L }: { onLocationSelect: (lat: number, lng: number, address: string) => void, L: any }) {
  const [position, setPosition] = useState<any>(null);
  
  // We have to import useMapEvents dynamically too or check for it
  const [UseMapEvents, setUseMapEvents] = useState<any>(null);

  useEffect(() => {
    import("react-leaflet").then((mod) => setUseMapEvents(() => mod.useMapEvents));
  }, []);

  if (!UseMapEvents) return null;

  return <MapEventsHandler UseMapEvents={UseMapEvents} setPosition={setPosition} onLocationSelect={onLocationSelect} position={position} Marker={Marker} />;
}

function MapEventsHandler({ UseMapEvents, setPosition, onLocationSelect, position, Marker }: any) {
  UseMapEvents({
    click(e: any) {
      setPosition(e.latlng);
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
        .then(res => res.json())
        .then(data => {
          onLocationSelect(e.latlng.lat, e.latlng.lng, data.display_name || "");
        })
        .catch(() => {
          onLocationSelect(e.latlng.lat, e.latlng.lng, `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`);
        });
    },
  });

  return position === null ? null : <Marker position={position} />;
}

export default function LocationPickerMap({ onLocationSelect }: LocationPickerProps) {
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
      const DefaultIcon = leaflet.default.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      leaflet.default.Marker.prototype.options.icon = DefaultIcon;
    });
  }, []);

  if (!L) return <div className="h-48 w-full bg-white/5 animate-pulse rounded-2xl" />;

  return (
    <div className="h-48 w-full rounded-2xl overflow-hidden border border-white/10 relative z-0">
      <MapContainer 
        center={[18.5204, 73.8567]} 
        zoom={12} 
        style={{ height: "100%", width: "100%", background: "#0A1628" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <LocationMarker onLocationSelect={onLocationSelect} L={L} />
      </MapContainer>
      <style jsx global>{`
        .leaflet-container {
          background: #0A1628 !important;
        }
      `}</style>
    </div>
  );
}
