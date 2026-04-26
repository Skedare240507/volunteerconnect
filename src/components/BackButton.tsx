"use client";

import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton({ label = "Back" }: { label?: string }) {
  const router = useRouter();
  
  return (
    <motion.button
      whileHover={{ x: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => router.back()}
      className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-6 font-bold text-sm bg-white/5 px-4 py-2 rounded-xl border border-white/5"
    >
      <ChevronLeft className="w-4 h-4" />
      {label}
    </motion.button>
  );
}
