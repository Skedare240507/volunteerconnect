"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Building2, Package, TrendingUp } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

export default function ImpactMetrics() {
  const [stats, setStats] = useState({
    ngos: 0,
    coordinators: 0,
    resources: 0,
    activeTasks: 0
  });

  useEffect(() => {
    // Listen to Users (NGOs & Coordinators)
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      let ngos = 0;
      let coords = 0;
      snap.docs.forEach((doc) => {
        const role = doc.data().role;
        if (role === "ngodashboard") ngos++;
        if (role === "coordinator") coords++;
      });
      setStats((prev) => ({ ...prev, ngos, coordinators: coords }));
    });

    // Listen to Resources
    const unsubResources = onSnapshot(collection(db, "resources"), (snap) => {
      let total = 0;
      let active = 0;
      snap.docs.forEach((doc) => {
        total++;
        if (doc.data().status === "pending") active++;
      });
      setStats((prev) => ({ ...prev, resources: total, activeTasks: active }));
    });

    return () => {
      unsubUsers();
      unsubResources();
    };
  }, []);

  return (
    <section className="px-6 py-20 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary font-bold text-sm tracking-widest uppercase mb-6">
            <TrendingUp className="w-4 h-4" /> Live Platform Impact
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Driving Global Coordination</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Our autonomous systems continuously align global non-profit resources with field coordinators, resulting in massive scaling of immediate aid distribution.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <MetricCard 
            icon={<Building2 className="w-6 h-6 text-blue-400" />} 
            count={stats.ngos} 
            label="Verified NGOs" 
            glowClass="bg-blue-400/50"
          />
          <MetricCard 
            icon={<Users className="w-6 h-6 text-emerald-400" />} 
            count={stats.coordinators} 
            label="Field Coordinators" 
            glowClass="bg-emerald-400/50"
          />
          <MetricCard 
            icon={<Package className="w-6 h-6 text-purple-400" />} 
            count={stats.resources} 
            label="Resources Dispatched" 
            glowClass="bg-purple-400/50"
          />
          <MetricCard 
            icon={<TrendingUp className="w-6 h-6 text-orange-400" />} 
            count={stats.activeTasks} 
            label="Active Missions" 
            glowClass="bg-orange-400/50"
          />
        </div>
      </div>
    </section>
  );
}

function MetricCard({ icon, count, label, glowClass }: { icon: any, count: number, label: string, glowClass: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass p-8 rounded-3xl border border-white/10 text-center relative overflow-hidden group hover:bg-white/5 transition-all"
    >
      <div 
        className={`absolute inset-x-0 -top-10 h-20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${glowClass}`}
      />
      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
        {icon}
      </div>
      <motion.h3 
        key={count}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-4xl md:text-5xl font-black mb-2 tracking-tighter"
      >
        {count}
      </motion.h3>
      <p className="text-text-muted text-sm font-bold uppercase tracking-widest">{label}</p>
    </motion.div>
  );
}
