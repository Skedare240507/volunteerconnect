"use client";

export const dynamic = "force-dynamic";

import { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { 
  BarChart3, 
  Building2, 
  Users, 
  Settings, 
  ShieldCheck,
  Bell,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { logout, userData, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-[#060B12] text-white flex">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0A1628]/80 backdrop-blur-xl border-r border-white/5 flex flex-col fixed h-screen">
        <div className="p-8">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-gradient-to-tr from-accent to-accent/50 rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase italic">Control<span className="text-accent">Center</span></span>
          </Link>

          <nav className="space-y-2">
            <NavItem icon={BarChart3} label="Mission Control" href="/dashboard/admin" active={pathname === "/dashboard/admin"} />
            <NavItem icon={Building2} label="NGO Partners" href="/dashboard/admin/ngos" active={pathname === "/dashboard/admin/ngos"} />
            <NavItem icon={Users} label="Platform Users" href="/dashboard/admin/users" active={pathname === "/dashboard/admin/users"} />
            <NavItem icon={Settings} label="System Config" href="/dashboard/admin/settings" active={pathname === "/dashboard/admin/settings"} />
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-text-muted hover:text-white transition-colors w-full group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="font-bold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-12">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-accent font-bold text-[10px] uppercase tracking-widest bg-accent/10 px-2 py-0.5 rounded inline-block mb-1">SuperAdmin Node</h2>
            <p className="text-2xl font-black">System Terminal</p>
          </div>
          <div className="flex items-center gap-6">
            <button 
              title="View Notifications"
              aria-label="View Notifications"
              className="relative p-2 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all font-bold"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-[#060B12]" />
            </button>
            
            <div className="flex items-center gap-4 pl-6 border-l border-white/5">
              <div className="text-right">
                <p className="text-sm font-bold">{userData?.name || userData?.displayName || user?.displayName || "Administrator"}</p>
                <p className="text-[10px] text-accent uppercase font-black tracking-widest">{userData?.role || "System Admin"}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent border border-accent/30 flex items-center justify-center font-black text-sm">
                {(userData?.name || "A")[0]}
              </div>
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, href, active }: { icon: any, label: string, href: string, active?: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all ${
        active 
          ? "bg-accent/10 text-accent border border-accent/20" 
          : "text-text-secondary hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
      {active && <div className="ml-auto w-1 h-1 bg-accent rounded-full shadow-[0_0_8px_rgba(235,108,79,0.8)]" />}
    </Link>
  );
}
