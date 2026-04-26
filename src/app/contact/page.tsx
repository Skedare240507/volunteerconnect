"use client";

import { motion, AnimatePresence } from "framer-motion";
import { HandHelping, Mail, Phone, MapPin, Sparkles, Send, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { useState, useEffect, useRef } from "react";

const subjects = [
  "General Inquiry",
  "Partnership / NGO Onboarding",
  "Volunteer Registration",
  "Technical Support",
  "Press & Media",
  "Report an Issue",
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(subjects[0]);
  const [message, setMessage] = useState("");
  const [aiPreview, setAiPreview] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // AI preview — debounced 800ms
  useEffect(() => {
    if (message.length < 20) {
      setAiPreview("");
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setAiLoading(true);
      try {
        const res = await fetch("/api/briefing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, subject }),
        });
        const data = await res.json();
        setAiPreview(
          data.reply ||
            "Thank you for reaching out. Our team will respond within 24 hours with a personalized solution."
        );
      } catch {
        setAiPreview(
          "Thank you for contacting VolunteerConnect. Our coordination team will get back to you shortly with assistance tailored to your needs."
        );
      } finally {
        setAiLoading(false);
      }
    }, 800);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [message, subject]);

  const handleSend = async () => {
    if (!name || !email || !message) {
      alert("Please fill in all required fields.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, aiResponse: aiPreview }),
      });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
    } catch {
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <BackButton />
        </div>
        <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-4"
        >
          <span className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-bold">
            We'd love to hear from you
          </span>
          <h1 className="text-5xl font-black">Contact Us</h1>
          <p className="text-text-secondary text-lg">
            Whether you're an NGO looking to partner or a volunteer ready to help — we're here.
          </p>
        </motion.div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-12">
          {/* Left — Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="glass-card p-6 flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold mb-1">Email</p>
                  <p className="text-text-secondary text-sm">hello@volunteerconnect.in</p>
                </div>
              </div>
              <div className="glass-card p-6 flex items-start gap-4">
                <div className="p-3 bg-accent/10 rounded-xl text-accent flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold mb-1">Phone</p>
                  <p className="text-text-secondary text-sm">+91 98765 43210</p>
                </div>
              </div>
              <div className="glass-card p-6 flex items-start gap-4">
                <div className="p-3 bg-purple-400/10 rounded-xl text-purple-400 flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold mb-1">Location</p>
                  <p className="text-text-secondary text-sm">Hadapsar, Pune — 411028, Maharashtra, India</p>
                </div>
              </div>
            </motion.div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-2 font-bold mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm">Powered by Gemini AI</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Our contact form uses Google Gemini to generate an AI-powered preview response as you type — giving you an instant idea of how our team might respond.
              </p>
            </div>
          </div>

          {/* Right — Form */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-16 text-center space-y-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse" />
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                    <Check className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-3xl font-black">Mission Dispatch Complete</h2>
                  <p className="text-text-secondary leading-relaxed max-w-md mx-auto">
                    Your inquiry has been encrypted and routed to our coordination headquarters. 
                    Expect a response from our mission control within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSent(false);
                      setName("");
                      setEmail("");
                      setMessage("");
                      setAiPreview("");
                    }}
                    className="px-6 py-3 glass rounded-xl border border-white/10 hover:bg-white/10 transition-all font-medium"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card p-8 space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-bold block mb-2">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Rahul Kulkarni"
                        className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgba(29,185,117,0.15)] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold block mb-2">
                        Email <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgba(29,185,117,0.15)] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold block mb-2">Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      title="Select subject"
                      className="w-full h-12 rounded-xl bg-[#0A1628] border border-white/10 px-4 focus:border-primary focus:outline-none transition-all"
                    >
                      {subjects.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold block mb-2">
                      Message <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your inquiry or how we can help..."
                      className="w-full h-36 rounded-xl bg-white/5 border border-white/10 p-4 focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_rgba(29,185,117,0.15)] resize-none transition-all"
                    />
                    <p className="text-[10px] text-text-muted mt-1">
                      Type at least 20 characters to see an AI response preview below.
                    </p>
                  </div>

                  {/* AI Preview */}
                  <AnimatePresence>
                    {(aiLoading || aiPreview) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-5 rounded-2xl bg-primary/5 border border-primary/20"
                      >
                        <div className="flex items-center gap-2 text-primary font-bold text-sm mb-3">
                          <Sparkles className="w-4 h-4" />
                          AI Response Preview
                          {aiLoading && <Loader2 className="w-3 h-3 animate-spin ml-auto" />}
                        </div>
                        {aiLoading ? (
                          <div className="space-y-2">
                            <div className="h-3 bg-white/10 rounded animate-pulse w-full" />
                            <div className="h-3 bg-white/10 rounded animate-pulse w-4/5" />
                          </div>
                        ) : (
                          <p className="text-sm text-text-secondary leading-relaxed">{aiPreview}</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    disabled={sending}
                    onClick={handleSend}
                    className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark rounded-2xl font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {sending ? "Sending..." : "Send Message"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <HandHelping className="text-primary w-5 h-5" />
            <span className="font-bold">VolunteerConnect</span>
          </div>
          <p className="text-sm text-text-muted">© 2025 VolunteerConnect. Google Solution Challenge 2025.</p>
        </div>
      </footer>
    </div>
  );
}
