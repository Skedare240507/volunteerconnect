"use client";

import { motion } from "framer-motion";
import { Save, Shield, Globe, Zap, Database, Key } from "lucide-react";

export default function AdminSettings() {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">System Configuration</h1>
        <p className="text-text-secondary text-sm">Fine-tune the platform's core engine and security parameters.</p>
      </div>

      <div className="space-y-6">
        {/* Security Section */}
        <section className="glass rounded-[2rem] p-8 space-y-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-accent/10 text-accent">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Authentication & Security</h3>
          </div>
          
          <div className="grid gap-6">
            <ToggleSetting 
              label="Enforce Multi-Factor Authentication" 
              desc="Require 2FA for all NGO and Admin level accounts." 
              defaultChecked 
            />
            <ToggleSetting 
              label="Stricter NGO Onboarding" 
              desc="Manual document verification required for all new registrations." 
            />
          </div>
        </section>

        {/* AI Engine Section */}
        <section className="glass rounded-[2rem] p-8 space-y-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-400/10 text-blue-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">AI Allocation Engine</h3>
          </div>
          
          <div className="space-y-6">
            <RangeSetting 
              label="Matching Sensitivity" 
              desc="How strictly the AI considers distance vs coordinator skills." 
              value={75}
            />
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-text-muted" />
                <span className="text-sm font-medium">Model: Gemini 1.5 Pro</span>
              </div>
              <button className="text-[10px] font-black uppercase tracking-widest text-accent border border-accent/30 px-3 py-1 rounded-full">
                Active
              </button>
            </div>
          </div>
        </section>

        {/* API Keys (Masked) */}
        <section className="glass rounded-[2rem] p-8 space-y-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-400/10 text-purple-400">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">API Integration</h3>
          </div>
          
          <div className="space-y-4">
            <ApiKeyInput label="Google Maps Key" value="AIzaSyA...jK92" />
            <ApiKeyInput label="Gemini API Key" value="AIzaSyD...zL10" />
          </div>
        </section>

        <div className="flex justify-end gap-4">
          <button className="px-8 py-3 rounded-2xl font-bold bg-white/5 hover:bg-white/10 transition-all border border-white/5">
            Reset Defaults
          </button>
          <button className="px-8 py-3 rounded-2xl font-bold bg-accent text-white shadow-lg shadow-accent/20 flex items-center gap-2 hover:scale-105 transition-all active:scale-95">
            <Save className="w-5 h-5" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleSetting({ label, desc, defaultChecked }: { label: string, desc: string, defaultChecked?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-8">
      <div>
        <p className="font-bold text-sm">{label}</p>
        <p className="text-xs text-text-muted leading-relaxed">{desc}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          defaultChecked={defaultChecked} 
          aria-label={label}
          title={label}
        />
        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/80 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent shadow-inner tracking-tight" />
      </label>
    </div>
  );
}

function RangeSetting({ label, desc, value }: { label: string, desc: string, value: number }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div>
          <p className="font-bold text-sm">{label}</p>
          <p className="text-xs text-text-muted">{desc}</p>
        </div>
        <span className="text-sm font-black text-accent">{value}%</span>
      </div>
      <input 
        type="range" 
        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent" 
        defaultValue={value}
        aria-label={label}
        title={label}
      />
    </div>
  );
}

function ApiKeyInput({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase text-text-muted tracking-widest ml-1">{label}</label>
      <div className="bg-white/5 border border-white/5 rounded-xl px-4 py-2 flex items-center justify-between">
        <code className="text-xs text-text-secondary font-mono">{value}</code>
        <button 
          title={`Change ${label}`}
          aria-label={`Change ${label}`}
          className="text-[10px] font-bold text-text-muted hover:text-white uppercase transition-colors"
        >
          Change
        </button>
      </div>
    </div>
  );
}
