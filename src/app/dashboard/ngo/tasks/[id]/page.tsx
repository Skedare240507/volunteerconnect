"use client";

import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle2,
  Package,
  Activity,
  History,
  Navigation,
  ExternalLink
} from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "tasks", id as string), (doc) => {
      if (doc.exists()) {
        setTask({ id: doc.id, ...doc.data() });
      }
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!task) return (
    <div className="p-12 text-center space-y-4">
       <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto" />
       <h2 className="text-2xl font-bold">Mission Not Found</h2>
       <p className="text-text-muted">The task ID provided does not exist or has been removed.</p>
       <button onClick={() => router.back()} className="px-6 py-2 glass rounded-xl border border-white/10 font-bold">Return Home</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
           <button title="Go Back" onClick={() => router.back()} className="p-4 glass rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
              <ArrowLeft className="w-5 h-5" />
           </button>
           <div>
              <div className="flex items-center gap-3 mb-1">
                 <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest">Operation #{task.id.slice(0, 8)}</span>
                 <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                 <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live Monitoring</span>
              </div>
              <h1 className="text-3xl font-bold">{task.title}</h1>
           </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
           <button title="Cancel Operation" className="flex-1 md:flex-none px-6 py-4 glass rounded-2xl border border-white/5 font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/5 transition-all text-red-400">
              <AlertTriangle className="w-4 h-4" /> Cancel Operation
           </button>
           <button title="Force Mission Completion" className="flex-1 md:flex-none px-6 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Force Completion
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Tracking & Info */}
         <div className="lg:col-span-2 space-y-8">
            {/* Live Status Map Placeholder */}
            <div className="glass aspect-video rounded-[3rem] border border-white/5 relative overflow-hidden group">
               <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/73.8567,18.5204,13,0/800x450?access_token=pk.placeholder')] bg-cover grayscale hover:grayscale-0 transition-all duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
               
               {/* Pulse indicators on map */}
               <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-ping absolute -inset-0" />
                  <div className="w-12 h-12 bg-primary/40 rounded-full flex items-center justify-center relative border border-primary/50 backdrop-blur-sm">
                     <Navigation className="w-6 h-6 text-white rotate-45" />
                  </div>
               </div>

               <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                  <div className="glass-white p-4 rounded-2xl border border-white/20 backdrop-blur-xl">
                     <p className="text-[10px] font-black uppercase text-black/50 mb-1">Current Velocity</p>
                     <p className="text-xl font-black text-black">12.4 km/h <span className="text-xs font-normal opacity-60">E-Bike</span></p>
                  </div>
                  <div className="p-4 bg-primary text-white rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2">
                     <Clock className="w-4 h-4" /> ETA: 6 Minutes
                  </div>
               </div>
            </div>

            {/* Mission Logistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                  <h3 className="font-bold flex items-center gap-2"><Package className="w-5 h-5 text-primary" /> Manifest</h3>
                  <div className="space-y-4">
                     <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                           <Activity className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                           <p className="font-bold text-sm">{task.resourceType || 'Aid Package'}</p>
                           <p className="text-xs text-text-muted mt-1">{task.quantity || 'Bulk Distribution'}</p>
                        </div>
                     </div>
                     <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10">
                        <p className="text-[10px] font-black uppercase text-accent tracking-widest mb-1">Handling Requirements</p>
                        <p className="text-xs text-text-secondary leading-relaxed">Temperature-sensitive cargo. Ensure GPS lock is maintained throughout transit for impact audit.</p>
                     </div>
                  </div>
               </div>

               <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                  <h3 className="font-bold flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Deployed Personnel</h3>
                  <div className="space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center font-black text-xl text-primary border border-white/10">
                           {task.coordinatorName?.[0] || 'C'}
                        </div>
                        <div>
                           <h4 className="font-bold text-lg">{task.coordinatorName}</h4>
                           <p className="text-xs text-text-muted flex items-center gap-1 mt-1">
                              ID: VC-HCF-924 • <span className="text-emerald-400 font-bold uppercase">Active</span>
                           </p>
                        </div>
                     </div>
                     <div className="flex gap-3">
                        <button className="flex-1 py-3 glass rounded-xl border border-white/10 text-xs font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-all">
                           <Phone className="w-3.5 h-3.5 text-primary" /> Voice Call
                        </button>
                        <button className="flex-1 py-3 glass rounded-xl border border-white/10 text-xs font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-all">
                           <MessageSquare className="w-3.5 h-3.5 text-primary" /> Signal
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Sidebar - Timeline */}
         <div className="space-y-8">
            <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-8">
               <h3 className="font-bold flex items-center gap-2"><History className="w-5 h-5 text-accent" /> Operation Logs</h3>
               <div className="relative space-y-8 pl-6 border-l-2 border-white/5">
                  <LogItem 
                     time="14:20" 
                     title="Coordinator Accepted" 
                     desc="Transit initiated from South Warehouse via EV-Bike." 
                     active
                  />
                  <LogItem 
                     time="14:15" 
                     title="Broadcast Matched" 
                     desc="AI engine identified optimal route and relay personnel." 
                  />
                  <LogItem 
                     time="14:10" 
                     title="Dispatch Created" 
                     desc="Emergency aid request logged by NGO Admin." 
                  />
               </div>
            </div>

            <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6 text-center">
               <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-primary">
                  <ExternalLink className="w-8 h-8" />
               </div>
               <div>
                  <h4 className="font-bold">Public Monitoring Hash</h4>
                  <p className="text-[10px] font-mono text-text-muted break-all mt-2 p-2 bg-black/20 rounded-lg">
                     0x5f92a1...bc2190
                  </p>
               </div>
               <p className="text-[10px] text-text-secondary leading-relaxed px-4">
                  Immutable record of this mission is being synced to the transparency ledger.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

function LogItem({ time, title, desc, active = false }: { time: string, title: string, desc: string, active?: boolean }) {
   return (
      <div className="relative">
         <div className={`absolute -left-[1.85rem] top-0.5 w-3 h-3 rounded-full border-2 ${active ? 'bg-primary border-primary/20 shadow-[0_0_10px_rgba(33,150,243,0.5)]' : 'bg-white/10 border-transparent'}`} />
         <div className="space-y-1">
            <div className="flex justify-between items-baseline">
               <h5 className={`text-xs font-black uppercase tracking-widest ${active ? 'text-primary' : 'text-text-secondary'}`}>{title}</h5>
               <span className="text-[10px] font-bold text-text-muted">{time}</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed font-medium">{desc}</p>
         </div>
      </div>
   );
}
