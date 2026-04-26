"use client";

import { motion } from "framer-motion";
import { ShieldAlert, ChevronLeft, Lock, Eye, Server, RefreshCcw } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function PrivacyPage() {
  const sections = [
    {
      title: "Data Collection",
      icon: <Eye className="w-5 h-5 text-primary" />,
      content: "We collect essential information required for humanitarian aid coordination, including your name, email address, and real-time location data (for coordinators) to facilitate emergency matching and task assignment."
    },
    {
      title: "How We Use Data",
      icon: <RefreshCcw className="w-5 h-5 text-green-400" />,
      content: "Your data is used specifically for: AI-driven resource matching via Google Gemini, calculating optimal routes for aid delivery, and broadcasting SOS signals in emergency zones."
    },
    {
      title: "Data Sharing",
      icon: <Server className="w-5 h-5 text-purple-400" />,
      content: "Information is shared only between verified NGOs and appointed Coordinators for the sole purpose of completing specific tasks. We do not sell your personal data to third-party advertisers."
    },
    {
      title: "Security Measures",
      icon: <Lock className="w-5 h-5 text-amber-400" />,
      content: "All data is secured using high-grade encryption and protected by Firestore Security Rules. Access to administrative roles is strictly controlled via multi-stage verification."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-8 group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <ShieldAlert className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-black">Privacy Policy</h1>
          </div>
          <p className="text-text-secondary">Effective Date: April 26, 2025</p>
        </motion.div>

        <div className="grid gap-8">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-8 rounded-3xl border border-white/5 hover:border-primary/20 transition-all group"
            >
              <div className="flex items-start gap-6">
                <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-primary/10 transition-colors">
                  {section.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-3">{section.title}</h2>
                  <p className="text-text-muted leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 p-8 rounded-3xl bg-blue-500/5 border border-blue-500/10 text-center"
        >
          <p className="text-sm text-text-secondary">
            Questions about our privacy practices? Contact us at 
            <a href="mailto:privacy@volunteerconnect.org" className="text-primary hover:underline ml-1">privacy@volunteerconnect.org</a>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
