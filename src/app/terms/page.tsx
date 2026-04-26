"use client";

import { motion } from "framer-motion";
import { FileText, ChevronLeft, Scale, Users, Ban, Gavel } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function TermsPage() {
  const terms = [
    {
      title: "1. Acceptance of Terms",
      icon: <FileText className="w-5 h-5 text-blue-400" />,
      content: "By accessing VolunteerConnect, you agree to comply with our code of conduct. The platform is designed for legitimate humanitarian aid coordination only. Any misuse for political, commercial, or unauthorized purposes is strictly prohibited."
    },
    {
      title: "2. User Conduct & Ethics",
      icon: <Users className="w-5 h-5 text-green-400" />,
      content: "NGOs and Coordinators are expected to maintain the highest standards of integrity. Resources must be delivered to recipients without discrimination based on race, religion, or background."
    },
    {
      title: "3. Accountability",
      icon: <Scale className="w-5 h-5 text-amber-400" />,
      content: "VolunteerConnect acts as a coordination layer. While we verify NGOs and Coordinators, we are not liable for the physical quality of aid items or actions taken by users in the field, though we will investigate all reported incidents."
    },
    {
      title: "4. Account Termination",
      icon: <Ban className="w-5 h-5 text-red-400" />,
      content: "We reserve the right to suspend or terminate accounts that violate our safety protocols, engage in fraudulent listing of resources, or endanger the welfare of volunteers and recipients."
    },
    {
      title: "5. Intellectual Property",
      icon: <Gavel className="w-5 h-5 text-purple-400" />,
      content: "The VolunteerConnect brand, software architecture, and AI models are protected property. Users may not reverse engineer the matching algorithms or redistribute platform assets without consent."
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
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-black">Terms & Conditions</h1>
          </div>
          <p className="text-text-secondary text-sm">Last Updated: April 2025</p>
        </motion.div>

        <div className="space-y-6">
          {terms.map((term, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-8 rounded-3xl border border-white/5"
            >
              <h2 className="flex items-center gap-3 text-xl font-bold mb-4">
                <span className="p-2 bg-white/5 rounded-xl">{term.icon}</span>
                {term.title}
              </h2>
              <p className="text-text-muted leading-relaxed pl-12">
                {term.content}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center text-text-muted text-sm"
        >
          <p>By using this platform, you acknowledge that you have read and understood these Terms.</p>
        </motion.div>
      </main>
    </div>
  );
}
