"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Sparkles, User, Bot, Loader2, Maximize2, Minimize2, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "bot"; content: string; timestamp: Date }[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, userData } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg, timestamp: new Date() }]);
    setLoading(true);

    try {
      const response = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMsg, 
          history: messages.map(m => ({ role: m.role, content: m.content })),
          context: {
            userRole: userData?.role || "ngo",
            userName: user?.displayName || "User",
            platform: "VolunteerConnect"
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Chatbot API Error:", response.status, errorText);
        throw new Error(`Failed to get response: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [...prev, { 
        role: "bot", 
        content: data.reply || data.response || "I'm here to help you coordinate impact. How can I assist you with resources or tasks today?", 
        timestamp: new Date() 
      }]);
    } catch (error: any) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [...prev, { 
        role: "bot", 
        content: `Sorry, I encountered an error: ${error.message}. Please check if the API is properly configured.`, 
        timestamp: new Date() 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`glass mb-4 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
              isExpanded ? "w-[450px] h-[700px]" : "w-[350px] h-[500px]"
            }`}
          >
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-primary/20 to-accent/20 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary relative">
                  <Bot className="w-6 h-6" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0A1628] shadow-[0_0_8px_#10b981]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">VC Assistant</h3>
                  <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Powered by Gemini</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  title={isExpanded ? "Collapse" : "Expand"}
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-white transition-colors"
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button 
                  title="Close Chat"
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
            >
              {messages.length === 0 && (
                <div className="py-10 text-center space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8 text-primary/50" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Welcome {user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}!</p>
                    <p className="text-xs text-text-muted px-6 mt-2 italic">
                      I can help you find resources, check task status, or explain how the platform works.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center px-4">
                    {["How to add resource?", "Check my tasks", "Emergency SOS?"].map(hint => (
                      <button 
                        key={hint} 
                        onClick={() => { setInput(hint); }}
                        className="text-[10px] font-bold px-3 py-1.5 glass rounded-lg border border-white/5 hover:bg-primary/10 hover:border-primary/20 transition-all text-text-secondary"
                      >
                        {hint}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-white/5 border border-white/5 text-text-secondary rounded-tl-none'
                  }`}>
                    {msg.content}
                    <div className={`text-[8px] mt-2 font-bold opacity-40 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/5 border-t border-white/5">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything..."
                  className="w-full bg-black/20 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-primary transition-all shadow-inner"
                />
                <button
                  title="Send Message"
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="absolute right-2 p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 overflow-hidden relative group ${
          isOpen ? 'bg-primary text-white rotate-90' : 'bg-primary text-white'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? (
          <X className="w-7 h-7 relative z-10" />
        ) : (
          <div className="relative z-10 flex flex-col items-center">
            <MessageSquare className="w-7 h-7" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            </div>
          </div>
        )}
      </motion.button>
    </div>
  );
}
