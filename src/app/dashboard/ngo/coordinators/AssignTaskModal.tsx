"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, ClipboardList, MapPin, Package, AlertCircle, Loader2, Calendar } from "lucide-react";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";

interface Props {
  coordinator: {
    uid: string;
    name: string;
    id: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignTaskModal({ coordinator, onClose, onSuccess }: Props) {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [priority, setPriority] = useState("medium");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location || !resourceType) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await addDoc(collection(db, "tasks"), {
        title,
        location,
        resourceType,
        quantity,
        priority,
        coordinatorId: coordinator.uid,
        coordinatorName: coordinator.name,
        coordinatorVCID: coordinator.id,
        ngoId: userData?.uid || "unknown",
        ngoName: userData?.name || userData?.displayName || "NGO",
        status: "assigned",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error assigning task:", err);
      setError(err.message || "Failed to assign task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-[#0F2137] border border-white/10 rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex justify-between items-center px-8 pt-8 pb-6 border-b border-white/5">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-3">
                <ClipboardList className="text-primary w-5 h-5" /> Assign Task
              </h2>
              <p className="text-xs text-text-muted mt-1">Assigning mission to {coordinator.name}</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-text-muted" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 space-y-5">
            {/* Task Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Mission Title *</label>
              <input
                required value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Food Distribution - Sector 4"
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:border-primary focus:outline-none transition-all"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Target Location *
              </label>
              <input
                required value={location} onChange={e => setLocation(e.target.value)}
                placeholder="Street address or zone"
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:border-primary focus:outline-none transition-all"
              />
            </div>

            {/* Resource Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                  <Package className="w-3 h-3" /> Resource Type *
                </label>
                <input
                  required value={resourceType} onChange={e => setResourceType(e.target.value)}
                  placeholder="e.g. Medical Kits"
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:border-primary focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Quantity</label>
                <input
                   value={quantity} onChange={e => setQuantity(e.target.value)}
                  placeholder="e.g. 50 units"
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:border-primary focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Priority Level</label>
              <div className="grid grid-cols-3 gap-3">
                {["low", "medium", "high"].map(p => (
                  <button
                    key={p} type="button" onClick={() => setPriority(p)}
                    className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-center transition-all ${
                      priority === p
                        ? p === "high" ? "bg-red-500/10 border-red-500 text-red-500" : p === "medium" ? "bg-amber-500/10 border-amber-500 text-amber-500" : "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                        : "bg-white/5 border-white/10 text-text-muted"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button" onClick={onClose}
                className="flex-1 py-3 glass rounded-2xl font-bold border border-white/10 hover:bg-white/5 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                type="submit" disabled={loading}
                className="flex-1 py-3 bg-primary rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardList className="w-4 h-4" />}
                {loading ? "Assigning..." : "Confirm Assignment"}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
