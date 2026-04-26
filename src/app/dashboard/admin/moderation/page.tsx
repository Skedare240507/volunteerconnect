"use client";

import { motion } from "framer-motion";
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Flag, 
  AlertTriangle, 
  User, 
  Building2, 
  Check, 
  X,
  MessageSquare,
  Eye,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { logAdminAction } from "@/lib/auditLog";

export default function AdminModerationPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setReports(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleResolve = async (report: any, action: 'dismiss' | 'action') => {
    setProcessing(report.id);
    try {
      await logAdminAction(
        action === 'dismiss' ? "DISMISS_REPORT" : "RESOLVE_REPORT",
        "reports",
        report.id,
        { status: report.status },
        { status: 'resolved', resolution: action }
      );
      
      if (action === 'dismiss') {
        await deleteDoc(doc(db, "reports", report.id));
      } else {
        await updateDoc(doc(db, "reports", report.id), {
          status: 'resolved',
          resolvedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  const filtered = reports.filter(r => 
    r.reason?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.targetName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Safety & Moderation</h1>
          <p className="text-text-secondary text-sm">Review flagged accounts, suspicious activity, and platform violations.</p>
        </div>
        <div className="px-4 py-2 bg-red-400/10 border border-red-400/20 rounded-full text-red-400 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-3 h-3" /> {reports.length} Active Issues
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow glass px-4 py-3 rounded-2xl flex items-center gap-3 border border-white/5">
          <Search className="w-5 h-5 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search reports by reason or target..." 
            className="bg-transparent border-none outline-none w-full text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="glass px-6 py-3 rounded-2xl flex items-center gap-2 font-medium border border-white/5">
          <Filter className="w-4 h-4" /> Priority Level
        </button>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-accent" /></div>
        ) : filtered.length > 0 ? (
          filtered.map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row gap-8 items-start"
            >
              <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-400 shrink-0">
                 <Flag className="w-8 h-8" />
              </div>

              <div className="flex-grow space-y-6">
                 <div className="flex flex-wrap justify-between gap-4">
                    <div>
                       <h3 className="text-xl font-bold">{report.reason}</h3>
                       <p className="text-xs text-text-muted mt-1 uppercase font-bold tracking-widest flex items-center gap-2">
                          Target: <span className="text-text-secondary">{report.targetName || report.targetId}</span>
                          <span className="w-1 h-1 bg-white/20 rounded-full" />
                          Category: <span className="text-accent">{report.category || 'Platform Conduct'}</span>
                       </p>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                         report.priority === 'high' ? 'bg-red-500 text-white' : 'bg-white/5 border border-white/10 text-text-muted'
                       }`}>
                          {report.priority || 'standard'} Priority
                       </span>
                    </div>
                 </div>

                 <div className="p-6 bg-black/20 rounded-2xl border border-white/5">
                    <p className="text-sm text-text-secondary leading-relaxed italic">"{report.details || 'No additional details provided.'}"</p>
                 </div>

                 <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                    <div className="flex items-center gap-2"><User className="w-3.5 h-3.5" /> Reporter: {report.reporterEmail}</div>
                    <div className="flex items-center gap-2"><Eye className="w-3.5 h-3.5" /> Evidence Linked</div>
                 </div>
              </div>

              <div className="w-full md:w-56 space-y-3">
                 <button 
                  disabled={processing === report.id}
                  onClick={() => handleResolve(report, 'action')}
                  className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-xs shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                 >
                    {processing === report.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                    Take Disciplinary Action
                 </button>
                 <button 
                  disabled={processing === report.id}
                  onClick={() => handleResolve(report, 'dismiss')}
                  className="w-full py-4 glass border border-white/10 rounded-2xl font-black text-xs hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                 >
                    <Check className="w-4 h-4 text-emerald-400" /> Dismiss Report
                 </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center glass rounded-[3rem] border border-white/5">
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-emerald-400" />
             </div>
             <h3 className="text-2xl font-bold">Safe Environment</h3>
             <p className="text-text-muted text-sm mt-2">There are currently no active reports requiring moderation.</p>
          </div>
        )}
      </div>
    </div>
  );
}
