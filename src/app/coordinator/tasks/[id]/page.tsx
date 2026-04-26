"use client";

import { motion } from "framer-motion";
import { 
  Package, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  Camera, 
  AlertCircle,
  Phone,
  Navigation
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { logActivity } from "@/lib/activity";

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "tasks", id as string), (snap) => {
      if (snap.exists()) {
        setTask({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    if (!task) return;
    setCompleting(true);
    try {
      await updateDoc(doc(db, "tasks", task.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      await logActivity({
        user: "Field Coord",
        action: "Started task",
        target: task.title,
        type: "info"
      });
    } catch (error) {
      console.error(error);
    } finally {
      setCompleting(false);
    }
  };

  const handleCapture = async () => {
    if (!task) return;
    setVerifying(true);
    // Simulate upload delay
    setTimeout(async () => {
      try {
        await updateDoc(doc(db, "tasks", task.id), {
          verificationPhoto: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800",
          status: "completed",
          completedAt: serverTimestamp()
        });

        await logActivity({
          user: "Field Coord",
          action: "Verified & Completed task",
          target: task.title,
          type: "success"
        });

        router.push("/coordinator?completed=true");
      } catch (e) {
        console.error(e);
      } finally {
        setVerifying(false);
      }
    }, 1500);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!task) return <div className="p-8 text-center">Task not found.</div>;

  return (
    <div className="min-h-screen bg-background text-text-primary p-6 pb-32">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/coordinator" className="p-2 bg-white/5 rounded-xl">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold uppercase tracking-tight">Operation Details</h1>
      </div>

      <div className="space-y-8">
        {/* Status Badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          task.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-primary/10 text-primary'
        }`}>
          {task.status === 'assigned' ? <Clock className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {task.status}
        </div>

        {/* Title & Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-4xl font-black mb-4 leading-tight">{task.title}</h2>
          <div className="flex flex-col gap-4 text-text-secondary">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-tight">{task.location || task.locationName || "Pune Area"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <Package className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-tight">Impact: {task.affectedCount || 10} Families</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button className="flex flex-col items-center gap-3 p-6 glass rounded-3xl border border-white/5 hover:bg-white/10 active:scale-95 transition-all">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                <Navigation className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Navigate</span>
          </button>
          <button className="flex flex-col items-center gap-3 p-6 glass rounded-3xl border border-white/5 hover:bg-white/10 active:scale-95 transition-all">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                <Phone className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Contact NGO</span>
          </button>
        </div>

        {/* Verification Preview */}
        {task.verificationPhoto && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3"
          >
             <h3 className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em]">Verification Evidence</h3>
             <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-emerald-400/20">
                <img src={task.verificationPhoto} alt="Verification" className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-emerald-400 text-black p-1.5 rounded-full shadow-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
             </div>
          </motion.div>
        )}

        {/* Description */}
        <div className="glass p-8 rounded-[2rem] border border-white/5 space-y-4">
          <h3 className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em]">Briefing</h3>
          <p className="text-text-secondary leading-relaxed text-sm font-medium">
            {task.description || "Deploying emergency resources to the affected zone. Ensure proper check-in with local community leaders before distributing aid kits."}
          </p>
        </div>

        {/* Requirements */}
        <div className="glass p-8 rounded-[2rem] border border-white/5 space-y-6">
          <h3 className="text-[10px] font-black uppercase text-text-muted tracking-[0.2em]">Operational Checklist</h3>
          <div className="space-y-4">
            <CheckItem label="Arrive at coordination point" completed={task.status !== 'assigned'} />
            <CheckItem label="Distribute resources" completed={task.status === 'completed'} />
            <CheckItem label="Capture verification evidence" completed={task.status === 'completed'} />
          </div>
        </div>

        {/* Action Button Container */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/95 to-transparent z-50">
          <div className="max-w-md mx-auto">
            {task.status === 'assigned' ? (
              <button 
                onClick={() => updateStatus('in-progress')}
                disabled={completing}
                className="w-full py-5 bg-primary text-white rounded-[2rem] font-black uppercase tracking-[0.1em] text-sm shadow-2xl shadow-primary/40 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                {completing ? "Assigning..." : "Initiate Operation"}
              </button>
            ) : task.status === 'in-progress' ? (
              <button 
                onClick={handleCapture}
                disabled={verifying}
                className="w-full py-5 bg-emerald-500 text-white rounded-[2rem] font-black uppercase tracking-[0.1em] text-sm shadow-2xl shadow-emerald-500/40 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Camera className="w-5 h-5" />
                {verifying ? "Uploading Evidence..." : "Verify & Complete"}
              </button>
            ) : (
               <div className="w-full py-5 bg-white/5 text-emerald-400 border border-emerald-400/20 rounded-[2rem] font-black uppercase tracking-[0.1em] text-sm flex items-center justify-center gap-2">
                 <CheckCircle2 className="w-5 h-5" />
                 Operation Successful
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckItem({ label, completed }: { label: string, completed?: boolean }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
        completed ? 'bg-emerald-400 border-emerald-400 scale-110' : 'border-white/10 group-hover:border-white/30'
      }`}>
        {completed ? <CheckCircle2 className="w-3.5 h-3.5 text-black" /> : <div className="w-1.5 h-1.5 rounded-full bg-white/5" />}
      </div>
      <span className={`text-sm font-bold transition-colors ${completed ? 'text-text-primary' : 'text-text-muted'}`}>{label}</span>
    </div>
  );
}
