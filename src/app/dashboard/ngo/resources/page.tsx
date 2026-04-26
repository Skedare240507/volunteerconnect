"use client";

import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Users, 
  ChevronRight,
  Activity,
  CheckCircle2,
  AlertCircle,
  Trash2,
  UserPlus
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc, addDoc } from "firebase/firestore";
import ResourceImport from "@/components/ResourceImport";
import { AnimatePresence } from "framer-motion";

export default function ResourceInventoryPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [coordinators, setCoordinators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("s") || "";
  const [showImport, setShowImport] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen to resources
    const q = query(collection(db, "resources"), orderBy("createdAt", "desc"));
    const unsubRes = onSnapshot(q, (snap) => {
      setResources(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Firestore Error:", err);
      setError("Failed to load inventory. Please check database permissions or indexes.");
      setLoading(false);
    });

    // Listen to coordinators
    const unsubCoord = onSnapshot(collection(db, "coordinators"), (snap) => {
      setCoordinators(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      console.error("Coord Error:", err);
    });

    return () => {
      unsubRes();
      unsubCoord();
    };
  }, []);

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

  const handleAutoAssign = async (res: any) => {
    if (coordinators.length === 0) {
      alert("No active coordinators found to assign.");
      return;
    }

    // Find nearest
    const resLat = res.location?.lat || 18.5204;
    const resLng = res.location?.lng || 73.8567;

    let nearest = coordinators[0];
    let minDistance = Infinity;

    coordinators.forEach(coord => {
      const dist = calculateDistance(resLat, resLng, coord.location?.lat || 18.5204, coord.location?.lng || 73.8567);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = coord;
      }
    });

    if (confirm(`Assign to nearest coordinator: ${nearest.name} (~${minDistance.toFixed(1)}km away)?`)) {
      try {
        await updateDoc(doc(db, "resources", res.id), {
          status: 'assigned',
          assignedTo: nearest.id,
          assignedAt: new Date().toISOString()
        });

        await addDoc(collection(db, "tasks"), {
          coordinatorId: nearest.id,
          resourceId: res.id,
          title: res.title,
          location: res.locationName || 'Service Area',
          status: 'assigned',
          createdAt: new Date().toISOString()
        });

        alert(`Task successfully assigned to ${nearest.name}!`);
      } catch (err) {
        console.error("Auto-assign error:", err);
      }
    }
  };

  const filtered = useMemo(() => resources.filter(res => 
    res.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.locationName?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [resources, searchTerm]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Resource Inventory</h1>
          <p className="text-text-secondary text-sm">Monitor and manage all broadcasted needs across your service zones.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => setShowImport(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl font-bold hover:bg-white/10 transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Import Data
          </button>
          <Link href="/dashboard/ngo/resources/new" className="flex-1 md:flex-none">
            <button className="w-full flex items-center justify-center gap-2 bg-primary px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all text-sm">
              <Plus className="w-5 h-5" /> Broadcast Need
            </button>
          </Link>
        </div>
      </div>

      {/* ... stats card ... */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Active Broadcasts" value={resources.length.toString()} color="text-amber-400" />
        <StatCard label="Matched Needs" value={resources.filter(r => r.status === 'matched').length.toString()} color="text-emerald-400" />
        <StatCard label="Total Impact" value={(resources.reduce((acc: any, curr: any) => acc + (curr.affectedCount || 0), 0)).toLocaleString()} color="text-primary" />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {error && (
          <div className="w-full p-4 bg-red-400/10 border border-red-400/20 rounded-2xl text-red-400 text-sm font-medium flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}
        <div className="flex-grow flex items-center gap-2 text-text-muted text-sm px-2">
          {searchTerm && (
            <span className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20 font-bold">
              Filtering by: "{searchTerm}"
            </span>
          )}
        </div>
        <button title="Filter by Status" className="glass px-6 py-3 rounded-2xl flex items-center gap-2 font-medium border border-white/5">
          <Filter className="w-4 h-4" /> Filter Status
        </button>
      </div>

      {/* Resource Cards */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((res, i) => (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${
                      res.status === 'matched' 
                        ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' 
                        : 'bg-amber-400/10 border-amber-400/20 text-amber-400'
                    }`}>
                      {res.status || 'Broadcasting'}
                    </div>
                    <span className="text-[10px] text-text-muted font-bold flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> 
                      {res.createdAt?.toDate ? res.createdAt.toDate().toLocaleDateString() : 
                       res.createdAt && typeof res.createdAt === 'string' ? new Date(res.createdAt).toLocaleDateString() : 
                       'Available'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{res.title}</h3>
                    <p className="text-sm text-text-secondary mt-1 line-clamp-1">{res.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
                      <MapPin className="w-4 h-4 text-primary" /> {res.locationName || res.location || "On-site"}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
                      <Users className="w-4 h-4 text-primary" /> {res.affectedCount || res.affected || 0} Affected
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
                      <Activity className="w-4 h-4 text-primary" /> Urgency: {res.urgency || 3}/5
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 h-full">
                  <div className="hidden lg:block h-12 w-px bg-white/5" />
                  <div className="flex flex-col items-end gap-2 min-w-[150px]">
                    <div className="text-[10px] font-bold text-text-muted uppercase mb-1">AI Match Confidence</div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(res.aiScore || 85)}%` }}
                        className={`h-full ${res.aiScore > 90 ? 'bg-primary' : 'bg-accent'}`}
                      />
                    </div>
                    <span className="text-xs font-black text-text-secondary">{res.aiScore || 85}% Optimized</span>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {res.status === 'pending' && (
                      <button 
                        onClick={() => handleAutoAssign(res)}
                        title="Auto-Assign to Nearest" 
                        className="p-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-2xl transition-all border border-primary/20"
                      >
                        <UserPlus className="w-5 h-5" />
                      </button>
                    )}
                    <button 
                      onClick={async () => {
                        if (confirm("Are you sure you want to delete this broadcast?")) {
                          try {
                            await deleteDoc(doc(db, "resources", res.id));
                            alert("Broadcast deleted successfully.");
                          } catch (err) {
                            console.error("Delete error:", err);
                            alert("Failed to delete broadcast.");
                          }
                        }
                      }}
                      title="Delete Broadcast" 
                      className="p-4 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-2xl transition-all border border-white/5"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <Link href={`/dashboard/ngo/resources/${res.id}`}>
                      <button title="View Resource Details" className="p-4 bg-white/5 hover:bg-primary/20 hover:text-primary rounded-2xl transition-all border border-white/5 group-hover:scale-110">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center glass rounded-3xl space-y-6">
          <Activity className="w-16 h-16 text-white/5 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-bold">No resources found</h3>
            <p className="text-text-muted text-sm max-w-xs mx-auto">No broadcasts matching your criteria. Start by adding a new community need.</p>
          </div>
          <Link href="/dashboard/ngo/resources/new">
            <button className="px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/30">
              Create First Broadcast
            </button>
          </Link>
        </div>
      )}
      <AnimatePresence>
        {showImport && (
          <ResourceImport 
            onClose={() => setShowImport(false)}
            onComplete={() => {
              // Refresh or just let onSnapshot handle it
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="glass p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
      <div className={`text-4xl font-black mb-2 ${color}`}>{value}</div>
      <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{label}</p>
      <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform ${color}`}>
        <Activity className="w-20 h-20" />
      </div>
    </div>
  );
}
