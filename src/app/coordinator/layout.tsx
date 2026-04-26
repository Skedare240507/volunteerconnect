"use client";

export const dynamic = "force-dynamic";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ClipboardList, 
  History, 
  User, 
  MapPin, 
  Bell,
  AlertTriangle
} from "lucide-react";
import { logActivity } from "@/lib/activity";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const navItems = [
  { name: "Tasks", icon: ClipboardList, href: "/coordinator" },
  { name: "History", icon: History, href: "/coordinator/history" },
  { name: "Profile", icon: User, href: "/coordinator/profile" },
];

export default function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && userData && userData.role !== "coordinator" && userData.role !== "admin" && userData.role !== "superadmin") {
      router.push("/login"); // Only coordinators or admins
    }
  }, [user, userData, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center text-primary">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <ClipboardList className="w-12 h-12" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1628] text-foreground flex flex-col items-center">
      {/* Mobile-style Container */}
      <div className="w-full max-w-md bg-[#0F2137]/40 min-h-screen flex flex-col relative border-x border-white/5 shadow-2xl shadow-black">
        {/* Header */}
        <header className="p-6 flex justify-between items-center bg-[#0F2137]/60 backdrop-blur-xl sticky top-0 z-40 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary">
              {(userData?.name || userData?.displayName || user?.displayName || "C")[0]}
            </div>
            <div>
              <p className="text-xs text-text-muted font-bold tracking-widest uppercase">ID: {userData?.uid?.slice(-8) || "COORD-UNK"}</p>
              <p className="font-bold text-sm">{userData?.name || userData?.displayName || user?.displayName || "Coordinator"}</p>
            </div>
          </div>
          <div className="relative">
            <Bell className="w-6 h-6 text-text-secondary" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
          </div>
        </header>

        {/* Content */}
        <div className="flex-grow p-6 pb-24 overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* SOS Floating Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={async () => {
            if(confirm("ACTIVATE EMERGENCY SOS? This will broadcast your location to the NGO mission control.")) {
               await logActivity({
                 user: userData?.name || user?.displayName || "Coordinator",
                 action: "activated",
                 target: "EMERGENCY SOS",
                 type: "alert"
               });
               alert("SOS BROADCAST ACTIVE. Help is on the way.");
            }
          }}
          className="fixed right-6 bottom-32 z-50 w-16 h-16 bg-red-500 rounded-full shadow-2xl shadow-red-500/40 flex items-center justify-center text-white border-2 border-white/20"
        >
          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" />
          <span className="font-black text-sm tracking-tighter">SOS</span>
        </motion.button>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 w-full max-w-md bg-[#0A1628]/80 backdrop-blur-2xl border-t border-white/10 px-6 py-4 flex justify-between items-center z-50">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  className={`flex flex-col items-center gap-1 transition-colors ${
                    isActive ? "text-primary" : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  <motion.div
                    animate={isActive ? { scale: 1.2, y: -4 } : { scale: 1, y: 0 }}
                    className={`p-2 rounded-xl ${isActive ? "bg-primary/10" : ""}`}
                  >
                    <item.icon className="w-6 h-6" />
                  </motion.div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
