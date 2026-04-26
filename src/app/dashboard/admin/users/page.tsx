"use client";

import { motion } from "framer-motion";
import { 
  UserCircle, 
  Shield, 
  UserX, 
  UserCheck,
  UserPlus,
  Search, 
  Filter, 
  MoreVertical,
  Mail,
  Calendar,
  Lock,
  Unlock,
  Building2,
  Crown,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy, doc, updateDoc } from "firebase/firestore";
import { logAdminAction } from "@/lib/auditLog";
import AdminForm from "./AdminForm";
import { AnimatePresence } from "framer-motion";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [showAdminForm, setShowAdminForm] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleToggleBan = async (user: any) => {
    const isBanning = !user.isBanned;
    if (!confirm(`Are you sure you want to ${isBanning ? 'BAN' : 'UNBAN'} ${user.name || user.email}?`)) return;
    
    setProcessing(user.id);
    try {
      await logAdminAction(
        isBanning ? "BAN_USER" : "UNBAN_USER",
        "users",
        user.id,
        { isBanned: user.isBanned },
        { isBanned: isBanning }
      );
      
      await updateDoc(doc(db, "users", user.id), {
        isBanned: isBanning,
        bannedAt: isBanning ? new Date().toISOString() : null
      });
    } catch (err) {
      console.error(err);
      alert("Failed to update user status.");
    } finally {
      setProcessing(null);
    }
  };

  const handleRoleChange = async (userId: string, currentRole: string, newRole: string) => {
    if (!confirm(`Change role to ${newRole}?`)) return;
    try {
      await logAdminAction("CHANGE_ROLE", "users", userId, { role: currentRole }, { role: newRole });
      await updateDoc(doc(db, "users", userId), { role: newRole });
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    const headers = ["User Name", "Email", "Role", "Joined Date", "Status", "Banned At"];
    const rows = users.map(user => [
      user.name || "Anonymous",
      user.email || "",
      user.role || "user",
      user.createdAt?.toDate?.() ? user.createdAt.toDate().toISOString() : "",
      user.isBanned ? "Banned" : "Active",
      user.bannedAt || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(v => `"${v}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin': return <Crown className="w-4 h-4 text-amber-400" />;
      case 'admin': return <Shield className="w-4 h-4 text-accent" />;
      case 'ngodashboard': return <Building2 className="w-4 h-4 text-primary" />;
      case 'coordinator': return <UserCheck className="w-4 h-4 text-emerald-400" />;
      default: return <UserCircle className="w-4 h-4 text-text-muted" />;
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full min-h-0">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Governance</h1>
          <p className="text-text-secondary text-sm">Manage platform access, roles, and security for all accounts.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full xl:w-auto">
          <button 
            onClick={handleExportCSV}
            className="bg-white/10 hover:bg-white/15 px-4 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all text-sm backdrop-blur-md"
          >
            Export CSV
          </button>
          <button 
            onClick={() => setShowAdminForm(true)}
            className="bg-accent px-4 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-accent/20 hover:scale-105 transition-all text-sm"
          >
            <UserPlus className="w-4 h-4" /> Add Admin
          </button>
          <div className="glass px-4 py-3 rounded-2xl flex items-center gap-2 border border-white/5 ml-auto">
            <span className="text-sm font-bold">{users.length}</span>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest hidden sm:inline">Total Users</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 shrink-0">
        <div className="flex-grow glass px-4 py-3 rounded-2xl flex items-center gap-3 border border-white/5">
          <Search className="w-5 h-5 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search by name, email or role..." 
            className="bg-transparent border-none outline-none w-full text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button title="Toggle Filters" className="glass px-6 py-3 rounded-2xl flex items-center gap-2 font-medium border border-white/5">
          <Filter className="w-4 h-4" /> All Roles
        </button>
      </div>

      {/* Users Table */}
      <div className="glass rounded-3xl overflow-hidden border border-white/5 flex-1 min-h-0 flex flex-col">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#0A1628]/95 backdrop-blur-md z-10">
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-text-muted tracking-widest whitespace-nowrap">User</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-text-muted tracking-widest whitespace-nowrap">Role</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-text-muted tracking-widest whitespace-nowrap">Joined</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-text-muted tracking-widest whitespace-nowrap">Security</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((user) => (
                  <tr key={user.id} className={`hover:bg-white/5 transition-colors ${user.isBanned ? 'opacity-50 grayscale' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-lg text-text-secondary">
                          {(user.name || user.email || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${user.isBanned ? 'line-through' : ''}`}>
                            {user.name || 'Anonymous User'}
                          </p>
                          <p className="text-[10px] text-text-muted font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className="text-xs font-bold capitalize">{user.role || 'User'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <Calendar className="w-3.5 h-3.5 text-text-muted" />
                        {user.createdAt?.toDate?.() ? user.createdAt.toDate().toLocaleDateString() : 'Recent'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter inline-flex items-center gap-1.5 border ${
                        user.isBanned 
                          ? 'bg-red-400/10 border-red-400/20 text-red-400' 
                          : 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400'
                      }`}>
                        {user.isBanned ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        {user.isBanned ? 'Banned' : 'Active'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          disabled={processing === user.id}
                          onClick={() => handleToggleBan(user)}
                          className={`p-2 rounded-lg transition-all ${
                            user.isBanned 
                              ? 'bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20' 
                              : 'bg-red-400/10 text-red-400 hover:bg-red-400/20'
                          }`}
                          title={user.isBanned ? "Unban User" : "Ban User"}
                        >
                          {user.isBanned ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                        </button>
                        <select 
                          className="bg-white/5 border border-white/10 rounded-lg text-xs font-bold px-2 py-1 focus:outline-none"
                          value={user.role || 'user'}
                          onChange={(e) => handleRoleChange(user.id, user.role, e.target.value)}
                          title="Change User Role"
                        >
                          <option value="user">User</option>
                          <option value="coordinator">Coordinator</option>
                          <option value="ngodashboard">NGO</option>
                          <option value="admin">Admin</option>
                          <option value="superadmin">Super Admin</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-text-muted italic">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Admin Creation Modal */}
      <AnimatePresence>
        {showAdminForm && (
          <AdminForm 
            onClose={() => setShowAdminForm(false)} 
            onComplete={() => {
              // The onSnapshot listener will handle the update
            }} 
          />
        )}
      </AnimatePresence>
    </div>
    </div>
  );
}
