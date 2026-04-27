"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Plus,
  Search,
  MapPin,
  CreditCard,
  CheckCircle2,
  Filter,
  Users,
  Loader2,
  Trash2,
  ClipboardList,
} from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import AddCoordinatorModal from "./AddCoordinatorModal";
import AssignTaskModal from "./AssignTaskModal";
import { useSearchParams } from "next/navigation";

interface Coordinator {
  uid: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  tasksCompleted: number;
  skills: string[];
  zone: string;
  availability: string;
}

function CoordinatorsContent() {
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("s") || "";
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCoordinator, setSelectedCoordinator] = useState<Coordinator | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "coordinators"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setCoordinators(snap.docs.map(d => ({ uid: d.id, ...d.data() } as Coordinator)));
      setLoading(false);
    }, (err) => {
      console.error("Firestore error:", err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = coordinators.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.zone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (uid: string, name: string) => {
    if (!confirm(`Remove ${name} from coordinators? This only removes their profile, not their login.`)) return;
    setDeletingId(uid);
    try {
      await deleteDoc(doc(db, "coordinators", uid));
    } catch (err) {
      alert("Failed to remove coordinator.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team Coordinators</h1>
          <p className="text-text-secondary text-sm">Manage your field volunteers and their digital identification.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass px-5 py-2.5 rounded-2xl border border-white/5 text-center">
            <span className="text-lg font-black text-primary">{coordinators.length}</span>
            <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest">Total</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all"
          >
            <Plus className="w-5 h-5" /> Add New Coordinator
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow flex items-center gap-2 text-text-muted text-sm px-2">
          {searchTerm && (
            <span className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20 font-bold">
              Filtering by: "{searchTerm}"
            </span>
          )}
        </div>
        <button className="glass px-6 py-3 rounded-2xl flex items-center gap-2 font-medium hover:bg-white/5 transition-colors border border-white/5">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center glass rounded-3xl space-y-6">
          <Users className="w-16 h-16 text-white/5 mx-auto" />
          <div>
            <h3 className="text-xl font-bold mb-2">
              {searchTerm ? "No coordinators found" : "No coordinators yet"}
            </h3>
            <p className="text-text-muted text-sm max-w-xs mx-auto">
              {searchTerm
                ? "Try a different name or zone."
                : "Click 'Add New Coordinator' to onboard your first field volunteer."}
            </p>
          </div>
          {!searchTerm && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary rounded-2xl font-bold shadow-lg shadow-primary/30"
            >
              <Plus className="w-4 h-4" /> Add First Coordinator
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {filtered.map((worker, idx) => (
            <motion.div
              key={worker.uid}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card flex flex-col group h-full"
            >
              <div className="p-6 pb-4 border-b border-white/5">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 flex items-center justify-center font-bold text-primary text-lg">
                    {worker.name?.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </div>
                  <button
                    aria-label="Remove coordinator"
                    onClick={() => handleDelete(worker.uid, worker.name)}
                    disabled={deletingId === worker.uid}
                    className="p-2 text-text-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    {deletingId === worker.uid
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
                <h3 className="font-bold text-lg mb-1">{worker.name}</h3>
                <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase mb-3">{worker.id}</p>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    worker.availability === "online" ? "bg-emerald-400 animate-pulse" : "bg-white/20"
                  }`} />
                  <span className="text-xs font-medium capitalize">{worker.availability || "offline"}</span>
                </div>
              </div>

              <div className="p-6 pt-4 space-y-4 flex-grow">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-text-muted uppercase font-bold mb-1">Zone</p>
                    <p className="text-xs font-bold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-primary" /> {worker.zone || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted uppercase font-bold mb-1">Tasks</p>
                    <p className="text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-primary" /> {worker.tasksCompleted ?? 0} done
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-text-muted uppercase font-bold mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(worker.skills || []).slice(0, 3).map(s => (
                      <span key={s} className="px-2 py-0.5 glass rounded-full text-[9px] font-bold text-primary uppercase border border-primary/20">
                        {s}
                      </span>
                    ))}
                    {(worker.skills || []).length > 3 && (
                      <span className="px-2 py-0.5 glass rounded-full text-[9px] font-bold text-text-muted uppercase">
                        +{worker.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-white/5">
                <div className="flex gap-2">
                  <Link href={`/dashboard/ngo/coordinators/${worker.uid}`} className="flex-1">
                    <button title="View ID Card" className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 transition-all">
                      <CreditCard className="w-4 h-4" /> View ID
                    </button>
                  </Link>
                  <button 
                    onClick={() => {
                      setSelectedCoordinator(worker);
                      setShowAssignModal(true);
                    }}
                    className="flex-1 py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 transition-all border border-primary/20"
                  >
                    <ClipboardList className="w-4 h-4" /> Assign
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <AddCoordinatorModal
            onClose={() => setShowModal(false)}
            onSuccess={() => setShowModal(false)}
          />
        )}
        {showAssignModal && selectedCoordinator && (
          <AssignTaskModal
            coordinator={selectedCoordinator}
            onClose={() => setShowAssignModal(false)}
            onSuccess={() => {
              setShowAssignModal(false);
              alert("Task assigned successfully!");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CoordinatorsPage() {
  return (
    <Suspense fallback={<div className="py-24 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>}>
      <CoordinatorsContent />
    </Suspense>
  );
}
