"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Users, 
  BarChart3, 
  Target, 
  Zap,
  Info
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

const data = [
  { name: "Mon", resources: 4, tasks: 2, impact: 8.2 },
  { name: "Tue", resources: 7, tasks: 5, impact: 8.5 },
  { name: "Wed", resources: 5, tasks: 8, impact: 8.9 },
  { name: "Thu", resources: 12, tasks: 10, impact: 9.1 },
  { name: "Fri", resources: 8, tasks: 7, impact: 8.8 },
  { name: "Sat", resources: 15, tasks: 14, impact: 9.4 },
  { name: "Sun", resources: 9, tasks: 8, impact: 9.0 },
];

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalResolved: 0,
    avgResponseTime: "42 min",
    activeCoordinators: 0,
    impactScore: 8.9
  });

  useEffect(() => {
    async function fetchData() {
      const qTasks = query(collection(db, "tasks"));
      const snap = await getDocs(qTasks);
      const docs = snap.docs.map(d => d.data());
      
      const resolved = docs.filter(d => d.status === "completed").length;
      
      const qCoords = query(collection(db, "coordinators"));
      const coordSnap = await getDocs(qCoords);
      
      setStats(prev => ({
        ...prev,
        totalResolved: resolved,
        activeCoordinators: coordSnap.size
      }));
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Impact Analytics</h1>
          <p className="text-text-secondary">Quantifying your contribution to community resilience.</p>
        </div>
        <div className="flex gap-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">
          <span>Updated: Just Now</span>
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse mt-1" />
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnalyticsStat 
          label="Total Resolved" 
          value={stats.totalResolved.toString()} 
          icon={<Target className="w-5 h-5" />} 
          color="text-primary" 
        />
        <AnalyticsStat 
          label="Avg Response" 
          value={stats.avgResponseTime} 
          icon={<Zap className="w-5 h-5" />} 
          color="text-amber-400" 
        />
        <AnalyticsStat 
          label="Active Help" 
          value={stats.activeCoordinators.toString()} 
          icon={<Users className="w-5 h-5" />} 
          color="text-blue-400" 
        />
        <AnalyticsStat 
          label="Impact Score" 
          value={stats.impactScore.toString()} 
          icon={<TrendingUp className="w-5 h-5" />} 
          color="text-accent" 
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Main Chart */}
        <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" /> Resource Resolution
              </h3>
              <p className="text-xs text-text-muted">Comparison between requested and resolved aid kits</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-primary" />
                 <span className="text-[10px] text-text-secondary">Requested</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-accent" />
                 <span className="text-[10px] text-text-secondary">Resolved</span>
               </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#AD6CFF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#AD6CFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888', fontSize: 10 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888', fontSize: 10 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A1121', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="resources" stroke="#AD6CFF" fillOpacity={1} fill="url(#colorRes)" />
                <Area type="monotone" dataKey="tasks" stroke="#00F0FF" fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Impact Trend */}
        <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-8">
           <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" /> AI Impact Trend
           </h3>
           <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 10 }} domain={[7, 10]} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0A1121', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
                <Line type="monotone" dataKey="impact" stroke="#00F0FF" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-4">
             <Info className="w-6 h-6 text-primary flex-shrink-0" />
             <p className="text-xs text-text-secondary leading-relaxed">
               Your impact score is <span className="text-white font-bold">14% higher</span> than the regional average. This is attributed to your rapid response time in the Hadapsar Sector.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsStat({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="glass p-6 rounded-3xl border border-white/5">
       <div className={`p-2 w-fit rounded-xl bg-white/5 mb-4 ${color}`}>
         {icon}
       </div>
       <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{label}</p>
       <h4 className="text-2xl font-black">{value}</h4>
    </div>
  );
}
