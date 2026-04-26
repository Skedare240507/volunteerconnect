"use client";

import { motion } from "framer-motion";
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Package, 
  Plus, 
  TrendingUp,
  Zap,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, limit, orderBy } from "firebase/firestore";
import LiveActivityFeed from "@/components/LiveActivityFeed";
import ExportDataButton from "@/components/ExportDataButton";
import { useAuth } from "@/lib/auth-context";

export default function NgoDashboardPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const searchTerm = (searchParams.get("s") || "").toLowerCase();
  
  const [stats, setStats] = useState([
    { label: "Active Resources", value: "...", icon: Package, change: "", color: "text-blue-400" },
    { label: "Assigned Tasks", value: "...", icon: Clock, change: "", color: "text-primary" },
    { label: "Resolved Today", value: "...", icon: CheckCircle2, change: "", color: "text-emerald-400" },
    { label: "Impact Score", value: "8.4", icon: TrendingUp, change: "+0.2 pts", color: "text-accent" },
  ]);
  const [priorityResources, setPriorityResources] = useState<any[]>([]);
  const [briefing, setBriefing] = useState({ briefing: "Generating situation report...", recommendation: "Waiting for AI..." });
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    // 1. Snapshot for Resources
    let qRes;
    try {
      qRes = query(collection(db, "resources"), orderBy("createdAt", "desc"), limit(10));
    } catch {
      qRes = query(collection(db, "resources"), limit(10));
    }

    const unsubRes = onSnapshot(qRes, (snap) => {
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPriorityResources(docs);
      
      const active = snap.docs.filter(d => {
        const s = d.data().status?.toLowerCase();
        return s === "open" || s === "matched" || s === "broadcasting" || s === "active";
      }).length;
      updateStat("Active Resources", active.toString());
    }, (err) => console.error("Res Snapshot Error:", err));

    // 2. Snapshot for Tasks
    const qTasks = query(collection(db, "tasks"));
    const unsubTasks = onSnapshot(qTasks, (snap) => {
      const assigned = snap.docs.filter(d => d.data().status === "assigned").length;
      const completed = snap.docs.filter(d => d.data().status === "completed").length;
      
      updateStat("Assigned Tasks", assigned.toString());
      updateStat("Resolved Today", completed.toString());
    });

    // 3. Snapshot for Activities
    const qAct = query(collection(db, "activities"), orderBy("timestamp", "desc"), limit(10));
    const unsubAct = onSnapshot(qAct, (snap) => {
      setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 4. Fetch AI Briefing
    fetch("/api/briefing")
      .then(res => res.json())
      .then(data => setBriefing(data))
      .catch(() => setBriefing({ 
        briefing: "System analysis temporarily unavailable. Direct monitoring active.", 
        recommendation: "Manual review of Hadapsar zone suggested." 
      }));

    return () => {
      unsubRes();
      unsubTasks();
      unsubAct();
    };
  }, []);

  const updateStat = (label: string, value: string) => {
    setStats(prev => prev.map(s => s.label === label ? { ...s, value } : s));
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">NGO Dashboard</h1>
          <p className="text-text-secondary">Welcome back. Here is what is happening across your zones today.</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportDataButton type="ngo" ngoId={user?.uid} />
          <Link href="/dashboard/ngo/resources/new">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-primary px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20"
            >
              <Plus className="w-5 h-5" /> Post New Resource
            </motion.button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-6 rounded-2xl border border-white/5"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded-full">{stat.change}</span>
              </div>
              <p className="text-text-secondary text-sm mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Gemini Daily Briefing */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles className="w-24 h-24" />
            </div>
            <div className="flex items-center gap-2 text-primary font-bold mb-4">
              <Zap className="w-5 h-5 fill-primary" />
              <span>Gemini AI Daily Briefing</span>
            </div>
            <h2 className="text-xl font-bold mb-3">{briefing.recommendation}</h2>
            <p className="text-text-secondary leading-relaxed mb-6">
              {briefing.briefing}
            </p>
            <button className="px-6 py-2 bg-white/10 rounded-full text-sm font-bold border border-white/10 hover:bg-white/20 transition-all">
              Mark as Read
            </button>
          </motion.div>

          {/* High Priority Resources Table */}
          <div className="glass rounded-3xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Recent Resource Requests</h3>
              <Link href="/dashboard/ngo/resources" className="text-primary text-sm font-medium hover:underline">View all</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-text-muted text-xs uppercase tracking-wider">
                    <th className="pb-4 px-2">Resource</th>
                    <th className="pb-4 px-2">Urgency</th>
                    <th className="pb-4 px-2">Score</th>
                    <th className="pb-4 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {priorityResources
                    .filter(res => 
                      !searchTerm || 
                      res.title?.toLowerCase().includes(searchTerm) || 
                      res.type?.toLowerCase().includes(searchTerm)
                    )
                    .map((res) => (
                    <tr key={res.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4 px-2">
                        <p className="font-bold text-sm">{res.title}</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-tighter">{res.type}</p>
                      </td>
                      <td className="py-4 px-2">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          res.urgency === 'High' || res.urgency >= 4 ? 'bg-red-400/10 text-red-400' : 'bg-amber-400/10 text-amber-400'
                        }`}>
                          {res.urgency || 'Normal'}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-xs font-bold">
                        {res.score || "8.5"}
                      </td>
                      <td className="py-4 px-2">
                        <span className="text-[10px] text-text-secondary">{res.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Activity */}
        <div className="glass rounded-3xl p-8 h-fit">
          <LiveActivityFeed maxItems={8} />
        </div>
      </div>
    </div>
  );
}

// Remove the local ActivityItem as we use the component now
