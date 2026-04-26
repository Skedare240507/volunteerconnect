"use client";

import { motion, AnimatePresence } from "framer-motion";
import { HandHelping, Building2, User, Check, ChevronRight, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

type RegType = "user" | "ngo";

const SKILLS = ["Medical", "Logistics", "Teaching", "Eldercare", "Driving", "First Aid", "Cooking", "Rescue", "Computers"];

export default function RegisterPage() {
  const [regType, setRegType] = useState<RegType>("user");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // User form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<string, boolean>>({
    mon: true, tue: true, wed: false, thu: true, fri: true, sat: false, sun: false,
  });
  const [area, setArea] = useState("");

  // NGO form state
  const [ngoName, setNgoName] = useState("");
  const [ngoEmail, setNgoEmail] = useState("");
  const [ngoPassword, setNgoPassword] = useState("");
  const [ngoArea, setNgoArea] = useState("");
  const [ngoDesc, setNgoDesc] = useState("");

  const totalSteps = regType === "user" ? 3 : 4;

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleDay = (day: string) => {
    setAvailability((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const handleUserRegister = async () => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        name,
        email,
        role: "user",
        isBanned: false,
        twoFAEnabled: false,
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      alert(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleNgoRegister = async () => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, ngoEmail, ngoPassword);
      // Create user doc
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        name: ngoName,
        email: ngoEmail,
        role: "ngodashboard",
        isBanned: false,
        twoFAEnabled: false,
        createdAt: serverTimestamp(),
      });
      // Create NGO doc (pending approval)
      await setDoc(doc(db, "ngos", cred.user.uid), {
        id: cred.user.uid,
        name: ngoName,
        email: ngoEmail,
        area: ngoArea,
        description: ngoDesc,
        verified: false,
        coordinatorCount: 0,
        logoURL: "",
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
    } catch (err: any) {
      alert(err.message || "NGO registration failed.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 p-12"
        >
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-black">
            {regType === "ngo" ? "Application Submitted!" : "Account Created!"}
          </h2>
          <p className="text-text-secondary max-w-sm mx-auto">
            {regType === "ngo"
              ? "Your NGO registration is pending admin approval. You'll receive an email once verified."
              : "Welcome to VolunteerConnect! Redirecting to login..."}
          </p>
          {regType === "ngo" && (
            <Link href="/login">
              <button className="px-8 py-4 bg-primary rounded-2xl font-bold shadow-lg shadow-primary/30">
                Back to Login
              </button>
            </Link>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <HandHelping className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl">
              Volunteer<span className="text-primary">Connect</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black mb-2">Create Account</h1>
          <p className="text-text-secondary text-sm">Join the platform and start making an impact.</p>
        </div>

        {/* Type selector */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {(["user", "ngo"] as RegType[]).map((type) => {
              const Icon = type === "user" ? User : Building2;
              const labels = { user: "Volunteer / User", ngo: "NGO Organization" };
              return (
                <button
                  key={type}
                  onClick={() => setRegType(type)}
                  className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                    regType === type
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                      : "border-white/10 glass hover:border-white/20"
                  }`}
                >
                  <Icon className={`w-8 h-8 ${regType === type ? "text-primary" : "text-text-muted"}`} />
                  <span className="font-bold text-sm">{labels[type]}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`h-1 flex-grow rounded-full transition-all ${i < step ? "bg-primary" : "bg-white/10"}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${regType}-${step}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="glass p-8 rounded-3xl space-y-6"
          >
            {/* USER STEPS */}
            {regType === "user" && step === 1 && (
              <>
                <h2 className="text-xl font-bold">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold block mb-2">Full Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul Kulkarni"
                      className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 focus:border-primary focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-sm font-bold block mb-2">Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                      className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 focus:border-primary focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-sm font-bold block mb-2">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                      className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 focus:border-primary focus:outline-none transition-all" />
                  </div>
                </div>
              </>
            )}

            {regType === "user" && step === 2 && (
              <>
                <h2 className="text-xl font-bold">Your Skills</h2>
                <p className="text-sm text-text-secondary">Select all skills that apply. This helps us match you to relevant tasks.</p>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                        selectedSkills.includes(skill)
                          ? "bg-primary/20 border-primary text-primary"
                          : "glass border-white/10 text-text-secondary hover:border-white/20"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-sm font-bold block mb-2">Service Area / Zone</label>
                  <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Hadapsar, Pune"
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 focus:border-primary focus:outline-none transition-all" />
                </div>
              </>
            )}

            {regType === "user" && step === 3 && (
              <>
                <h2 className="text-xl font-bold">Availability</h2>
                <p className="text-sm text-text-secondary">When are you available to take tasks? Toggle days on/off.</p>
                <div className="grid grid-cols-7 gap-2">
                  {Object.entries(availability).map(([day, active]) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                        active ? "bg-primary/20 border-primary text-primary" : "glass border-white/10 text-text-muted"
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20">
                  <p className="text-xs text-text-secondary">
                    🎉 You're almost done! Creating your account will enable AI-powered task matching based on your skills and availability.
                  </p>
                </div>
              </>
            )}

            {/* NGO STEPS */}
            {regType === "ngo" && step === 1 && (
              <>
                <h2 className="text-xl font-bold">Account Setup</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold block mb-2">Admin Email</label>
                    <input type="email" value={ngoEmail} onChange={(e) => setNgoEmail(e.target.value)}
                      placeholder="admin@yourngo.org"
                      className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 focus:border-primary focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-sm font-bold block mb-2">Password</label>
                    <input type="password" value={ngoPassword} onChange={(e) => setNgoPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 focus:border-primary focus:outline-none transition-all" />
                  </div>
                </div>
              </>
            )}

            {regType === "ngo" && step === 2 && (
              <>
                <h2 className="text-xl font-bold">Organization Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold block mb-2">NGO Name</label>
                    <input value={ngoName} onChange={(e) => setNgoName(e.target.value)}
                      placeholder="e.g. Hadapsar Care Foundation"
                      className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 focus:border-primary focus:outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-sm font-bold block mb-2">Primary Service Area</label>
                    <input value={ngoArea} onChange={(e) => setNgoArea(e.target.value)}
                      placeholder="e.g. Hadapsar, Pune"
                      className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 focus:border-primary focus:outline-none transition-all" />
                  </div>
                </div>
              </>
            )}

            {regType === "ngo" && step === 3 && (
              <>
                <h2 className="text-xl font-bold">Mission &amp; Description</h2>
                <div>
                  <label className="text-sm font-bold block mb-2">Describe your NGO's work</label>
                  <textarea value={ngoDesc} onChange={(e) => setNgoDesc(e.target.value)}
                    placeholder="Briefly describe what your NGO does and the communities you serve..."
                    className="w-full h-36 rounded-xl bg-white/5 border border-white/10 p-4 focus:border-primary focus:outline-none resize-none transition-all" />
                </div>
              </>
            )}

            {regType === "ngo" && step === 4 && (
              <>
                <h2 className="text-xl font-bold">Review &amp; Submit</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-text-muted">NGO Name</span>
                    <span className="font-bold">{ngoName || "—"}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-text-muted">Email</span>
                    <span className="font-bold">{ngoEmail || "—"}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-text-muted">Service Area</span>
                    <span className="font-bold">{ngoArea || "—"}</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-text-muted">Status</span>
                    <span className="px-3 py-1 bg-amber-400/10 text-amber-400 rounded-full text-[10px] font-bold uppercase">
                      Pending Approval
                    </span>
                  </div>
                </div>
                <p className="text-xs text-text-muted">
                  Submission will be reviewed by our admin team within 24-48 hours. You'll receive an email upon approval.
                </p>
              </>
            )}

            {/* Navigation */}
            <div className="flex gap-4 pt-2">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 px-6 py-4 glass rounded-2xl font-bold border border-white/10 hover:bg-white/10 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
              <button
                disabled={loading}
                onClick={() => {
                  if (step < totalSteps) {
                    setStep(step + 1);
                  } else {
                    regType === "user" ? handleUserRegister() : handleNgoRegister();
                  }
                }}
                className="flex-grow py-4 bg-gradient-to-r from-primary to-primary-dark rounded-2xl font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading
                  ? "Creating..."
                  : step < totalSteps
                  ? (
                    <>Continue <ChevronRight className="w-4 h-4" /></>
                  )
                  : regType === "ngo"
                  ? "Submit NGO Application"
                  : "Create Account"}
              </button>
            </div>

            <p className="text-center text-xs text-text-muted">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
