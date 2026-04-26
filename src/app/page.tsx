import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { HandHelping, Heart, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import ImpactMetrics from "@/components/ImpactMetrics";
import GlobalCrisisLiveMap from "@/components/GlobalCrisisLiveMap";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <Hero />

      {/* Features Preview */}
      <section className="px-6 py-20 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How it Works</h2>
            <p className="text-text-secondary">A 3-step process to maximize humanitarian impact.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard 
              number="01"
              title="Post Resource"
              description="NGOs list available resources like food, medicine, or skill-based aid."
              icon={<Zap className="text-yellow-400" />}
            />
            <StepCard 
              number="02"
              title="AI Matching"
              description="Our Gemini-powered engine finds the nearest, most qualified coordinator."
              icon={<ShieldCheck className="text-primary" />}
            />
            <StepCard 
              number="03"
              title="Task Completed"
              description="Coordinators deliver aid and verify completion via the mobile app."
              icon={<Heart className="text-pink-500" />}
            />
          </div>
        </div>
      </section>

      {/* Impact & Global Map */}
      <ImpactMetrics />
      <GlobalCrisisLiveMap />

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <HandHelping className="text-primary" />
            <span className="font-bold">VolunteerConnect</span>
          </div>
          <div className="text-sm text-text-muted">
            © 2025 VolunteerConnect Platform. Google Solution Challenge Entry.
          </div>
          <div className="flex gap-6 text-sm text-text-secondary">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ number, title, description, icon }: { number: string, title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="glass-card p-8 relative overflow-hidden group">
      <div className="text-6xl font-black text-white/5 absolute -top-2 -right-2 tracking-tighter group-hover:text-white/10 transition-colors">
        {number}
      </div>
      <div className="mb-6 p-4 bg-white/5 w-fit rounded-2xl">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
