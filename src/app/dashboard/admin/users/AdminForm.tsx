"use client";

import { useState } from "react";
import { UserPlus, Mail, Lock, Shield, Crown, X, Loader2 } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { motion } from "framer-motion";

interface AdminFormProps {
  onClose: () => void;
  onComplete: () => void;
}

export default function AdminForm({ onClose, onComplete }: AdminFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "superadmin">("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Create in Auth using a SECONDARY app to avoid signing out the current admin
      const { initializeApp, getApps } = await import("firebase/app");
      const { getAuth, createUserWithEmailAndPassword, signOut } = await import("firebase/auth");
      
      const config = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      const secondaryApp = getApps().find(a => a.name === "SecondaryApp") || initializeApp(config, "SecondaryApp");
      const secondaryAuth = getAuth(secondaryApp);

      const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      
      // 2. Create doc in users collection using main DB
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email,
        name,
        role,
        createdAt: new Date().toISOString(),
        isBanned: false
      });

      // 3. Immediately sign out the secondary app to clean up its local state
      await signOut(secondaryAuth);

      onComplete();
      onClose();
    } catch (err: any) {
       setError(err.message || "Failed to create administrator account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass rounded-[32px] w-full max-w-md overflow-hidden bg-[#0F2137] border border-white/10 shadow-2xl"
      >
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <UserPlus className="text-accent w-6 h-6" /> New Admin
            </h2>
            <button 
              type="button" 
              onClick={onClose} 
              className="p-2 hover:bg-white/5 rounded-full text-text-muted"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase">Full Name</label>
              <div className="relative">
                <input 
                  required
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:border-accent outline-none transition-all"
                  placeholder="e.g. Administrator"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase">Email Address</label>
              <div className="relative">
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:border-accent outline-none transition-all"
                  placeholder="admin@vc.org"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase">Initial Password</label>
              <div className="relative">
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:border-accent outline-none transition-all"
                  placeholder="••••••••"
                  minLength={8}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase">Role Level</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    role === "admin" ? "bg-accent/10 border-accent text-accent" : "bg-white/5 border-white/10 text-text-muted"
                  }`}
                >
                  <Shield className="w-4 h-4" /> Admin
                </button>
                <button 
                  type="button"
                  onClick={() => setRole("superadmin")}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    role === "superadmin" ? "bg-amber-400/10 border-amber-400 text-amber-400" : "bg-white/5 border-white/10 text-text-muted"
                  }`}
                >
                  <Crown className="w-4 h-4" /> SuperAdmin
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-xl text-red-500 text-xs">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-accent text-white rounded-2xl font-bold shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            aria-label={loading ? "Creating account..." : "Create Account"}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : "Create Account"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
