"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Map as MapIcon, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  HandHelping
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";

const menuItems = [
  { name: "Overview", icon: LayoutDashboard, href: "/dashboard/ngo" },
  { name: "Resources", icon: Package, href: "/dashboard/ngo/resources" },
  { name: "Coordinators", icon: Users, href: "/dashboard/ngo/coordinators" },
  { name: "Heatmap", icon: MapIcon, href: "/dashboard/ngo/map" },
];

export default function NgoDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout, userData, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("s") || "");

  // Protect NGO dashboard
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && userData && userData.role !== "ngodashboard" && userData.role !== "admin" && userData.role !== "superadmin") {
      // If user is a normal 'user' or 'coordinator', they shouldn't be here
      router.push("/login"); 
    }
  }, [user, userData, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
      // Fallback
      window.location.href = "/login";
    }
  };

  const handleSearch = (val: string) => {
    setSearchValue(val);
  };

  // Debounce search URL update to prevent lag
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchValue) params.set("s", searchValue);
      else params.delete("s");
      router.replace(`${pathname}?${params.toString()}`);
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timer);
  }, [searchValue, pathname, router, searchParams]);

  return (
    <div className="flex h-screen bg-[#0A1628] text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col bg-[#0F2137]/30 backdrop-blur-xl">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <HandHelping className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">Volunteer<span className="text-primary">Connect</span></span>
          </Link>
        </div>

        <nav className="flex-grow px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-secondary"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <Link href="/dashboard/ngo/settings">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-white/5 transition-colors">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </div>
          </Link>
          <div 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-[#0F2137]/10 backdrop-blur-md">
          <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-full border border-white/5 w-96">
            <Search className="w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search resources, tasks..." 
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-text-muted text-white"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Bell className="w-6 h-6 text-text-secondary cursor-pointer hover:text-white transition-colors" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] flex items-center justify-center rounded-full text-white font-bold">3</span>
            </div>
            
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="text-right">
                <p className="text-sm font-bold truncate max-w-[150px]">{userData?.name || userData?.displayName || user?.displayName || "User"}</p>
                <p className="text-[10px] text-primary uppercase font-bold tracking-widest text-right">{userData?.role || "NGO Dashboard"}</p>
              </div>
              {userData?.photoURL ? (
                <img src={userData.photoURL} alt="Profile" className="w-10 h-10 rounded-full border border-white/20 object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent border border-white/20 flex items-center justify-center font-bold text-white uppercase">
                  {(userData?.name || "U")[0]}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Area */}
        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
