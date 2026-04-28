"use client";

import { motion } from "framer-motion";
import { CheckCircle2, MapPin, Clock, Calendar, ChevronRight, Search, Filter, Download, FileSpreadsheet, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import BackButton from "@/components/BackButton";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { exportToCSV, exportToXLSX, exportToPDF } from "@/lib/export-utils";

export default function TaskHistory() {
  const { userData } = useAuth();
  const COORDINATOR_ID = userData?.uid || "VC-HCF-001";
  // ...
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "tasks"),
      where("coordinatorId", "==", COORDINATOR_ID),
      where("status", "==", "completed"),
      orderBy("completedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filtered = history.filter(item => 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    const exportData = filtered.map(item => ({
      Mission: item.title,
      Location: item.location,
      NGO: item.ngoName,
      CompletedAt: item.completedAt?.toDate?.() ? item.completedAt.toDate().toLocaleDateString() : 'Recent'
    }));

    const filename = `Mission_History_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'csv') exportToCSV(exportData, filename);
    else if (format === 'xlsx') exportToXLSX(exportData, filename);
    else exportToPDF(exportData, filename, "Mission History Report");
  };

  return (
    <div className="pb-20 space-y-6">
      <BackButton label="Back to Tasks" />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Mission History</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
              {history.length} Tasks Completed
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => handleExport('csv')} className="p-1 hover:text-primary transition-colors" title="Export CSV">
                <Download className="w-3 h-3" />
              </button>
              <button onClick={() => handleExport('xlsx')} className="p-1 hover:text-amber-400 transition-colors" title="Export XLSX">
                <FileSpreadsheet className="w-3 h-3" />
              </button>
              <button onClick={() => handleExport('pdf')} className="p-1 hover:text-red-400 transition-colors" title="Export PDF">
                <FileText className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
        <div className="w-10 h-10 glass rounded-full flex items-center justify-center text-primary border border-primary/20">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* Search */}
      <div className="glass px-4 py-3 rounded-2xl flex items-center gap-3 border border-white/5">
        <Search className="w-4 h-4 text-text-muted" />
        <input 
          type="text" 
          placeholder="Search past missions..." 
          className="bg-transparent border-none outline-none w-full text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass p-5 rounded-3xl border border-white/5 hover:border-primary/20 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm group-hover:text-primary transition-colors">{task.title}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-text-muted">
                    <Calendar className="w-3 h-3" />
                     {task.completedAt?.toDate?.() ? task.completedAt.toDate().toLocaleDateString() : 'Recent'}
                  </div>
                </div>
                <div className="px-2 py-1 bg-emerald-400/10 text-emerald-400 rounded-lg text-[8px] font-black uppercase tracking-tighter border border-emerald-400/20">
                  Verified
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <p className="text-[8px] text-text-muted uppercase font-bold">Location</p>
                  <p className="text-[10px] font-bold flex items-center gap-1 truncate text-text-secondary">
                    <MapPin className="w-2.5 h-2.5 text-primary" /> {task.location}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] text-text-muted uppercase font-bold">Res. Time</p>
                  <p className="text-[10px] font-bold flex items-center gap-1 text-text-secondary">
                    <Clock className="w-2.5 h-2.5 text-primary" /> 2h 45m
                  </p>
                </div>
              </div>

              <Link href={`/coordinator/tasks/${task.id}`}>
                <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 transition-all">
                  View Report Details <ChevronRight className="w-3 h-3 text-primary" />
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-4">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <p className="text-text-muted text-sm italic">No completed missions found.</p>
        </div>
      )}
    </div>
  );
}
