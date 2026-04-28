"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  UserCircle,
  Building2,
  ClipboardList,
  Crown,
  Eye,
  EyeOff,
  HandHelping,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

type Role = "coordinator" | "ngodashboard" | "admin" | "superadmin" | "user";

const allTabs: { role: Role; label: string; icon: React.ComponentType<any> }[] = [
  { role: "user", label: "User", icon: UserCircle },
  { role: "coordinator", label: "Coordinator", icon: ClipboardList },
  { role: "ngodashboard", label: "NGO Dashboard", icon: Building2 },
];

const tabs = allTabs;

const ROLE_REDIRECT: Record<Role, string> = {
  superadmin: "/dashboard/admin",
  admin: "/dashboard/admin",
  ngodashboard: "/dashboard/ngo",
  coordinator: "/coordinator",
  user: "/",
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRole = searchParams.get("role") as Role;

  const [activeRole, setActiveRole] = useState<Role>(
    (requestedRole && ["admin", "superadmin", "coordinator", "ngodashboard", "user"].includes(requestedRole)) 
    ? requestedRole 
    : "user"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [uniqueId, setUniqueId] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isAdminRole = activeRole === "admin" || activeRole === "superadmin";
  const showOAuthOnly = activeRole === "user";

  const handleEmailLogin = async () => {
    setError("");
    setLoading(true);

    // Special handling for the NEW demo credentials
    const isDemoAccount = [
      "admin@volconnect.com",
      "user@volconnect.com",
      "ngo@volconnect.com",
      "coord@volconnect.com"
    ].includes(email.toLowerCase());

    const demoPassword = "password123";

    if (isDemoAccount && password !== demoPassword) {
      setError("Please use 'password123' for demo accounts.");
      setLoading(false);
      return;
    }

    try {
      let cred;
      try {
        cred = await signInWithEmailAndPassword(auth, email, password);
      } catch (signInErr: any) {
        if ((isAdminRole || isDemoAccount) && (signInErr.code === "auth/user-not-found" || signInErr.code === "auth/invalid-credential" || signInErr.code === "auth/invalid-login-credentials")) {
          const { createUserWithEmailAndPassword } = await import("firebase/auth");
          cred = await createUserWithEmailAndPassword(auth, email, password);
        } else {
          throw signInErr;
        }
      }
      
      if (!cred) throw new Error("Auth failed");

      const userDoc = await getDoc(doc(db, "users", cred.user.uid));
      const userData = userDoc.data();

      if (!userData) {
        if (isAdminRole || isDemoAccount) {
          const demoRoleMap: Record<string, Role> = {
            "admin@volconnect.com": "admin",
            "user@volconnect.com": "user",
            "ngo@volconnect.com": "ngodashboard",
            "coord@volconnect.com": "coordinator"
          };
          
          const assignedRole = isDemoAccount ? demoRoleMap[email.toLowerCase()] : activeRole;

          await setDoc(doc(db, "users", cred.user.uid), {
            uid: cred.user.uid,
            email: cred.user.email,
            role: assignedRole,
            isBanned: false,
            createdAt: new Date().toISOString(),
          });
          
          // Re-fetch logic or just use assignedRole
          router.push(ROLE_REDIRECT[assignedRole]);
          return;
        } else {
          setError(`Account not found. Please contact an admin to be added as a ${activeRole}.`);
          await auth.signOut();
          setLoading(false);
          return;
        }
      } else if (userData.isBanned) {
        setError("Your account has been suspended. Contact support.");
        await auth.signOut();
        setLoading(false);
        return;
      } else if (userData.role !== activeRole) {
        if (activeRole !== "user") {
          setError(`This account does not have ${activeRole} permissions.`);
          await auth.signOut();
          setLoading(false);
          return;
        }
      }

      router.push(ROLE_REDIRECT[activeRole]);
    } catch (err: any) {
      setError(err.message?.replace("Firebase: ", "") || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!showOAuthOnly) return; 
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      
      const userDoc = await getDoc(doc(db, "users", cred.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", cred.user.uid), {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName,
          photoURL: cred.user.photoURL,
          role: "user",
          isBanned: false,
          createdAt: new Date().toISOString(),
        });
      } else if (userDoc.data().role !== "user") {
        setError("Please use the correct login method for your role.");
        await auth.signOut();
        setLoading(false);
        return;
      }
      
      router.push("/");
    } catch (err: any) {
      setError(err.message?.replace("Firebase: ", "") || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCreds = (role: Role) => {
    if (role === "admin") {
      setEmail("admin@volconnect.com");
      setPassword("password123");
    } else if (role === "coordinator") {
      setEmail("coord@volconnect.com");
      setPassword("password123");
      setUniqueId("VC-HCF-2025-0042");
    } else if (role === "ngodashboard") {
      setEmail("ngo@volconnect.com");
      setPassword("password123");
    } else if (role === "user") {
      setEmail("user@volconnect.com");
      setPassword("password123");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <HandHelping className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl">
              Volunteer<span className="text-primary">Connect</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black mb-2">Sign In</h1>
          <p className="text-text-secondary text-sm">
            Access the platform as your role
          </p>
        </div>

        <div className="flex gap-1 p-1 glass rounded-2xl mb-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.role}
                onClick={() => {
                  setActiveRole(tab.role);
                  setError("");
                }}
                className={`flex-1 min-w-[80px] flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeRole === tab.role
                    ? "bg-primary text-white shadow-lg"
                    : "text-text-muted hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label.split(" ")[0]}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {isAdminRole && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-4 mb-6 bg-amber-400/10 border border-amber-400/20 rounded-2xl text-amber-400"
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-xs font-medium">
                Restricted access. All activity is monitored and logged.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="glass p-8 rounded-3xl space-y-6"
            >
              {error && (
                <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-xl text-red-400 text-sm font-medium">
                  {error}
                </div>
              )}

              {activeRole === "coordinator" && (
                <div className="space-y-2">
                  <label className="text-sm font-bold block">Coordinator Unique ID</label>
                  <input
                    type="text"
                    title="Coordinator Unique ID"
                    value={uniqueId}
                    onChange={(e) => setUniqueId(e.target.value.toUpperCase())}
                    placeholder="e.g. VC-HCF-2025-0042"
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgba(29,185,117,0.25)] transition-all font-mono tracking-widest"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold block">Email Address</label>
                <input
                  type="email"
                  title="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgba(29,185,117,0.25)] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold block">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    title="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleEmailLogin()}
                    placeholder="••••••••"
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 pr-12 focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgba(29,185,117,0.25)] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                  >
                    {showPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="text-right">
                  <Link
                    href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                disabled={loading}
                onClick={handleEmailLogin}
                className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark rounded-2xl font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <button
                type="button"
                onClick={() => fillDemoCreds(activeRole)}
                className="w-full py-2 border border-primary/20 rounded-xl text-[10px] uppercase font-black text-primary/60 hover:text-primary hover:bg-primary/5 transition-all tracking-[0.2em]"
              >
                Use Demo Credentials
              </button>

              {showOAuthOnly && (
                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="flex items-center justify-center gap-3 py-4 glass rounded-2xl border border-white/10 hover:bg-white/10 transition-all font-bold text-sm disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign in with Google
                  </button>
                </div>
              )}

              <p className="text-center text-xs text-text-muted">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:underline font-medium">
                  Register here
                </Link>
              </p>

              <div className="pt-6 border-t border-white/10">
                <p className="text-[10px] text-center text-text-muted uppercase tracking-[0.2em] font-black mb-4">
                  Available Roles & Access
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 glass rounded-xl text-center cursor-pointer hover:bg-white/5 transition-colors" onClick={() => { setEmail("admin@volconnect.com"); setPassword("password123"); setActiveRole("user"); }}>
                    <p className="text-[10px] font-bold text-primary mb-1">ADMIN</p>
                    <p className="text-[9px] text-text-muted truncate">admin@volconnect.com</p>
                  </div>
                  <div className="p-3 glass rounded-xl text-center cursor-pointer hover:bg-white/5 transition-colors" onClick={() => { setEmail("user@volconnect.com"); setPassword("password123"); setActiveRole("user"); }}>
                    <p className="text-[10px] font-bold text-primary mb-1">USER</p>
                    <p className="text-[9px] text-text-muted truncate">user@volconnect.com</p>
                  </div>
                  <div className="p-3 glass rounded-xl text-center cursor-pointer hover:bg-white/5 transition-colors" onClick={() => { setEmail("ngo@volconnect.com"); setPassword("password123"); setActiveRole("ngodashboard"); }}>
                    <p className="text-[10px] font-bold text-primary mb-1">NGO</p>
                    <p className="text-[9px] text-text-muted truncate">ngo@volconnect.com</p>
                  </div>
                  <div className="p-3 glass rounded-xl text-center cursor-pointer hover:bg-white/5 transition-colors" onClick={() => { setEmail("coord@volconnect.com"); setPassword("password123"); setActiveRole("coordinator"); }}>
                    <p className="text-[10px] font-bold text-primary mb-1">COORD</p>
                    <p className="text-[9px] text-text-muted truncate">coord@volconnect.com</p>
                  </div>
                </div>
                <p className="mt-4 text-[9px] text-center text-text-muted italic">
                  Password for all: <span className="text-primary font-bold">password123</span>
                </p>
              </div>
            </motion.div>
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-all text-sm font-bold group"
          >
            <motion.span
              animate={{ x: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              ←
            </motion.span>
            Go back to Home Page
          </Link>
        </motion.div>

        <div className="mt-12 flex justify-center gap-6 text-[10px] text-text-muted uppercase tracking-widest font-bold">
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms of Use</Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
