"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Image as ImageIcon, 
  Paperclip,
  User,
  Check,
  CheckCheck,
  Loader2,
  MapPin
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore";

const COORDINATORS = [
  { id: "VC-HCF-001", name: "Rahul Kulkarni", status: "Online", lastMsg: "Delivered medical kit to Sector 4", time: "2m ago", avatar: "RK" },
  { id: "VC-HCF-002", name: "Sneha Patil", status: "Away", lastMsg: "On my way to the rescue site.", time: "15m ago", avatar: "SP" },
  { id: "VC-HCF-003", name: "Arjun Mehta", status: "Offline", lastMsg: "Task completed successfully.", time: "1h ago", avatar: "AM" },
];

export default function NgoMessagesPage() {
  const [activeChat, setActiveChat] = useState(COORDINATORS[0]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulated messages for the active coordinator
    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "asc")
    );
    
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, [activeChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setInput("");
    
    try {
      await addDoc(collection(db, "messages"), {
        sender: "NGO Admin",
        content: msg,
        role: "admin",
        targetId: activeChat.id,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6">
      {/* Sidebar - Contacts */}
      <div className="w-80 flex flex-col gap-6">
        <div className="glass p-4 rounded-[2rem] border border-white/5 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search coordinators..." 
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-1">
            {COORDINATORS.map((coord) => (
              <button
                key={coord.id}
                onClick={() => setActiveChat(coord)}
                className={`w-full p-4 rounded-2xl flex items-center gap-3 transition-all ${
                  activeChat.id === coord.id 
                    ? 'bg-primary/20 border border-primary/20 shadow-lg' 
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                    activeChat.id === coord.id ? 'bg-primary text-white' : 'bg-white/5 text-text-muted'
                  }`}>
                    {coord.avatar}
                  </div>
                  {coord.status === 'Online' && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0A1628]" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="font-bold text-sm truncate">{coord.name}</h4>
                    <span className="text-[8px] text-text-muted">{coord.time}</span>
                  </div>
                  <p className="text-[10px] text-text-muted truncate">{coord.lastMsg}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="glass p-6 rounded-[2rem] border border-white/5 bg-primary/5">
           <h5 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">Quick Help</h5>
           <p className="text-[10px] text-text-secondary leading-relaxed">
             Need to broadcast to everyone? Use the <span className="text-primary font-bold">Announcements</span> tool in settings.
           </p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 glass rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
             </div>
             <div>
                <h3 className="font-bold">{activeChat.name}</h3>
                <div className="flex items-center gap-2">
                   <div className={`w-1.5 h-1.5 rounded-full ${activeChat.status === 'Online' ? 'bg-emerald-400' : 'bg-white/20'}`} />
                   <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{activeChat.status}</span>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <button title="Voice Call" className="p-3 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10"><Phone className="w-4 h-4 text-text-muted" /></button>
             <button title="Video Call" className="p-3 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10"><Video className="w-4 h-4 text-text-muted" /></button>
             <div className="w-px h-6 bg-white/5 mx-2" />
             <button title="More Options" className="p-3 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10"><MoreVertical className="w-4 h-4 text-text-muted" /></button>
          </div>
        </div>

        {/* Messages List */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
               <Send className="w-16 h-16 mb-4" />
               <p className="italic text-sm">Start a conversation with {activeChat.name}</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'admin' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] space-y-1.5`}>
                   <div className={`p-4 rounded-2xl text-sm ${
                     msg.role === 'admin' 
                       ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10' 
                       : 'bg-white/5 border border-white/5 text-text-secondary rounded-tl-none'
                   }`}>
                     {msg.content}
                   </div>
                   <div className={`flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-text-muted ${msg.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      {msg.createdAt?.toDate?.() ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                      {msg.role === 'admin' && <CheckCheck className="w-2.5 h-2.5 text-primary" />}
                   </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="p-6 bg-white/5 border-t border-white/5">
           <div className="flex items-center gap-4 bg-black/20 border border-white/10 rounded-2xl p-2 pl-4">
              <button title="Attach File" className="p-2 hover:bg-white/10 rounded-xl transition-all"><Paperclip className="w-4 h-4 text-text-muted" /></button>
              <button title="Attach Image" className="p-2 hover:bg-white/10 rounded-xl transition-all"><ImageIcon className="w-4 h-4 text-text-muted" /></button>
              <div className="w-px h-6 bg-white/5 mx-2" />
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={`Message ${activeChat.name}...`}
                className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-text-muted"
              />
              <button 
                title="Send Message"
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
              >
                <Send className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>

      {/* Right Sidebar - Info */}
      <div className="w-72 hidden xl:flex flex-col gap-6">
         <div className="glass p-6 rounded-[2rem] border border-white/5 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-white/10">
               <span className="text-2xl font-black text-primary">{activeChat.avatar}</span>
            </div>
            <h4 className="font-bold text-lg">{activeChat.name}</h4>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Field Coordinator</p>
            
            <div className="mt-8 grid grid-cols-2 gap-3">
               <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-text-muted font-black uppercase">Tasks</p>
                  <p className="text-sm font-black text-primary">12</p>
               </div>
               <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-text-muted font-black uppercase">Rating</p>
                  <p className="text-sm font-black text-accent">4.9</p>
               </div>
            </div>
         </div>

         <div className="glass p-6 rounded-[2rem] border border-white/5 space-y-4">
            <h5 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Active Task Region</h5>
            <div className="aspect-square bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/73.8567,18.5204,12,0/300x300?access_token=pk.placeholder')] bg-cover opacity-50 grayscale" />
               <MapPin className="w-8 h-8 text-primary relative z-10 animate-bounce" />
            </div>
            <p className="text-[10px] text-center text-text-secondary flex items-center justify-center gap-2">
               <MapPin className="w-3 h-3" /> Hadapsar Sector 4, Pune
            </p>
         </div>
      </div>
    </div>
  );
}
