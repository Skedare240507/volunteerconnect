"use client";

import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2, 
  Package, 
  Download, 
  Calendar, 
  Filter,
  Share2,
  PieChart,
  Activity,
  ChevronDown
} from "lucide-react";
import { useState } from "react";

export default function AdminAnalyticsPage() {
  const [timeframe, setTimeframe] = useState("This Month");

  const STATS = [
    { label: "Active Volunteers", value: "1,284", growth: "+12%", color: "primary" },
    { label: "Partner NGOs", value: "48", growth: "+4", color: "accent" },
    { label: "Aid Delivered", value: "14.2 Tons", growth: "+22%", color: "emerald-400" },
    { label: "System Uptime", value: "99.98%", growth: "Stable", color: "blue-400" },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Global Insight Panel</h1>
          <p className="text-text-secondary text-sm">Real-time meta-data analysis across all platform sectors.</p>
        </div>
        <div className="flex gap-2">
           <button className="glass px-4 py-3 rounded-xl border border-white/5 flex items-center gap-2 text-xs font-bold font-mono">
              <Calendar className="w-3.5 h-3.5" /> {timeframe} <ChevronDown className="w-3.5 h-3.5" />
           </button>
           <button title="Download Analytics Report" className="bg-primary text-white p-3 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              <Download className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-[2rem] border border-white/5 space-y-4 relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl" />
             <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{stat.label}</p>
             <div className="flex justify-between items-end">
                <h2 className="text-3xl font-black">{stat.value}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  stat.growth.startsWith('+') ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-text-muted bg-white/5 border-white/10'
                }`}>
                  {stat.growth}
                </span>
             </div>
             <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-2/3" />
             </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Placeholder */}
        <div className="lg:col-span-2 glass p-8 rounded-[2.5rem] border border-white/5 space-y-8">
           <div className="flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Growth Trajectory</h3>
              <div className="flex gap-4">
                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /><span className="text-[10px] font-bold text-text-muted uppercase">Coordinators</span></div>
                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-accent" /><span className="text-[10px] font-bold text-text-muted uppercase">NGOs</span></div>
              </div>
           </div>
           
           <div className="h-80 w-full flex items-end gap-3 px-4">
              {[45, 60, 35, 80, 55, 90, 70, 85, 40, 65, 50, 75].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col gap-2 group">
                   <div className="flex-1 bg-white/5 rounded-t-xl relative overflow-hidden flex flex-col justify-end">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.05 + 0.5, type: 'spring' }}
                        className="bg-gradient-to-t from-primary/80 to-primary group-hover:from-accent group-hover:to-accent transition-all duration-500"
                      />
                   </div>
                   <span className="text-[8px] font-black text-text-muted text-center uppercase tracking-tighter">M{i+1}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Side Panels */}
        <div className="space-y-8">
           <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6">
              <h3 className="font-bold flex items-center gap-2"><PieChart className="w-5 h-5 text-accent" /> SDG Focus</h3>
              <div className="space-y-4">
                 <SDGRow label="Zero Hunger" val="42%" color="bg-[#E5243B]" />
                 <SDGRow label="Good Health" val="28%" color="bg-[#4C9F38]" />
                 <SDGRow label="Quality Education" val="18%" color="bg-[#C5192D]" />
                 <SDGRow label="Clean Water" val="12%" color="bg-[#26BDE2]" />
              </div>
           </div>

           <div className="glass p-8 rounded-[2.5rem] border border-white/5 bg-primary/10">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-primary" />
                 </div>
                 <div>
                    <h4 className="font-bold">System Health</h4>
                    <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">All nodes operational</p>
                 </div>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                 API response time is average <span className="text-primary font-bold">124ms</span>. No critical failures detected in the last 24 cycles.
              </p>
              <button className="w-full mt-6 py-3 border border-primary/20 rounded-xl text-primary text-xs font-bold hover:bg-primary/10 transition-all flex items-center justify-center gap-2">
                 View Live Logs <Share2 className="w-3.5 h-3.5" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function SDGRow({ label, val, color }: { label: string, val: string, color: string }) {
   return (
      <div className="space-y-1.5">
         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
            <span className="text-text-secondary">{label}</span>
            <span className="text-white">{val}</span>
         </div>
         <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: val }}
               className={`h-full ${color}`}
            />
         </div>
      </div>
   );
}
