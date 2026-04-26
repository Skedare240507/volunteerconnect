"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  History, 
  Search, 
  Terminal, 
  Filter, 
  Eye, 
  User, 
  Calendar, 
  ArrowRight,
  ShieldAlert,
  Loader2,
  FileJson
} from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = logs.filter(l => 
    l.action?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.adminEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.targetId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action: string) => {
    if (action.includes("DELETE") || action.includes("BAN") || action.includes("REJECT")) return "text-red-400 bg-red-400/10 border-red-400/20";
    if (action.includes("CREATE") || action.includes("APPROVE")) return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    if (action.includes("UPDATE") || action.includes("CHANGE")) return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    return "text-text-muted bg-white/5 border-white/10";
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Immutable Audit Trails</h1>
          <p className="text-text-secondary text-sm">Every administrative mutation is tracked and verified for security compliance.</p>
        </div>
        <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border border-white/5">
           <ShieldAlert className="w-4 h-4 text-accent" />
           <span className="text-[10px] font-black uppercase text-accent tracking-widest">Tamper-Proof Ledger</span>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-grow glass px-4 py-3 rounded-2xl flex items-center gap-3 border border-white/5">
          <Search className="w-5 h-5 text-text-muted" />
          <input 
            type="text" 
            placeholder="Filter by action, admin email or resource ID..." 
            className="bg-transparent border-none outline-none w-full text-sm placeholder:text-text-muted"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="glass px-6 py-3 rounded-2xl flex items-center gap-2 font-medium border border-white/5">
          <Filter className="w-4 h-4" /> All Sources
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Logs List */}
         <div className="lg:col-span-2 glass rounded-3xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/10">
                     <tr>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-text-muted tracking-widest">Timestamp</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-text-muted tracking-widest">Admin</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-text-muted tracking-widest">Action</th>
                        <th className="px-6 py-4 text-right"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {loading ? (
                        <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
                     ) : filtered.map((log) => (
                        <tr 
                           key={log.id} 
                           className={`hover:bg-white/5 cursor-pointer transition-colors ${selectedLog?.id === log.id ? 'bg-primary/5' : ''}`}
                           onClick={() => setSelectedLog(log)}
                        >
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-xs text-text-secondary">
                                 <Calendar className="w-3.5 h-3.5" />
                                 {log.timestamp?.toDate?.() ? log.timestamp.toDate().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                 <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                    {(log.adminEmail || '?')[0].toUpperCase()}
                                 </div>
                                 <span className="text-xs font-bold truncate max-w-[120px]">{log.adminEmail}</span>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${getActionColor(log.action)}`}>
                                 {log.action?.replace(/_/g, ' ')}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <Eye className="w-4 h-4 text-text-muted inline-block" />
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Log Detail Sidebar */}
         <div className="space-y-6">
            <AnimatePresence mode="wait">
               {selectedLog ? (
                  <motion.div
                     key={selectedLog.id}
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 20 }}
                     className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-8 sticky top-24"
                  >
                     <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                           <Terminal className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                           <h3 className="font-bold">Transaction Detail</h3>
                           <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">ID: {selectedLog.id.slice(0, 8)}...</p>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="space-y-2">
                           <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Affected Resource</p>
                           <div className="p-4 bg-black/20 rounded-2xl border border-white/5 flex items-center justify-between">
                              <span className="text-sm font-bold text-primary">{selectedLog.targetCollection}</span>
                              <ArrowRight className="w-4 h-4 text-text-muted" />
                              <span className="text-xs text-text-secondary font-mono">{selectedLog.targetId?.slice(0, 10)}</span>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Payload Diff</p>
                           <div className="p-6 bg-black/40 rounded-2xl border border-white/5 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                              <div className="space-y-1">
                                 <p className="text-[10px] text-red-400 font-bold uppercase">- Original State</p>
                                 <pre className="text-[10px] text-text-muted font-mono leading-relaxed bg-white/5 p-3 rounded-lg overflow-x-auto">
                                    {JSON.stringify(selectedLog.oldData, null, 2)}
                                 </pre>
                              </div>
                              <div className="space-y-1 text-right">
                                 <p className="text-[10px] text-emerald-400 font-bold uppercase">+ New State</p>
                                 <pre className="text-[10px] text-text-secondary font-mono leading-relaxed bg-white/5 p-3 rounded-lg text-left overflow-x-auto">
                                    {JSON.stringify(selectedLog.newData, null, 2)}
                                 </pre>
                              </div>
                           </div>
                        </div>
                     </div>

                     <button title="Export Proof" className="w-full py-4 glass border border-white/10 rounded-2xl font-bold text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                        <FileJson className="w-4 h-4" /> Export JSON Proof
                     </button>
                  </motion.div>
               ) : (
                  <div className="glass p-12 rounded-[2.5rem] border border-white/5 text-center space-y-4 opacity-50">
                     <History className="w-12 h-12 mx-auto text-text-muted" />
                     <p className="text-sm font-medium">Select a transaction to view detailed mutation proof.</p>
                  </div>
               )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
