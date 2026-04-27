"use client";

import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Globe2, Users2, Zap } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const stats = [
  { label: "Resources Allocated", value: "45k+", icon: Zap, color: "text-primary" },
  { label: "Active NGOs", value: "120+", icon: Globe2, iconColor: "text-blue-400" },
  { label: "Field Coordinators", value: "8.2k+", icon: Users2, iconColor: "text-accent" },
  { label: "Impact Score", value: "98%", icon: BarChart3, iconColor: "text-emerald-400" },
];

const sdgs = [
  { id: 1, name: "No Poverty", color: "bg-[#E5243B]" },
  { id: 3, name: "Good Health", color: "bg-[#4C9F38]" },
  { id: 10, name: "Reduced Inequalities", color: "bg-[#DD1367]" },
  { id: 17, name: "Partnerships", color: "bg-[#19486A]" },
];

export default function Hero() {
  const { user, userData, loading } = useAuth();
  const userName = userData?.name || user?.displayName || "";

  return (
    <section className="relative pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* SDG Badges */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          {!loading && user && (
            <span className="bg-primary/20 text-primary text-[10px] uppercase font-bold px-4 py-1.5 rounded-full border border-primary/30 shadow-[0_0_15px_rgba(29,185,117,0.3)] animate-pulse">
              Logged in successfully as {userName}
            </span>
          )}
          {sdgs.map((sdg) => (
            <span key={sdg.id} className={`${sdg.color} text-[10px] uppercase font-bold px-3 py-1 rounded-full text-white shadow-sm`}>
              SDG {sdg.id}
            </span>
          ))}
        </motion.div>

        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
        >
          {user ? <>Empowering your <span className="text-primary">Impact</span></> : <>Smart <span className="text-primary">Resource</span> <br className="hidden md:block" /> Allocation Platform</>}
        </motion.h1>

        {/* Sub-headline */}
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-text-secondary max-w-2xl mb-12"
        >
          {user 
            ? `Welcome back, ${userName.split(' ')[0]}. You've contributed to ${stats[0].value} allocations. Let's continue coordinating aid for those who need it most.`
            : "Bridging the gap between NGO resources and ground-level needs using AI-powered matching and real-time coordinator coordination."
          }
        </motion.p>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 mb-20"
        >
          {user ? (
            <Link href={
              userData?.role === 'admin' || userData?.role === 'superadmin' ? '/dashboard/admin' : 
              userData?.role === 'ngodashboard' ? '/dashboard/ngo' : 
              userData?.role === 'coordinator' ? '/coordinator' : '/'
            }>
              <button className="w-full sm:w-auto px-10 py-5 bg-primary rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/30 hover:scale-105 transition-all">
                Access Mission Control <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <button className="w-full sm:w-auto px-8 py-4 bg-primary rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1">
                  Join as NGO <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/register">
                <button className="w-full sm:w-auto px-8 py-4 glass rounded-2xl font-bold hover:bg-white/10 transition-all">
                  Be a Coordinator
                </button>
              </Link>
            </>
          )}
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full"
        >
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="glass-card p-6 flex flex-col items-center">
                <div className={`p-3 rounded-xl bg-white/5 mb-4 ${stat.iconColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-text-secondary">{stat.label}</div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
