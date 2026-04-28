"use client";

import { motion } from "framer-motion";
import { 
  ClipboardList, 
  Search, 
  Filter, 
  MapPin, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  ChevronRight,
  Loader2,
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  CalendarPlus
} from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy, where } from "firebase/firestore";
import Link from "next/link";
import { exportToCSV, exportToXLSX, exportToPDF, addToGoogleCalendar } from "@/lib/export-utils";

export default function NgoTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // In a real app, we'd filter by the NGO's ID
    const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        // Prepare date for export
        dateStr: doc.data().createdAt?.toDate?.() ? doc.data().createdAt.toDate().toLocaleDateString() : 'N/A'
      })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = tasks.filter(t => 
    t.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.coordinatorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    const exportData = filtered.map(t => ({
      Title: t.title,
      Status: t.status,
      Location: t.location,
      Coordinator: t.coordinatorName || 'Unassigned',
      Date: t.dateStr
    }));

    const filename = `Mission_Operations_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'csv') exportToCSV(exportData, filename);
    else if (format === 'xlsx') exportToXLSX(exportData, filename);
    else exportToPDF(exportData, filename, "Mission Operations Report");
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400';
      case 'in-progress': return 'bg-amber-400/10 border-amber-400/20 text-amber-400';
      case 'assigned': return 'bg-blue-400/10 border-blue-400/20 text-blue-400';
      case 'declined': return 'bg-red-400/10 border-red-400/20 text-red-400';
      default: return 'bg-white/5 border-white/10 text-text-muted';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Operations Center</h1>
          <p className="text-text-secondary text-sm">Monitor live task execution and coordinator performance.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleExport('csv')}
              className="p-3 glass rounded-xl border border-white/5 hover:bg-white/10 transition-all group"
              title="Export CSV"
            >
              <Download className="w-5 h-5 text-text-muted group-hover:text-primary" />
            </button>
            <button 
              onClick={() => handleExport('xlsx')}
              className="p-3 glass rounded-xl border border-white/5 hover:bg-white/10 transition-all group"
              title="Export Google Sheets / XLSX"
            >
              <FileSpreadsheet className="w-5 h-5 text-text-muted group-hover:text-amber-400" />
            </button>
            <button 
              onClick={() => handleExport('pdf')}
              className="p-3 glass rounded-xl border border-white/5 hover:bg-white/10 transition-all group"
              title="Export PDF"
            >
              <FileText className="w-5 h-5 text-text-muted group-hover:text-red-400" />
            </button>
          </div>
          <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 border border-white/5">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm font-bold">{tasks.filter(t => t.status !== 'completed').length} Active Tasks</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow glass px-4 py-3 rounded-2xl flex items-center gap-3 border border-white/5">
          <Search className="w-5 h-5 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search by mission title, coordinator or location..." 
            className="bg-transparent border-none outline-none w-full text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="glass px-6 py-3 rounded-2xl flex items-center gap-2 font-medium border border-white/5">
          <Filter className="w-4 h-4" /> Filter Status
        </button>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 flex justify-center">
             <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="glass p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-grow space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${getStatusStyle(task.status)}`}>
                      {task.status}
                    </span>
                    <span className="text-[10px] text-text-muted font-bold flex items-center gap-1">
                       <Calendar className="w-3 h-3" />
                       {task.dateStr}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{task.title}</h3>
                    <div className="flex items-center gap-4 mt-2">
                       <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                          <MapPin className="w-3.5 h-3.5 text-primary" /> {task.location}
                       </div>
                       <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                          <User className="w-3.5 h-3.5 text-primary" /> {task.coordinatorName || 'Assigning...'}
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden xl:flex flex-col items-end gap-1">
                     <p className="text-[10px] text-text-muted font-black uppercase">ETA / Progress</p>
                     <p className="text-sm font-black text-text-secondary">
                        {task.status === 'completed' ? 'Delivered' : task.status === 'in-progress' ? 'En Route (8m)' : 'Pending Accept'}
                     </p>
                  </div>
                  <div className="h-10 w-px bg-white/5 hidden lg:block" />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => addToGoogleCalendar({
                        title: task.title,
                        location: task.location,
                        description: task.description || `Task: ${task.title}`,
                        date: task.createdAt?.toDate?.() || new Date()
                      })}
                      className="p-3 glass rounded-2xl hover:bg-white/10 transition-all text-text-muted hover:text-primary"
                      title="Add to Google Calendar"
                    >
                      <CalendarPlus className="w-5 h-5" />
                    </button>
                    <Link href={`/dashboard/ngo/tasks/${task.id}`}>
                      <button className="flex items-center gap-2 px-6 py-3 glass rounded-2xl font-bold text-xs border border-white/10 hover:bg-white/10 transition-all">
                        Details <ChevronRight className="w-4 h-4 text-primary" />
                      </button>
                    </Link>
                  </div>
                  <button title="Options" className="p-2 text-text-muted hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar (Visual Only) */}
              <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: task.status === 'completed' ? '100%' : task.status === 'in-progress' ? '65%' : '15%' }}
                   className={`h-full ${task.status === 'completed' ? 'bg-emerald-400' : task.status === 'in-progress' ? 'bg-amber-400' : 'bg-blue-400'}`}
                />
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center glass rounded-3xl space-y-6">
            <ClipboardList className="w-16 h-16 text-white/5 mx-auto" />
            <div>
              <h3 className="text-xl font-bold">No tasks assigned yet</h3>
              <p className="text-text-muted text-sm max-w-xs mx-auto">Tasks will appear here once a broadcast is matched to a coordinator.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
