"use client";

import { motion } from "framer-motion";
import { 
  Building2, 
  Check, 
  X, 
  ExternalLink, 
  Mail, 
  MapPin, 
  Scale, 
  AlertTriangle,
  Loader2,
  Search,
  CheckCircle2
} from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { logAdminAction } from "@/lib/auditLog";

export default function AdminApprovals() {
  const [ngos, setNgos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Check both verified field (my new logic) and status field (legacy/merged logic)
    const q = query(collection(db, "ngos"), where("verified", "==", false));
    const unsub = onSnapshot(q, (snap) => {
      setNgos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleApprove = async (ngo: any) => {
    setProcessing(ngo.id);
    try {
      // 1. Log action for audit
      await logAdminAction("APPROVE_NGO", "ngos", ngo.id, { verified: false }, { verified: true });
      
      // 2. Update Firestore NGO doc
      await updateDoc(doc(db, "ngos", ngo.id), {
        verified: true,
        status: 'Verified',
        verifiedAt: new Date().toISOString()
      });

      // 3. Update or create user doc to reflect approval
      await setDoc(doc(db, "users", ngo.id), {
        isApprovedNgo: true,
        role: 'ngodashboard'
      }, { merge: true });

      alert(`${ngo.name} approved successfully!`);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to approve NGO: ${err.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (ngo: any) => {
    if (!confirm(`Are you sure you want to REJECT ${ngo.name}? This will remove their registration.`)) return;
    
    setProcessing(ngo.id);
    try {
      await logAdminAction("REJECT_NGO", "ngos", ngo.id, ngo, null);
      await deleteDoc(doc(db, "ngos", ngo.id));
      // Optionally notify user or handle user doc
      alert(`${ngo.name} registration rejected.`);
    } catch (err: any) {
      console.error(err);
      alert("Failed to reject registration.");
    } finally {
      setProcessing(null);
    }
  };

  const filtered = ngos.filter(n => 
    n.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">NGO Verification Queue</h1>
          <p className="text-text-secondary text-sm">Review and verify new NGO partnerships for the 2025 impact cycle.</p>
        </div>
        <div className="px-4 py-2 bg-amber-400/10 border border-amber-400/20 rounded-full text-amber-400 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-3 h-3" /> {ngos.length} Pending Requests
        </div>
      </div>

      <div className="glass px-4 py-3 rounded-2xl flex items-center gap-3 border border-white/5 max-w-md">
        <Search className="w-4 h-4 text-text-muted" />
        <input 
          type="text" 
          placeholder="Search requests..." 
          className="bg-transparent border-none outline-none w-full text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filtered.map((ngo, i) => (
            <motion.div
              key={ngo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-8 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all flex flex-col xl:flex-row gap-8"
            >
              <div className="flex-grow space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl flex items-center justify-center border border-white/10">
                      <Building2 className="w-8 h-8 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{ngo.name}</h3>
                      <p className="text-text-muted text-xs flex items-center gap-1 mt-1">
                        Applied via Web Portal • {ngo.createdAt?.toDate?.() ? ngo.createdAt.toDate().toLocaleDateString() : 'Recent'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <button title="External Link" className="p-2 glass rounded-lg border border-white/10 hover:text-accent transition-colors">
                        <ExternalLink className="w-4 h-4" />
                     </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Contact Email</p>
                    <p className="text-sm font-bold flex items-center gap-2"><Mail className="w-4 h-4 text-accent" /> {ngo.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Service Zone</p>
                    <p className="text-sm font-bold flex items-center gap-2"><MapPin className="w-4 h-4 text-accent" /> {ngo.area}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Registration Status</p>
                    <p className="text-sm font-bold flex items-center gap-2 text-amber-400"><Scale className="w-4 h-4" /> Pending Review</p>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-xs text-text-muted font-bold uppercase mb-2">Organization Description</p>
                  <p className="text-sm text-text-secondary leading-relaxed">{ngo.description || "No description provided."}</p>
                </div>
              </div>

              <div className="xl:w-64 flex flex-col gap-3 justify-center">
                <button
                  disabled={processing === ngo.id}
                  onClick={() => handleApprove(ngo)}
                  className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processing === ngo.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Approve Partnership
                </button>
                <button
                  disabled={processing === ngo.id}
                  onClick={() => handleReject(ngo)}
                  className="w-full py-4 glass text-red-400 border border-red-500/20 rounded-2xl font-bold hover:bg-red-500/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <X className="w-4 h-4" /> Reject Request
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center glass rounded-[2.5rem] border border-white/5 space-y-4">
             <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-text-muted">
               <CheckCircle2 className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold">All caught up!</h3>
             <p className="text-text-muted text-sm max-w-xs mx-auto">There are no pending NGO registrations currently requiring your review.</p>
        </div>
      )}
    </div>
  );
}
