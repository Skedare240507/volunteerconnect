"use client";

import { motion } from "framer-motion";
import { Search, Filter, MapPin, Layers, Info } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";

const MapControl = dynamic(() => import("@/components/MapControl"), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-white/5 animate-pulse rounded-3xl" />
});

export default function ResourceMapPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [coordinators, setCoordinators] = useState<any[]>([]);

  useEffect(() => {
    // Listen to resources
    const unsubRes = onSnapshot(collection(db, "resources"), (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setResources(data);
    });

    // Listen to coordinators
    const unsubCoord = onSnapshot(collection(db, "coordinators"), (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCoordinators(data);
    });

    return () => {
      unsubRes();
      unsubCoord();
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Delete this requirement?")) {
      try {
        await deleteDoc(doc(db, "resources", id));
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleAssignNearby = async (coordId: string) => {
    const coord = coordinators.find(c => c.id === coordId);
    if (!coord) return;

    const nearbyResources = resources.filter(res => {
      if (res.status !== 'pending') return false;
      const resLat = parseCoordinate(res.location?.lat ?? res.location?.latitude, 18.5204);
      const resLng = parseCoordinate(res.location?.lng ?? res.location?.longitude, 73.8567);
      const coordLat = parseCoordinate(coord.location?.lat ?? coord.location?.latitude, 18.5204);
      const coordLng = parseCoordinate(coord.location?.lng ?? coord.location?.longitude, 73.8567);
      return calculateDistance(resLat, resLng, coordLat, coordLng) < 5; // 5km radius
    });

    if (nearbyResources.length === 0) {
      alert("No pending tasks found within 5km of this coordinator.");
      return;
    }

    if (confirm(`Assign ${nearbyResources.length} nearby tasks to ${coord.name}?`)) {
      try {
        const promises = nearbyResources.map(async (res) => {
          // Update Resource
          await updateDoc(doc(db, "resources", res.id), {
            status: 'assigned',
            assignedTo: coordId,
            assignedAt: new Date().toISOString()
          });

          // Create Task for the coordinator
          await addDoc(collection(db, "tasks"), {
            coordinatorId: coordId,
            resourceId: res.id,
            title: res.title,
            location: res.locationName || 'Nearby Area',
            status: 'assigned',
            createdAt: new Date().toISOString(),
            description: res.description || `Assigned task for ${res.title}`
          });
        });

        await Promise.all(promises);
        alert("Tasks assigned and synced with coordinator dashboard!");
      } catch (err) {
        console.error("Assignment error:", err);
        alert("Failed to assign tasks.");
      }
    }
  };

  const parseCoordinate = (val: any, fallback: number) => {
    const num = Number(val);
    return isNaN(num) || val === null || val === undefined || val === "" ? fallback : num;
  };

  const resourceMarkers = resources.map(res => ({
    id: res.id,
    lat: parseCoordinate(res.location?.lat ?? res.location?.latitude, 18.5204 + (Math.random() - 0.5) * 0.1),
    lng: parseCoordinate(res.location?.lng ?? res.location?.longitude, 73.8567 + (Math.random() - 0.5) * 0.1),
    title: res.title || 'Unknown Resource',
    type: 'resource' as const,
    status: res.status
  })).filter(m => m.lat !== undefined && m.lng !== undefined);

  const coordinatorMarkers = coordinators.map(coord => ({
    id: coord.id,
    lat: parseCoordinate(coord.location?.lat ?? coord.location?.latitude, 18.5204 + (Math.random() - 0.5) * 0.1),
    lng: parseCoordinate(coord.location?.lng ?? coord.location?.longitude, 73.8567 + (Math.random() - 0.5) * 0.1),
    title: coord.name || 'Unknown Coordinator',
    type: 'coordinator' as const,
    status: coord.status
  })).filter(m => m.lat !== undefined && m.lng !== undefined);

  const allMarkers = [...resourceMarkers, ...coordinatorMarkers];

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Resource Heatmap</h1>
          <p className="text-text-secondary text-sm">Real-time visualization of community needs and coordinator density.</p>
        </div>
        <div className="flex gap-3">
          <button className="glass px-6 py-3 rounded-2xl flex items-center gap-2 font-medium border border-white/5">
            <Layers className="w-4 h-4" /> Layers
          </button>
          <button className="bg-primary px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter Area
          </button>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-4 gap-8 min-h-0">
        {/* Map Container */}
        <div className="lg:col-span-3 glass rounded-3xl relative overflow-hidden border border-white/5">
          <MapControl 
            markers={allMarkers} 
            onAssign={handleAssignNearby}
            onDelete={handleDelete}
          />
          
          {/* Legend Overlay */}
          <div className="absolute top-6 right-6 z-[1000] p-4 glass rounded-2xl border border-white/10 space-y-3">
            <h4 className="text-xs font-bold text-text-secondary uppercase">Legend</h4>
            <div className="space-y-2">
              <LegendItem color="bg-red-500" label="Resource (Need)" />
              <LegendItem color="bg-primary" label="Coordinator (Live)" />
              <LegendItem color="bg-emerald-500" label="Active Hub" />
            </div>
          </div>
        </div>

        {/* Sidebar Alerts */}
        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" /> Active Clusters
          </h3>
          <div className="space-y-4">
            {resources.length > 0 ? (
              resources.slice(0, 5).map((res) => (
                <motion.div 
                  key={res.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <p className="text-sm font-bold truncate">{res.title}</p>
                  <div className="flex items-center gap-2 text-[10px] text-text-muted mt-2 uppercase">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {res.locationName || 'Unknown Loc'}
                    </span>
                    <span>•</span>
                    <span className="text-primary font-bold">{res.affectedCount} Affected</span>
                  </div>
                </motion.div>
              ))
            ) : (
                <div className="text-center py-8 text-text-muted text-sm">No active clusters detected</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-[10px] font-bold">{label}</span>
    </div>
  );
}
