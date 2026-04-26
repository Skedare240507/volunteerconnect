"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { CheckCircle2, Zap, AlertCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  type: 'success' | 'info' | 'warning' | 'alert';
  timestamp: any;
}

export default function LiveActivityFeed({ maxItems = 10, title = "Live Activity" }) {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "activities"),
      orderBy("timestamp", "desc"),
      limit(maxItems)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Activity[];
      setActivities(data);
    });

    return () => unsubscribe();
  }, [maxItems]);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold mb-6">{title}</h3>
      <div className="space-y-6">
        <AnimatePresence initial={false}>
          {activities.length > 0 ? (
            activities.map((act) => (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex gap-4"
              >
                <div className="mt-1">
                  <ActivityIcon type={act.type} />
                </div>
                <div>
                  <p className="text-sm font-bold">
                    {act.user} <span className="text-text-secondary font-normal">{act.action}</span>
                  </p>
                  <p className="text-xs text-text-muted mb-1">{act.target}</p>
                  <p className="text-[10px] text-text-muted">
                    {act.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || "Just now"}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-text-muted text-sm italic">
              No recent activity recorded
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ActivityIcon({ type }: { type: Activity['type'] }) {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    case 'warning':
      return <Clock className="w-4 h-4 text-amber-400" />;
    case 'alert':
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    default:
      return <Zap className="w-4 h-4 text-primary" />;
  }
}
