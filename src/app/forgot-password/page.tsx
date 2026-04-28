"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  Loader2, 
  HandHelping 
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useSearchParams } from "next/navigation";

// Wrapping in a Suspense component since useSearchParams needs it in App Router
function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlEmail = searchParams.get("email");
    if (urlEmail) {
      setEmail(decodeURIComponent(urlEmail));
    }
  }, [searchParams]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setError("");
    
    try {
      // In a real app, you might check if the user exists in your /users collection first
      // for better feedback, but sendPasswordResetEmail is the core Firebase function.
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + "/login", // Redirect back to login after reset
      });
      setSent(true);
    } catch (err: any) {
      console.error("Reset error:", err);
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else {
        setError(err.message?.replace("Firebase: ", "") || "Failed to send reset email.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-background relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:rotate-12 transition-transform">
              <HandHelping className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl">
              Volunteer<span className="text-primary">Connect</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black mb-2">Reset Password</h1>
          <p className="text-text-secondary text-sm">
            We'll send mission recovery instructions to your email
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-3xl"
        >
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-4"
              >
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Check Your Signal</h2>
                  <div className="text-text-secondary leading-relaxed space-y-4">
                    <p>
                      A "Real" recovery link has been dispatched to <span className="text-white font-bold">{email}</span>.
                    </p>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-left">
                      <p className="font-bold text-primary mb-2 italic">⚠️ Important Step:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Check your <span className="text-amber-400">Spam/Junk</span> folder if not found.</li>
                        <li>The link will expire in <span className="text-amber-400">1 hour</span>.</li>
                        <li>After clicking the link, your password will be updated in the system.</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <Link 
                    href="/login"
                    className="inline-flex items-center gap-2 text-primary hover:underline font-bold"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleReset}
                className="space-y-6"
              >
                {error && (
                  <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-xl text-red-400 text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-bold block ml-1 text-text-muted">Registered Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. sahil@mission.com"
                      className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 pl-12 pr-4 focus:border-primary focus:outline-none focus:shadow-[0_0_0_4px_rgba(29,185,117,0.15)] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full h-14 bg-gradient-to-r from-primary to-primary-dark rounded-2xl font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Send Recovery Instructions 
                      <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <Link 
                    href="/login"
                    className="inline-flex items-center gap-2 text-text-muted hover:text-white text-sm transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Recall Login Credentials
                  </Link>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
        
        <p className="mt-8 text-center text-xs text-text-muted font-bold uppercase tracking-widest">
          Secure Infrastructure Powered by VolunteerConnect
        </p>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
