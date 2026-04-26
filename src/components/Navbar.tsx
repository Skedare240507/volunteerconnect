"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { HandHelping, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  const getDashboardHref = () => {
    const role = userData?.role || "user";
    if (role === "admin" || role === "superadmin") return "/dashboard/admin";
    if (role === "ngodashboard") return "/dashboard/ngo";
    if (role === "coordinator") return "/coordinator";
    return "/";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-7xl mx-auto glass rounded-full px-6 py-3 flex items-center justify-between"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <HandHelping className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">
            Volunteer<span className="text-primary">Connect</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/about" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">About</Link>
          <Link href="/resources" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Resources</Link>
          <Link href="/contact" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Contact</Link>
          
          {!loading && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:block text-right">
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Active Session</p>
                <p className="text-sm font-black truncate max-w-[120px]">{userData?.name || user.displayName || "User"}</p>
              </div>
              <Link href={getDashboardHref()}>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 bg-primary/10 pl-2 pr-6 py-1 rounded-full border border-primary/20 hover:bg-primary/20 transition-all cursor-pointer"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="ME" className="w-8 h-8 rounded-full border border-primary" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[10px] font-black text-white">
                      {(userData?.name || user.displayName || "U")[0]}
                    </div>
                  )}
                  <span className="text-sm font-bold">Dashboard</span>
                </motion.div>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                title="Sign Out"
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-sm font-bold"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Sign Out</span>
              </motion.button>
            </div>
          ) : (
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-primary rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
              >
                Sign In
              </motion.button>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white">
          {isOpen ? <X /> : <Menu />}
        </button>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-6 right-6 glass rounded-2xl p-6 md:hidden flex flex-col gap-4 border border-white/10"
          >
            <Link href="/about" className="text-lg font-medium" onClick={() => setIsOpen(false)}>About</Link>
            <Link href="/resources" className="text-lg font-medium" onClick={() => setIsOpen(false)}>Resources</Link>
            <Link href="/contact" className="text-lg font-medium" onClick={() => setIsOpen(false)}>Contact</Link>
            {user ? (
              <>
                <Link href={getDashboardHref()} className="w-full" onClick={() => setIsOpen(false)}>
                  <button className="w-full py-3 bg-primary rounded-xl font-bold">Go to Dashboard</button>
                </Link>
                <button
                  onClick={() => { setIsOpen(false); handleLogout(); }}
                  className="w-full py-3 border border-red-500/30 text-red-400 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" className="w-full" onClick={() => setIsOpen(false)}>
                <button className="w-full py-3 bg-primary rounded-xl font-bold">Sign In</button>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
