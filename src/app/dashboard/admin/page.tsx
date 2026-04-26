"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Building2, 
  Package, 
  Activity, 
  Map as MapIcon, 
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Bot,
  RefreshCw
} from "lucide-react";
import LiveActivityFeed from "@/components/LiveActivityFeed";
import ExportDataButton from "@/components/ExportDataButton";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";

export default function AdminMissionControl() {
  const [stats, setStats] = useState([
    { label: "Active NGOs", value: "...", icon: Building2, trend: "Verifying...", color: "text-accent" },
    { label: "Resources Allocated", value: "...", icon: Package, trend: "Live Feed", color: "text-blue-400" },
    { label: "Total Coordinators", value: "...", icon: Activity, trend: "Syncing...", color: "text-emerald-400" },
    { label: "Platform Health", value: "94.2%", icon: MapIcon, trend: "Optimal", color: "text-purple-400" },
  ]);

  const [aiReport, setAiReport] = useState<{briefing: string, recommendation: string} | null>(null);
  const [isGeneratingAILog, setIsGeneratingAILog] = useState(false);

  const generateAIReport = async () => {
    setIsGeneratingAILog(true);
    try {
      const res = await fetch("/api/briefing");
      if (res.ok) {
        const data = await res.json();
        setAiReport(data);
      }
    } catch(err) {
      console.error(err);
    }
    setIsGeneratingAILog(false);
  };


  useEffect(() => {
    // Listen to NGOs
    const unsubNgo = onSnapshot(collection(db, "ngos"), (snap) => {
      updateStat("Active NGOs", snap.size.toString());
    });

    // Listen to Resources
    const unsubRes = onSnapshot(collection(db, "resources"), (snap) => {
      updateStat("Resources Allocated", snap.size.toString());
    });

    // Listen to Coordinators
    const unsubCoord = onSnapshot(collection(db, "coordinators"), (snap) => {
      updateStat("Total Coordinators", snap.size.toString());
    });

    return () => {
      unsubNgo();
      unsubRes();
      unsubCoord();
    };
  }, []);

  const updateStat = (label: string, value: string) => {
    setStats(prev => prev.map(s => s.label === label ? { ...s, value } : s));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Actions */}
      <div className="flex justify-end">
        <ExportDataButton type="admin" />
      </div>

      {/* AI Situation Report */}
      <div className="glass rounded-[2rem] p-8 border border-purple-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-2xl">
              <Bot className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Global AI Situation Report</h3>
              <p className="text-xs text-text-muted">Gemini evaluates active resources to form operational intelligence.</p>
            </div>
          </div>
          <button 
            onClick={generateAIReport}
            disabled={isGeneratingAILog}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-full text-xs font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]"
          >
            {isGeneratingAILog ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Generate Report"}
          </button>
        </div>
        
        {aiReport ? (
          <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="space-y-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-sm font-medium leading-relaxed">
                <span className="font-bold text-purple-400 mr-2">Oversight:</span> 
                {aiReport.briefing}
              </p>
            </div>
            <div className="p-4 bg-accent/10 rounded-xl border border-accent/20">
              <p className="text-sm font-medium leading-relaxed">
                <span className="font-bold text-accent mr-2">Recommendation:</span> 
                {aiReport.recommendation}
              </p>
            </div>
          </motion.div>
        ) : (
          <p className="text-sm text-text-muted italic">Click generate to run a deep analysis on current platform logistics.</p>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-[10px] bg-white/5 px-2 py-1 rounded-full text-text-muted font-bold group-hover:text-white">
                  {stat.trend}
                </div>
              </div>
              <p className="text-text-secondary text-sm font-medium mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-3">
                <h3 className="text-3xl font-black">{stat.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* NGO Approval Queue */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass rounded-[2rem] p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold">Registration Queue</h3>
                <p className="text-xs text-text-muted">Verification required for platform onboarding</p>
              </div>
              <Link href="/dashboard/admin/approvals">
                <button className="text-xs font-bold text-accent hover:underline">View All Requests</button>
              </Link>
            </div>

            <div className="space-y-4">
              {/* This section will now lead to the approvals page */}
              <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                <p className="text-sm text-text-muted mb-4 font-medium">New partnership requests are waiting for your review.</p>
                <Link href="/dashboard/admin/approvals">
                  <button className="px-6 py-2 bg-accent text-white rounded-full text-xs font-bold shadow-lg shadow-accent/20">
                    Process Approvals
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* System Health / API Monitoring */}
          <div className="glass rounded-[2rem] p-8 border border-accent/10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" /> System Health
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <HealthMetric label="Gemini API" status="Optimal" latency="450ms" />
              <HealthMetric label="Firestore" status="Optimal" latency="12ms" />
              <HealthMetric label="Global CDN" status="Slow" latency="4.2s" warning />
            </div>
          </div>
        </div>

        {/* Sidebar Activity */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass rounded-[2rem] p-8 bg-gradient-to-br from-accent/10 to-transparent">
            <LiveActivityFeed maxItems={12} title="Global Alerts" />
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthMetric({ label, status, latency, warning }: { label: string, status: string, latency: string, warning?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] text-text-muted font-bold uppercase tracking-tighter">{label}</p>
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${warning ? "bg-red-400 animate-pulse" : "bg-emerald-400 shadow-[0_0_8px_#34d399]"}`} />
        <span className="text-sm font-black">{status}</span>
      </div>
      <p className="text-[10px] text-text-secondary">{latency}</p>
    </div>
  );
}
