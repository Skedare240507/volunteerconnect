"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

interface ExportDataButtonProps {
  type: "admin" | "ngo";
  ngoId?: string; // required if type === 'ngo'
}

export default function ExportDataButton({ type, ngoId }: ExportDataButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const exportData: Record<string, any> = {};

      if (type === "admin") {
        // Fetch all platform data
        const usersSnap = await getDocs(collection(db, "users"));
        exportData.users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const resourcesSnap = await getDocs(collection(db, "resources"));
        exportData.resources = resourcesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const tasksSnap = await getDocs(collection(db, "tasks"));
        exportData.tasks = tasksSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      } else if (type === "ngo" && ngoId) {
        // Fetch only NGO specific data
        const resourcesQ = query(collection(db, "resources"), where("ngoId", "==", ngoId));
        const resourcesSnap = await getDocs(resourcesQ);
        exportData.resources = resourcesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      }

      // Convert to JSON and trigger download
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `volunteer_connect_${type}_export_${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export data. Please try again later.");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
        type === "admin" 
          ? "bg-white/5 border border-white/10 hover:bg-white/10 text-white" 
          : "bg-primary text-white shadow-lg hover:brightness-110"
      }`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {loading ? "Exporting..." : "Export Data"}
    </button>
  );
}
