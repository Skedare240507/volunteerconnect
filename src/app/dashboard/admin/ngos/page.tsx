"use client";

import { motion } from "framer-motion";
import { Search, Filter, MoreVertical, Building2, ExternalLink, ShieldCheck, Mail } from "lucide-react";

const ngos = [
  { id: 1, name: "Hands For Humanity", type: "Disaster Relief", activeResources: 12, coordinators: 45, status: "Verified", joined: "Oct 2024" },
  { id: 2, name: "City Food Bank", type: "Hunger", activeResources: 4, coordinators: 12, status: "Verified", joined: "Jan 2025" },
  { id: 3, name: "Medical Reach", type: "Health", activeResources: 28, coordinators: 110, status: "Verified", joined: "Jun 2023" },
  { id: 4, name: "Shelter Pune", type: "Housing", activeResources: 0, coordinators: 5, status: "Under Review", joined: "Yesterday" },
];

export default function AdminNgoManagement() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">NGO Partners</h1>
          <p className="text-text-secondary text-sm">Manage and audit across {ngos.length} registered organizations.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search NGOs..." 
              className="bg-white/5 border border-white/5 rounded-xl pl-12 pr-6 py-2 text-sm focus:outline-none focus:border-accent/40 w-64"
            />
          </div>
          <button className="flex items-center gap-2 bg-white/5 border border-white/5 px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/10 transition-all">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      <div className="glass rounded-[2rem] overflow-hidden border border-white/5">
        <table className="w-full text-left">
          <thead className="bg-white/[0.02] border-b border-white/5">
            <tr className="text-text-muted text-[10px] font-black uppercase tracking-widest">
              <th className="py-6 px-8">Organization</th>
              <th className="py-6 px-4">Category</th>
              <th className="py-6 px-4 text-center">Resources</th>
              <th className="py-6 px-4 text-center">Coordinators</th>
              <th className="py-6 px-4">Status</th>
              <th className="py-6 px-8">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {ngos.map((ngo, idx) => (
              <motion.tr 
                key={ngo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-5 px-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm tracking-tight">{ngo.name}</p>
                      <p className="text-[10px] text-text-muted">Since {ngo.joined}</p>
                    </div>
                  </div>
                </td>
                <td className="py-5 px-4">
                  <span className="text-xs font-medium text-text-secondary">{ngo.type}</span>
                </td>
                <td className="py-5 px-4 text-center">
                  <span className="text-sm font-bold">{ngo.activeResources}</span>
                </td>
                <td className="py-5 px-4 text-center">
                  <span className="text-sm font-bold">{ngo.coordinators}</span>
                </td>
                <td className="py-5 px-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${ngo.status === 'Verified' ? 'bg-emerald-400' : 'bg-accent animate-pulse'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${ngo.status === 'Verified' ? 'text-emerald-400' : 'text-accent'}`}>
                      {ngo.status}
                    </span>
                  </div>
                </td>
                <td className="py-5 px-8">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      title="Audit Logs" 
                      aria-label="Audit Logs"
                      className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-white transition-all"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                    <button 
                      title="Send Email" 
                      aria-label="Send Email"
                      className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-white transition-all"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button 
                      title="Open Profile" 
                      aria-label="Open Profile"
                      className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-white transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button 
                      title="More Options"
                      aria-label="More Options"
                      className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-white transition-all ml-2"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
