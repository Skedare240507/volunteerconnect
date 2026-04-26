"use client";

import { motion } from "framer-motion";
import { 
  Package, 
  MapPin, 
  Clock, 
  ArrowRight, 
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";

export default function CoordinatorDashboard() {
  const { user, userData } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Use either the internal VC-ID or the Firebase UID
    const coordinatorId = userData?.id || user.uid;

    const q = query(
      collection(db, "tasks"),
      where("coordinatorId", "==", coordinatorId),
      where("status", "in", ["assigned", "in-progress"]),
      orderBy("status", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(fetchedTasks);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      setLoading(false);
    });

    // Query for completed tasks specifically for gamification
    const qCompleted = query(
      collection(db, "tasks"),
      where("coordinatorId", "==", coordinatorId),
      where("status", "==", "completed")
    );

    const unsubCompleted = onSnapshot(qCompleted, (snapshot) => {
      setCompletedCount(snapshot.size);
    }, (error) => {
      console.error("Error fetching completed tasks:", error);
    });

    return () => {
      unsubscribe();
      unsubCompleted();
    };
  }, [user, userData?.id]);

  const activeTask = tasks[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Your Tasks</h1>
        <div className="px-3 py-1 bg-emerald-400/10 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-400/20">
          Online
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeTask ? (
        <div className="space-y-6">
          {/* Active Task Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-primary border border-primary-dark shadow-xl shadow-primary/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-20">
              <Package className="w-20 h-20" />
            </div>
            
            <div className="flex items-center gap-2 text-white/80 font-bold text-xs uppercase tracking-widest mb-4">
              <AlertCircle className="w-4 h-4" /> 
              {activeTask.status === 'assigned' ? 'New Priority Task' : 'Task in Progress'}
            </div>
            
            <h2 className="text-2xl font-black text-white mb-2">{activeTask.title}</h2>
            <p className="text-white/80 text-sm mb-6 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {activeTask.location}
            </p>

            <div className="flex gap-3">
              <Link href={`/coordinator/tasks/${activeTask.id}`} className="flex-grow">
                <button className="w-full py-4 bg-white rounded-2xl text-primary font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-white/90 transition-all">
                  Open Task Details <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Workflow Placeholder */}
          <div className="glass p-6 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest text-center">Next Steps</h3>
            <div className="flex flex-col gap-3">
              <WorkflowButton 
                step="1" 
                label="Accept Task" 
                active={activeTask.status === 'assigned'} 
                completed={activeTask.status !== 'assigned'}
              />
              <WorkflowButton 
                step="2" 
                label="Start Travel" 
                active={activeTask.status === 'in-progress'}
                disabled={activeTask.status === 'assigned'} 
              />
              <WorkflowButton 
                step="3" 
                label="Verify Completion" 
                disabled={activeTask.status !== 'in-progress'} 
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-white/20" />
          </div>
          <p className="text-text-secondary font-medium italic">No pending tasks assigned.<br />You'll be notified when a match is found.</p>
        </div>
      )}

      {/* Gamified Impact Progress */}
      <div className="glass p-6 rounded-3xl border border-primary/20 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl pointer-events-none" />
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <span className="text-primary">Global Impact</span> Ranking
            </h3>
            <p className="text-[10px] text-text-muted mt-1">SDG Goal #2 & #3 Contributor</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            completedCount >= 10 ? "bg-amber-400/20 text-amber-400 border border-amber-400/30" : 
            completedCount >= 5 ? "bg-gray-300/20 text-gray-300 border border-gray-300/30" :
            "bg-orange-600/20 text-orange-500 border border-orange-600/30"
          }`}>
            {completedCount >= 10 ? "Gold Hero" : completedCount >= 5 ? "Silver Hero" : "Bronze Hero"}
          </div>
        </div>

        <div className="flex justify-between items-end mb-2">
          <span className="text-3xl font-black">{completedCount}</span>
          <span className="text-[10px] font-bold text-text-muted uppercase mb-1">
            {completedCount < 5 ? "Goal: 5" : completedCount < 10 ? "Goal: 10" : "Max Tier Reached!"}
          </span>
        </div>

        <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-3 relative">
          <motion.div 
            className={`h-full ${completedCount >= 10 ? "bg-amber-400" : completedCount >= 5 ? "bg-gray-300" : "bg-orange-500"}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((completedCount / (completedCount < 5 ? 5 : 10)) * 100, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <p className="text-[10px] text-text-secondary leading-relaxed">
          {completedCount >= 10 
            ? "Outstanding! You are a regional leader in humanitarian assistance." 
            : `Complete ${ (completedCount < 5 ? 5 : 10) - completedCount } more tasks to unlock your next UN SDG Hero Badge.`}
        </p>
      </div>
    </div>
  );
}

function WorkflowButton({ step, label, active, disabled, completed }: { step: string, label: string, active?: boolean, disabled?: boolean, completed?: boolean }) {
  return (
    <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
      active 
        ? "bg-primary/10 border-primary/40 text-primary" 
        : completed
          ? "bg-emerald-400/5 border-emerald-400/20 text-emerald-400 opacity-80"
          : disabled 
            ? "bg-white/5 border-white/5 text-text-muted opacity-50" 
            : "bg-white/5 border-white/10 text-white"
    }`}>
      <div className="flex items-center gap-4">
        <span className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center ${
          active ? "bg-primary text-white" : completed ? "bg-emerald-400 text-white" : "bg-white/10"
        }`}>
          {completed ? <CheckCircle2 className="w-3 h-3" /> : step}
        </span>
        <span className="text-sm font-bold">{label}</span>
      </div>
      {active && <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />}
    </div>
  );
}

// Missing import fix
import { CheckCircle2 } from "lucide-react";
