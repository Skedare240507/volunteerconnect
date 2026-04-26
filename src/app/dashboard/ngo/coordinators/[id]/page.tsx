"use client";

import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  ShieldCheck, 
  QrCode,
  MapPin,
  Calendar,
  HandHelping
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function CoordinatorIdPage() {
  const { id } = useParams();
  const [coordinator, setCoordinator] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchCoord = async () => {
      try {
        const docRef = doc(db, "coordinators", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const createdDate = data.createdAt ? new Date(data.createdAt) : new Date();
          const expiryDate = new Date(createdDate);
          expiryDate.setFullYear(expiryDate.getFullYear() + 2);
          
          setCoordinator({
            ...data,
            uniqueId: data.id || `VC-XYZ-${new Date().getFullYear()}-0000`,
            ngo: "VolunteerConnect NGO",
            issueDate: createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            expiryDate: expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            skills: data.skills || [],
          });
        }
      } catch (e) {
        console.error("Failed to fetch coordinator:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCoord();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!coordinator) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-red-400">Coordinator not found</h2>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .id-card-printable, .id-card-printable * {
            visibility: visible;
          }
          .id-card-printable {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) scale(1.5);
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/ngo/coordinators" className="p-2 glass rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Coordinator ID Card</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            title="Print ID Card"
            className="p-3 glass rounded-xl hover:text-primary transition-colors"
          >
            <Printer className="w-5 h-5" />
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-primary px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            <Download className="w-5 h-5" /> Download / Print
          </button>
        </div>
      </div>

      {/* ID Card Display */}
      <div className="flex justify-center py-10 id-card-printable">
        <motion.div 
          initial={{ opacity: 0, rotateY: -20, scale: 0.9 }}
          animate={{ opacity: 1, rotateY: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full max-w-[400px] aspect-[1.58/1] rounded-[24px] overflow-hidden group shadow-2xl shadow-black/60 print:shadow-none"
        >
          {/* Card Background & Effects */}
          <div className="absolute inset-0 bg-[#162A40]" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute inset-0 grid-pattern opacity-10" />
          
          {/* NFC/Chip Simulation */}
          <div className="absolute top-8 left-8 w-10 h-8 bg-amber-400/20 rounded-md border border-amber-400/30 overflow-hidden">
            <div className="w-full h-px bg-amber-400/20 mt-2" />
            <div className="w-full h-px bg-amber-400/20 mt-2" />
            <div className="w-full h-px bg-amber-400/20 mt-2" />
          </div>

          {/* Content Overlays */}
          <div className="relative h-full flex flex-col p-8 justify-between text-white">
            {/* Top Row: NGO Info */}
            <div className="flex justify-between items-start pl-14">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Authenticated By</p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center">
                    <HandHelping className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-xs font-bold">{coordinator.ngo}</span>
                </div>
              </div>
              <ShieldCheck className="text-primary w-8 h-8 opacity-40" />
            </div>

            {/* Middle Row: Photo & Main Info */}
            <div className="flex items-end gap-6">
              <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 p-1 backdrop-blur-md">
                <div className="w-full h-full bg-[#0A1628] rounded-xl flex items-center justify-center overflow-hidden">
                   {/* Placeholder for Photo */}
                   <span className="text-3xl font-bold opacity-20">{coordinator.name[0]}</span>
                </div>
              </div>
              
              <div className="flex-grow pb-1">
                <h2 className="text-xl font-bold leading-tight mb-1">{coordinator.name}</h2>
                <div className="flex flex-wrap gap-1 mb-2">
                  {coordinator.skills.map((s, idx) => (
                    <span key={idx} className="text-[8px] font-bold bg-white/10 px-2 py-0.5 rounded-full border border-white/5 uppercase">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/60 font-medium">
                  <MapPin className="w-3 h-3" /> {coordinator.zone}
                </div>
              </div>
            </div>

            {/* Bottom Row: Unique ID & QR */}
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[8px] text-white/40 uppercase font-black tracking-widest mb-1">Coordinator ID</p>
                <p className="font-mono text-sm tracking-widest text-primary">{coordinator.uniqueId}</p>
              </div>
              
              <div className="flex items-end gap-4">
                <div className="text-right">
                  <p className="text-[7px] text-white/40 uppercase font-bold">Expires</p>
                  <p className="text-[10px] font-bold">{coordinator.expiryDate}</p>
                </div>
                <div className="p-2 bg-white rounded-lg shadow-lg">
                  <QrCode className="w-10 h-10 text-black px-0.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Holographic Reflection Effect (Hover) */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"
            initial={{ x: '-100%', skewX: -45 }}
            whileHover={{ x: '100%', transition: { duration: 1.5, repeat: Infinity } }}
          />
        </motion.div>
      </div>

      {/* Details Section */}
      <div className="grid sm:grid-cols-2 gap-6 no-print">
        <div className="glass p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold border-b border-white/5 pb-2">Issuance Information</h3>
          <div className="space-y-3">
            <DetailRow icon={<Calendar />} label="Issue Date" value={coordinator.issueDate} />
            <DetailRow icon={<ShieldCheck />} label="Verified By" value="NGO Admin (Digital Signature)" />
            <DetailRow icon={<MapPin />} label="Assigned Zone" value={coordinator.zone} />
          </div>
        </div>
        <div className="glass p-6 rounded-2xl flex flex-col justify-center items-center text-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            This ID represents an official field coordinator of VolunteerConnect. Scannable QR code provides real-time verification of active status.
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-text-secondary">
        <div className="text-primary w-4 h-4">{icon}</div>
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-xs font-bold">{value}</span>
    </div>
  );
}
