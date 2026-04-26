"use client";

import { motion } from "framer-motion";
import { HandHelping, Target, Heart, Users, Globe, Zap, CheckCircle2, Star, ExternalLink } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer, doc, getDoc, setDoc } from "firebase/firestore";

function CountUp({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count.toLocaleString()}</>;
}

const sdgs = [
  { 
    num: 1, 
    title: "No Poverty", 
    desc: "Connecting food-insecure families with NGO resources in under 30 minutes.", 
    color: "text-red-400", 
    bg: "bg-red-400/10",
    link: "https://sdgs.un.org/goals/goal1"
  },
  { 
    num: 3, 
    title: "Good Health & Well-Being", 
    desc: "Rapid medical coordinator deployment for health emergencies.", 
    color: "text-emerald-400", 
    bg: "bg-emerald-400/10",
    link: "https://sdgs.un.org/goals/goal3"
  },
  { 
    num: 10, 
    title: "Reduced Inequalities", 
    desc: "Equal access to essential services regardless of location or literacy.", 
    color: "text-blue-400", 
    bg: "bg-blue-400/10",
    link: "https://sdgs.un.org/goals/goal10"
  },
  { 
    num: 17, 
    title: "Partnerships for the Goals", 
    desc: "Unifying NGOs, volunteers, and communities on one platform.", 
    color: "text-purple-400", 
    bg: "bg-purple-400/10",
    link: "https://sdgs.un.org/goals/goal17"
  },
];

