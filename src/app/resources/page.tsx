"use client";

import { motion } from "framer-motion";
import { HandHelping, Activity, Zap, Globe, Users, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

export default function PublicResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "resources"), orderBy("createdAt", "desc"), limit(12));
    const unsubscribe = onSnapshot(q, (snap) => {
      setResources(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -top-24 -left-24 w-96 h-96" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6 mt-10">
              Community <span className="text-primary italic">Needs</span> & Support
            </h1>
            <p className="text-text-secondary text-lg mb-8 leading-relaxed">
              Explore active resource requests and recovery efforts across our global network. 
              VolunteerConnect bridges the gap between field specialists and aiding NGOs.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register">
                <button className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/30 hover:scale-105 transition-all">
                  Sign up to Help
                </button>
              </Link>
              <Link href="/about">
                <button className="px-8 py-4 glass text-white rounded-2xl font-bold border border-white/10 hover:bg-white/5 transition-all">
                  Our Mission
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Active Needs Grid */}
      <section className="px-6 py-20 pb-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-[2px] bg-primary" />
            <span className="text-sm font-black uppercase tracking-widest text-primary">Live Resource Feed</span>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {resources.map((res, i) => (
                <motion.div
                  key={res.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass p-8 rounded-[2rem] border border-white/5 hover:border-primary/20 hover:bg-white/5 transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-tighter text-text-muted">
                      {res.type || "Resource"}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-3">{res.title}</h3>
                  <p className="text-text-secondary text-sm mb-6 line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>

                  <div className="space-y-3 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
                      <MapPin className="w-4 h-4 text-primary" /> {res.locationName || "Various Districts"}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
                      <Users className="w-4 h-4 text-primary" /> Approx {res.affectedCount || 0} People Affected
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass p-20 text-center rounded-[3rem] border border-white/5">
              <Globe className="w-16 h-16 text-white/5 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-2">The world is calm.</h3>
              <p className="text-text-muted max-w-sm mx-auto">
                No active relief broadcasts found at this moment. Stay tuned for real-time updates.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-white/10 bg-[#070F1E]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <HandHelping className="text-primary w-6 h-6" />
            <span className="font-bold text-lg">VolunteerConnect</span>
          </div>
          <div className="flex gap-8">
            <Link href="/about" className="text-sm text-text-muted hover:text-white">Mission</Link>
            <Link href="/privacy" className="text-sm text-text-muted hover:text-white">Privacy</Link>
            <Link href="/contact" className="text-sm text-text-muted hover:text-white">Contact</Link>
          </div>
          <p className="text-xs text-text-muted">© 2025 VolunteerConnect. Google Solution Challenge 2025.</p>
        </div>
      </footer>
    </div>
  );
}
