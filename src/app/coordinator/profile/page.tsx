"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  CreditCard, 
  Award, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  ChevronRight, 
  Smartphone,
  Bell,
  Languages,
  Map,
  Download
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import BackButton from "@/components/BackButton";

export default function CoordinatorProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const [showId, setShowId] = useState(false);
  const [coordData, setCoordData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchCoordData = async () => {
      try {
        const docSnap = await getDoc(doc(db, "coordinators", user.uid));
        if (docSnap.exists()) {
          setCoordData(docSnap.data());
        }
      } catch (e) {
        console.error("Failed to fetch coordinator profile:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCoordData();
  }, [user]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  const displayData = {
    id: coordData?.id || `VC-XYZ-${new Date().getFullYear()}`,
    name: coordData?.name || user?.displayName || "Coordinator",
    role: "Field Coordinator",
    verified: true,
    ngo: coordData?.ngoId ? "Registered NGO" : "Independent Volunteer",
    skills: coordData?.skills || [],
    stats: {
      missions: coordData?.tasksCompleted || 0,
      impact: "1.2k souls", // Placeholder
      points: (coordData?.tasksCompleted || 0) * 10
    }
  };

  if (loading) {
    return (
      <div className="pb-20 space-y-8 flex justify-center items-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-20 space-y-8">
      <BackButton label="Back to Dashboard" />
      {/* Header Profile */}
      <div className="flex flex-col items-center text-center space-y-4 pt-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary to-accent p-1 shadow-2xl shadow-primary/20">
            <div className="w-full h-full rounded-[1.8rem] bg-[#0A1628] flex items-center justify-center font-black text-3xl text-white">
              {displayData.name[0]?.toUpperCase()}
            </div>
          </div>
          {displayData.verified && (
            <div className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-500 rounded-full border-4 border-[#0A1628] text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
          )}
        </div>
        <div>
          <h1 className="text-xl font-black">{displayData.name}</h1>
          <p className="text-xs text-text-muted font-bold uppercase tracking-widest">{displayData.role}</p>
        </div>
      </div>

      {/* Impact Grid */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Map, label: "Missions", value: displayData.stats.missions },
          { icon: Award, label: "Experience", value: displayData.stats.points },
          { icon: ShieldCheck, label: "Impact", value: "1.2k+" }
        ].map((stat, i) => (
          <div key={i} className="glass p-4 rounded-2xl text-center space-y-1 border border-white/5">
            <stat.icon className="w-4 h-4 text-primary mx-auto mb-1 opacity-50" />
            <div className="text-sm font-black">{stat.value}</div>
            <div className="text-[8px] text-text-muted font-bold uppercase">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ID Card Toggle */}
      <div className="space-y-4">
        <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] ml-1">Identity & Security</h2>
        <motion.div 
          onClick={() => setShowId(!showId)}
          className="glass-card p-6 border-primary/20 bg-primary/5 relative overflow-hidden group cursor-pointer"
        >
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-xl text-primary">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm">Digital ID Card</p>
                <p className="text-[10px] text-text-muted">Tap to view credential</p>
              </div>
            </div>
            <div className={`p-2 rounded-lg transition-transform ${showId ? 'rotate-90' : ''}`}>
               <ChevronRight className="w-4 h-4 text-primary" />
            </div>
          </div>

          <AnimatePresence>
            {showId && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-6 pt-6 border-t border-white/10 space-y-4 overflow-hidden"
              >
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center">
                  <div className="w-40 h-40 bg-white mb-4 rounded-xl p-2">
                    {/* Placeholder QR */}
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${displayData.id}`} 
                      alt="QR Code" 
                      className="w-full h-full object-cover" 
                    />
                  <p className="text-[10px] font-mono text-primary font-bold">{displayData.id}</p>
                  <p className="text-[10px] text-text-muted mt-2 text-center uppercase tracking-widest font-black">Verify at volunteerconnect.in/v</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent toggling the card
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    if (!ctx) return;
                    canvas.width = 400;
                    canvas.height = 250;
                    
                    // Draw Card
                    ctx.fillStyle = "#0A1628";
                    ctx.fillRect(0, 0, 400, 250);
                    
                    // Gradient Header
                    const gradient = ctx.createLinearGradient(0, 0, 400, 0);
                    gradient.addColorStop(0, "#0A84FF");
                    gradient.addColorStop(1, "#00C2FF");
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, 400, 10);

                    // Content
                    ctx.fillStyle = "#FFFFFF";
                    ctx.font = "bold 20px Inter, sans-serif";
                    ctx.fillText("VOLUNTEER CONNECT", 20, 40);
                    
                    ctx.font = "12px Inter, sans-serif";
                    ctx.fillStyle = "rgba(255,255,255,0.7)";
                    ctx.fillText("OFFICIAL COORDINATOR CREDENTIAL", 20, 60);

                    ctx.fillStyle = "#FFFFFF";
                    ctx.font = "bold 24px Inter, sans-serif";
                    ctx.fillText(displayData.name.toUpperCase(), 20, 120);
                    
                    ctx.font = "bold 14px Inter, sans-serif";
                    ctx.fillStyle = "#0A84FF";
                    ctx.fillText(displayData.role, 20, 145);

                    ctx.fillStyle = "rgba(255,255,255,0.5)";
                    ctx.font = "10px monospace";
                    ctx.fillText(`ID: ${displayData.id}`, 20, 200);

                    // Border
                    ctx.strokeStyle = "rgba(255,255,255,0.1)";
                    ctx.lineWidth = 1;
                    ctx.strokeRect(5, 5, 390, 240);

                    const link = document.createElement("a");
                    link.download = `VC-ID-${displayData.name.replace(/\s+/g, '-')}.png`;
                    link.href = canvas.toDataURL();
                    link.click();
                  }}
                  className="w-full py-4 bg-primary hover:bg-primary/80 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" /> Save ID to Device
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform">
            <ShieldCheck className="w-32 h-32" />
          </div>
        </motion.div>
      </div>

      {/* Settings Menu */}
      <div className="space-y-4">
        <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] ml-1">Platform Settings</h2>
        <div className="glass rounded-[2.5rem] overflow-hidden border border-white/5 divide-y divide-white/5">
          <MenuLink icon={Bell} label="Notifications" badge="3" />
          <MenuLink icon={Smartphone} label="Device Sync" value="Pixel 8 Pro" />
          <MenuLink icon={Languages} label="App Language" value="English (IN)" />
          <MenuLink icon={Settings} label="Accessibility" />
        </div>
      </div>

      <button 
        onClick={handleLogout}
        className="w-full py-5 glass rounded-3xl border border-red-500/20 text-red-400 font-bold flex items-center justify-center gap-3 hover:bg-red-500/5 transition-all"
      >
        <LogOut className="w-5 h-5" /> Sign Out from Mission
      </button>

      <p className="text-center text-[8px] text-text-muted font-bold uppercase tracking-widest">
        Version 2.4.0 (Beta) • Build 2025.04.12
      </p>
    </div>
  );
}

function MenuLink({ icon: Icon, label, value, badge }: { icon: any, label: string, value?: string, badge?: string }) {
  return (
    <div className="flex items-center justify-between p-6 hover:bg-white/5 transition-all cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-white/5 rounded-lg text-text-muted group-hover:text-primary transition-colors">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-bold">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {badge && <span className="px-2 py-0.5 bg-primary rounded-full text-[8px] font-black">{badge}</span>}
        {value && <span className="text-xs text-text-muted">{value}</span>}
        <ChevronRight className="w-4 h-4 text-text-muted opacity-30" />
      </div>
    </div>
  );
}
