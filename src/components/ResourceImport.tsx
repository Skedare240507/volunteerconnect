"use client";

import { useState } from "react";
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

interface ImportProps {
  onComplete: () => void;
  onClose: () => void;
}

export default function ResourceImport({ onComplete, onClose }: ImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
    }
  };

  const processFile = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const fileExt = file.name.split('.').pop()?.toLowerCase();

    try {
      if (fileExt === 'csv') {
        Papa.parse<Record<string, string>>(file, {
          header: true,
          complete: async (results: Papa.ParseResult<Record<string, string>>) => {
            await importData(results.data);
          },
          error: (err: Error) => {
            setError(`CSV Parsing Error: ${err.message}`);
            setLoading(false);
          }
        });
      } else if (fileExt === 'xlsx' || fileExt === 'xls') {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          await importData(json);
        };
        reader.onerror = () => {
          setError("Failed to read Excel file");
          setLoading(false);
        };
        reader.readAsArrayBuffer(file);
      } else {
        setError("Unsupported file format. Please use CSV or XLSX.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during import");
      setLoading(false);
    }
  };

  const importData = async (data: any[]) => {
    try {
      let count = 0;
      const batchSize = 10; // Process in small batches for stability
      
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        await Promise.all(batch.map(async (item: any) => {
          if (!item.title) return; // Skip empty rows

          await addDoc(collection(db, "resources"), {
            title: item.title,
            description: item.description || "Imported resource",
            locationName: item.locationName || item.location || "Unknown",
            affectedCount: Number(item.affectedCount) || 0,
            urgency: Number(item.urgency) || 3,
            status: item.status || "broadcasting",
            type: item.type || "general",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            aiScore: Math.floor(Math.random() * 20) + 75 // Mock AI score
          });
          count++;
        }));
      }

      setSuccess(count);
      setLoading(false);
      setTimeout(() => {
        onComplete();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(`Database Error: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-[#0F2137] border border-white/10 rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl"
      >
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Upload className="text-primary w-6 h-6" /> Import Resources
            </h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-muted"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-text-secondary text-sm">
              Upload a CSV or Excel file containing resource data. 
              Required column: <span className="text-white font-bold">title</span>.
            </p>

            <label className={`
              border-2 border-dashed rounded-[24px] p-12 flex flex-col items-center gap-4 cursor-pointer transition-all
              ${file ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}
            `}>
              <input type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
              {file ? (
                <>
                  <FileText className="w-12 h-12 text-primary" />
                  <div className="text-center">
                    <p className="font-bold text-white mb-1">{file.name}</p>
                    <p className="text-xs text-text-muted">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-text-muted" />
                  <div className="text-center">
                    <p className="font-bold text-text-secondary">Click to upload file</p>
                    <p className="text-xs text-text-muted mt-1">Support CSV, XLSX, XLS</p>
                  </div>
                </>
              )}
            </label>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-sm"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {success !== null && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 text-emerald-500 text-sm"
              >
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                Successfully imported {success} resources! Redirecting...
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl font-bold bg-white/5 hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={processFile}
              disabled={!file || loading || success !== null}
              className="flex-[2] px-6 py-4 rounded-2xl font-bold bg-primary shadow-lg shadow-primary/20 hover:shadow-primary/40 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
              aria-label={loading ? "Importing data..." : "Start Import"}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : "Start Import"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
