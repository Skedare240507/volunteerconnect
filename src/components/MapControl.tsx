"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamic import for Leaflet because it accesses 'window'
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

interface MapProps {
  markers: Array<{
    id: string;
    lat: number;
    lng: number;
    title: string;
    status: string;
    type?: 'resource' | 'coordinator';
    name?: string;
  }>;
  onAssign?: (coordinatorId: string) => void;
  onDelete?: (resourceId: string) => void;
}

export default function MapControl({ markers, onAssign, onDelete }: MapProps) {
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
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

  if (!isClient || !L) return <div className="h-full w-full bg-white/5 animate-pulse rounded-3xl" />;

  const center: [number, number] = [18.5204, 73.8567];

  return (
    <div className="h-full w-full rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative z-0">
      <MapContainer 
        center={center} 
        zoom={12} 
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", background: "#0A1628" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {markers.map((marker) => (
          <Marker key={`${marker.type}-${marker.id}`} position={[marker.lat, marker.lng]}>
            <Popup>
              <div className="p-1 min-w-[150px]">
                <h4 className="font-black text-gray-900 m-0 text-sm truncate">{marker.title}</h4>
                <div className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  marker.type === 'coordinator' ? 'bg-primary/10 text-primary' : 'bg-red-100 text-red-600'
                }`}>
                  {marker.type === 'coordinator' ? 'Coordinator' : 'Resource Need'}
                </div>
                <p className="text-xs text-gray-500 m-0 mt-2 line-clamp-2">{marker.status}</p>
                
                <div className="mt-4 flex flex-col gap-2">
                  {marker.type === 'coordinator' && onAssign && (
                    <button 
                      onClick={() => onAssign(marker.id)}
                      className="w-full py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:brightness-110 transition-all"
                    >
                      Assign Nearby Tasks
                    </button>
                  )}
                  {marker.type === 'resource' && onDelete && (
                    <button 
                      onClick={() => onDelete(marker.id)}
                      className="w-full py-1.5 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-600 transition-all"
                    >
                      Delete Requirement
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Overlay to style the zoom controls */}
      <style jsx global>{`
        .leaflet-container {
          background: #0A1628 !important;
        }
        .leaflet-bar a {
          background-color: #1a2c44 !important;
          color: white !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .leaflet-popup-content-wrapper {
          background: white !important;
          border-radius: 12px !important;
        }
        .leaflet-popup-tip {
          background: white !important;
        }
      `}</style>
    </div>
  );
}
