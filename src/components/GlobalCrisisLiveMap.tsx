"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import MapControl from "./MapControl";

export default function GlobalCrisisLiveMap() {
  const [markers, setMarkers] = useState<any[]>([]);

  useEffect(() => {
    const parseCoordinate = (val: any, fallback: number) => {
      const num = Number(val);
      return isNaN(num) || val === null || val === undefined || val === "" ? fallback : num;
    };

    const unsubscribe = onSnapshot(collection(db, "resources"), (snap) => {
      const activeMarkers = snap.docs.map((doc) => {
        const data = doc.data();
        if (data.location) {
          const lat = parseCoordinate(data.location.lat ?? data.location.latitude, 18.5204 + (Math.random() - 0.5) * 0.1);
          const lng = parseCoordinate(data.location.lng ?? data.location.longitude, 73.8567 + (Math.random() - 0.5) * 0.1);
          return {
            id: doc.id,
            lat,
            lng,
            title: data.title || "Resource Need",
            status: data.status || "pending",
            type: "resource"
          };
        }
        return null;
      }).filter(m => m !== null);
      
      setMarkers(activeMarkers as any);
    });

    return () => unsubscribe();
  }, []);

  return (
    <section className="px-6 py-20 bg-[#0A1628]/50 border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 pl-4 border-l-4 border-primary">
          <h2 className="text-3xl font-black mb-2 tracking-tight">Global Response Map</h2>
          <p className="text-text-secondary text-sm">Real-time view of humanitarian coordination zones</p>
        </div>
        
        <div className="h-[600px] w-full rounded-[2rem] overflow-hidden p-2 glass">
          <MapControl markers={markers} />
        </div>
      </div>
    </section>
  );
}
