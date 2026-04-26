"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Mail, Lock, MapPin, Briefcase, Phone, Loader2, CheckCircle2 } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection } from "firebase/firestore";

const SKILL_OPTIONS = ["Medical", "Logistics", "Teaching", "Eldercare", "Rescue", "Food Distribution", "Local Guide", "Tech Support", "Counseling"];
const ZONE_OPTIONS = ["Hadapsar", "Kothrud", "Baner", "Shivajinagar", "Wagholi", "Viman Nagar", "Katraj", "Pimpri", "Chinchwad", "Magarpatta"];

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  ngoId?: string;
}

export default function AddCoordinatorModal({ onClose, onSuccess, ngoId }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 — Personal details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Step 2 — Field details
  const [zone, setZone] = useState(ZONE_OPTIONS[0]);
  const [skills, setSkills] = useState<string[]>([]);
  const [availability, setAvailability] = useState<"online" | "offline">("online");

  const toggleSkill = (s: string) =>
    setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const generateCoordinatorId = (name: string) => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const initials = name.split(" ").map(n => n[0]?.toUpperCase() || "X").join("");
    return `VC-${initials}-${year}-${rand}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (skills.length === 0) { setError("Please select at least one skill."); return; }
    setLoading(true);
    setError(null);

    try {
      const coordinatorId = generateCoordinatorId(name);

      // Call our internal backend API to create the user without signing out the current one
      const response = await fetch("/api/auth/register-coordinator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          phone,
          zone,
          skills,
          availability,
          ngoId,
          coordinatorId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create coordinator.");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create coordinator.";
      if (msg.includes("EMAIL_EXISTS")) {
        setError("This email is already registered. Please use a different email.");
      } else if (msg.includes("WEAK_PASSWORD")) {
        setError("Password must be at least 6 characters.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-[#0F2137] border border-white/10 rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex justify-between items-center px-8 pt-8 pb-6 border-b border-white/5">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-3">
                <UserPlus className="text-primary w-5 h-5" /> Add New Coordinator
              </h2>
              <p className="text-xs text-text-muted mt-1">Step {step} of 2 — {step === 1 ? "Account Details" : "Field Profile"}</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-text-muted" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="px-8 pt-5 flex gap-2">
            {[1, 2].map(n => (
              <div key={n} className={`h-1 flex-1 rounded-full transition-all duration-300 ${n <= step ? "bg-primary" : "bg-white/10"}`} />
            ))}
          </div>

          <div className="p-8 space-y-5">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Full Name *</label>
                    <input
                      required value={name} onChange={e => setName(e.target.value)}
                      placeholder="e.g. Rahul Kulkarni"
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:border-primary focus:outline-none transition-all"
                    />
                  </div>
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        required type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="coordinator@vc.org"
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 text-sm focus:border-primary focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 text-sm focus:border-primary focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Initial Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        required type="password" value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        minLength={6}
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 text-sm focus:border-primary focus:outline-none transition-all"
                      />
                    </div>
                    <p className="text-[10px] text-text-muted">The coordinator will use this to log in to the Coordinator App.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  {/* Zone */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> Service Zone *
                    </label>
                    <select
                      value={zone} onChange={e => setZone(e.target.value)}
                      className="w-full h-12 bg-[#0A1628] border border-white/10 rounded-xl px-4 text-sm focus:border-primary focus:outline-none transition-all"
                      title="Select service zone"
                    >
                      {ZONE_OPTIONS.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>

                  {/* Skills */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                      <Briefcase className="w-3 h-3" /> Skills (select all that apply) *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SKILL_OPTIONS.map(s => (
                        <button
                          key={s} type="button" onClick={() => toggleSkill(s)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            skills.includes(s)
                              ? "bg-primary/15 border-primary text-primary"
                              : "bg-white/5 border-white/10 text-text-muted hover:border-white/20"
                          }`}
                        >
                          {skills.includes(s) && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-widest">Initial Availability</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["online", "offline"] as const).map(a => (
                        <button
                          key={a} type="button" onClick={() => setAvailability(a)}
                          className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all capitalize ${
                            availability === a
                              ? a === "online" ? "bg-emerald-400/10 border-emerald-400 text-emerald-400" : "bg-white/5 border-white/30 text-white"
                              : "bg-white/5 border-white/10 text-text-muted"
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${a === "online" ? "bg-emerald-400" : "bg-white/30"}`} />
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-xl text-red-400 text-xs">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              {step === 2 && (
                <button
                  type="button" onClick={() => { setStep(1); setError(null); }}
                  className="flex-1 py-3 glass rounded-2xl font-bold border border-white/10 hover:bg-white/5 transition-all text-sm"
                >
                  Back
                </button>
              )}
              {step === 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!name || !email || !password) { setError("Please fill all required fields."); return; }
                    setError(null);
                    setStep(2);
                  }}
                  className="flex-1 py-3 bg-primary rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all text-sm"
                >
                  Next: Field Details →
                </button>
              ) : (
                <button
                  type="submit" disabled={loading}
                  className="flex-1 py-3 bg-primary rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  {loading ? "Creating..." : "Create Coordinator"}
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