export default function AboutPage() {
  const [liveStats, setLiveStats] = useState({ ngos: 5, coordinators: 42, resources: 312 });
  const [likes, setLikes] = useState<Record<number, number>>({ 1: 124, 3: 89, 10: 56, 17: 210 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [ngoSnap, coordSnap, resSnap, likesSnap] = await Promise.all([
          getCountFromServer(collection(db, "ngos")),
          getCountFromServer(collection(db, "coordinators")),
          getCountFromServer(collection(db, "resources")),
          getDoc(doc(db, "metadata", "sdg_likes"))
        ]);
        
        setLiveStats({
          ngos: Math.max(ngoSnap.data().count, 5),
          coordinators: Math.max(coordSnap.data().count, 42),
          resources: Math.max(resSnap.data().count, 312),
        });

        if (likesSnap.exists()) {
          setLikes(likesSnap.data());
        } else {
          // Initialize metadata if it doesn't exist
          await setDoc(doc(db, "metadata", "sdg_likes"), { 1: 124, 3: 89, 10: 56, 17: 210 });
        }
      } catch {
        // Use defaults
      }
    }
    fetchStats();
  }, []);

  const handleLike = async (num: number) => {
    const newLikes = { ...likes, [num]: (likes[num] || 0) + 1 };
    setLikes(newLikes);
    try {
      await setDoc(doc(db, "metadata", "sdg_likes"), newLikes, { merge: true });
    } catch (err) {
      console.error("Failed to save likes:", err);
      // Persist in local storage if firestore fails
      localStorage.setItem("sdg_likes", JSON.stringify(newLikes));
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <span className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-bold uppercase tracking-widest">
              Google Solution Challenge 2025
            </span>
            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              About <span className="text-primary text-glow">VolunteerConnect</span>
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              We believe no community need should go unaddressed due to coordination failure. VolunteerConnect bridges the gap between NGO resources and the field coordinators who deliver them.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="py-16 px-6 bg-black/20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Partner NGOs", value: liveStats.ngos, suffix: "+" },
            { label: "Active Coordinators", value: liveStats.coordinators, suffix: "+" },
            { label: "Resources Allocated", value: liveStats.resources, suffix: "+" },
            { label: "Lives Impacted", value: liveStats.resources * 12, suffix: "+" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 border border-white/5 hover:border-primary/20 transition-all"
            >
              <div className="text-4xl font-black text-primary mb-2">
                <CountUp target={stat.value} />{stat.suffix}
              </div>
              <p className="text-text-secondary text-sm font-medium uppercase tracking-tighter">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <div className="flex items-center gap-2 text-primary font-bold mb-4">
                <Target className="w-5 h-5" />
                <span className="uppercase tracking-widest text-xs">Our Mission</span>
              </div>
              <h2 className="text-4xl font-black mb-4">Ensure no community need goes unaddressed</h2>
              <p className="text-text-secondary leading-relaxed">
                Local NGOs in India collect critical community data — food insecurity, medical emergencies, shelter needs. This data is often fragmented. We provide the unified architecture to match coordinators to needs efficiently.
              </p>
            </div>
            <div className="space-y-4">
              {[
                "AI-powered resource matching in under 30 seconds",
                "Real-time coordinator tracking on smart maps",
                "Verifiable digital ID cards for all field workers",
                "4 UN SDGs addressed in one unified platform",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-10 relative overflow-hidden bg-primary/5 border-primary/10"
          >
            <div className="absolute top-0 right-0 p-10 opacity-5">
              <Heart className="w-32 h-32" />
            </div>
            <Zap className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
            <p className="text-text-secondary leading-relaxed mb-6">
              A future where every coordinator reaches the right community at the right time, powered by AI that understands urgency, proximity, and human capability.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-2xl font-black text-accent">80%</div>
                <p className="text-[10px] text-text-muted mt-1 uppercase font-bold">Match rate target</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-2xl font-black text-primary">&lt;30s</div>
                <p className="text-[10px] text-text-muted mt-1 uppercase font-bold">AI Engine Speed</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team - Updated to show only Sahil Kedare */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Users className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-4xl font-black mb-4">The Architect</h2>
            <p className="text-text-secondary">Dedicated to building technology that serves humanity.</p>
          </div>

          <div className="max-w-lg mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-card p-12 text-center border-primary/20 bg-[#0F2137]/40 backdrop-blur-3xl relative"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-[#0A1628] shadow-2xl shadow-primary/40 rotate-3 hover:rotate-0 transition-transform">
                  <img 
                    src="/sahil.png" 
                    alt="Sahil Kedare"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="mt-20">
                <h3 className="text-3xl font-black mb-1">Sahil Kedare</h3>
                <p className="text-primary font-bold text-sm uppercase tracking-[0.3em] mb-6">Lead Developer & Visionary</p>
                <p className="text-text-secondary text-base leading-relaxed mb-8 italic">
                  "VolunteerConnect isn't just an app; it's a digital bridge built to ensure that help arrives precisely where it's needed most. By combining AI with human empathy, we can optimize the speed of kindness."
                </p>
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <div className="flex justify-center gap-4">
                   <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest">Next.js Expert</div>
                   <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest">Firebase Architect</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SDG Alignment */}
      <section className="py-24 px-6 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Globe className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-4xl font-black mb-4">UN Sustainable Development Goals</h2>
            <p className="text-text-secondary">VolunteerConnect directly contributes to 4 of the 17 UN SDGs.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sdgs.map((sdg, i) => (
              <motion.div
                key={sdg.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 flex flex-col h-full group"
              >
                <div className={`w-12 h-12 ${sdg.bg} rounded-2xl flex items-center justify-center mb-4`}>
                  <span className={`text-xl font-black ${sdg.color}`}>{sdg.num}</span>
                </div>
                <h3 className={`font-bold mb-2 ${sdg.color}`}>{sdg.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed mb-6 flex-grow">{sdg.desc}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <button 
                    onClick={() => handleLike(sdg.num)}
                    className="flex items-center gap-2 text-xs font-bold text-text-muted hover:text-red-400 transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${likes[sdg.num] > 100 ? 'fill-red-400 text-red-400' : ''}`} />
                    {likes[sdg.num]}
                  </button>
                  <a 
                    href={sdg.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label={`Learn more about SDG ${sdg.num}: ${sdg.title}`}
                    className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-text-muted"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <HandHelping className="w-12 h-12 text-primary mx-auto" />
          <h2 className="text-4xl font-black">Ready to scale your impact?</h2>
          <p className="text-text-secondary font-medium">Join the network of coordinators and NGOs transforming communities.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register">
              <button className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/30 hover:scale-105 transition-all">
                Join as Coordinator
              </button>
            </Link>
            <Link href="/login">
              <button className="px-8 py-4 glass rounded-2xl font-bold border border-white/10 hover:bg-white/10 transition-all">
                Partner as NGO
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <HandHelping className="text-primary w-5 h-5" />
            <span className="font-extrabold tracking-tighter">VolunteerConnect</span>
          </div>
          <p className="text-xs text-text-muted font-bold uppercase tracking-widest">© 2025 VolunteerConnect • Build VC-ALPHA-2025</p>
        </div>
      </footer>
    </div>
  );
}
