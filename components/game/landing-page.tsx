"use client"

import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { 
  Globe, 
  Sparkles, 
  History, 
  Shield, 
  ChevronRight,
  Zap,
  Users,
  TrendingUp,
  X,
  FileText,
  Lock,
  Cpu,
  Fingerprint
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface LandingPageProps {
  onStart: () => void
}

export function LandingPage({ onStart }: LandingPageProps) {
  const [isManifestoOpen, setIsManifestoOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-black text-slate-50 overflow-x-hidden selection:bg-blue-500/30 font-sans">
      {/* Sophisticated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.02)_0%,transparent_70%)]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-3xl"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/50 blur-md rounded-full animate-pulse" />
              <Sparkles className="h-4 w-4 text-blue-400 relative z-10" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400/80">Neural Governance Protocol v2.0</span>
          </motion.div>

          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-7xl md:text-[120px] font-black tracking-tighter leading-[0.85] text-white"
            >
              STATE<span className="text-blue-600">CRAFT</span>
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.4 }}
              className="flex items-center justify-center gap-4 text-white/20"
            >
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-white/10" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em]">Forge Your Destiny</span>
              <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-white/10" />
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl mx-auto text-xl md:text-2xl text-white/40 font-medium leading-relaxed tracking-tight"
          >
            The ultimate simulation of power and consequence. Navigate the delicate balance of 
            civilization from the first fire to the final frontier.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
          >
            <Button 
              onClick={onStart}
              size="lg"
              className="h-16 px-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg group transition-all duration-500 hover:scale-[1.02] active:scale-95 shadow-[0_24px_48px_-12px_rgba(37,99,235,0.4)] border-t border-white/20"
            >
              INITIALIZE SEQUENCE
              <ChevronRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform duration-500" />
            </Button>
            
            <Dialog open={isManifestoOpen} onOpenChange={setIsManifestoOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  size="lg"
                  className="h-16 px-12 rounded-2xl bg-white/[0.03] border-white/10 hover:bg-white/[0.08] backdrop-blur-3xl text-white font-black text-lg transition-all duration-500 hover:scale-[1.02] active:scale-95 border-t border-white/5"
                >
                  VIEW MANIFESTO
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl bg-black/95 border-white/10 backdrop-blur-3xl text-white overflow-hidden rounded-[40px] p-0 gap-0">
                <div className="relative p-12 overflow-y-auto max-h-[80vh] selection:bg-blue-500/30">
                  <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
                  
                  <DialogHeader className="relative z-10 space-y-4 mb-12">
                    <div className="flex items-center gap-3 text-blue-500 mb-2">
                      <FileText className="h-6 w-6" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em]">Classified Document // 0x4F2A</span>
                    </div>
                    <DialogTitle className="text-5xl font-black tracking-tighter uppercase leading-none">
                      The Statecraft <br/>Manifesto
                    </DialogTitle>
                    <DialogDescription className="text-white/40 text-lg font-medium tracking-tight">
                      A philosophical directive on the nature of simulated power and historical inevitability.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="relative z-10 space-y-10 text-white/70 font-medium leading-relaxed text-lg">
                    <div className="space-y-4">
                      <h4 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                        <Fingerprint className="h-4 w-4 text-blue-500" />
                        01. THE OBSERVER PARADOX
                      </h4>
                      <p>
                        Power is not merely the ability to command; it is the capacity to endure the consequences of observation. In Statecraft, you are the observer and the observed—the architect of a system that will eventually outgrow its creator.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-blue-500" />
                        02. NEURAL GOVERNANCE
                      </h4>
                      <p>
                        The transition from primitive survival to intergalactic dominance is not linear. It is a series of recursive loops. Your role is to tune the parameters of these loops—balancing liberty against stability, and innovation against tradition.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                        <Lock className="h-4 w-4 text-blue-500" />
                        03. THE ETERNAL PROTOCOL
                      </h4>
                      <p>
                        Whether you choose the long road of history or the immediate grip of an eternal empire, the protocol remains the same: Adaptation is the only absolute. Every "Game Over" is simply a data point in the larger simulation of human potential.
                      </p>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Authorized By</p>
                        <p className="text-white font-black italic tracking-tighter">The Architect</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Protocol Date</p>
                        <p className="text-white font-black tabular-nums tracking-tighter">2026.02.12</p>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={History}
            title="Historical Evolution"
            description="Start in the Stone Age and guide your tribe through the ages, mastering technology and culture."
            color="amber"
            delay={0.4}
          />
          <FeatureCard 
            icon={Zap}
            title="AI-Driven Crises"
            description="Encounter dynamic dilemmas generated by Cloudflare AI that react to your specific form of government."
            color="blue"
            delay={0.5}
          />
          <FeatureCard 
            icon={Shield}
            title="Complex Governance"
            description="Balance economy, civil rights, and political freedom as you navigate the treacherous waters of power."
            color="purple"
            delay={0.6}
          />
        </div>
      </section>

      {/* Game Modes Preview */}
      <section className="relative py-20 px-6 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">CHOOSE YOUR PATH</h2>
            <p className="text-white/40 font-medium">Two ways to build your empire</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ModeCard 
              title="Chronological"
              subtitle="The Long Road"
              description="A strategic journey from 10,000 BCE to the distant future. Every era brings unique challenges and visual transformations."
              icon={History}
              features={["Era Transitions", "Tech Tree Progression", "Historical Dilemmas"]}
              className="bg-gradient-to-br from-amber-500/10 to-orange-500/5"
            />
            <ModeCard 
              title="Eternal"
              subtitle="Modern Dominance"
              description="Start in the Information Age with a fully developed nation. Focus on pure policy, global influence, and modern crises."
              icon={Globe}
              features={["Immediate Advanced Tech", "Modern Geopolitics", "Law Repository"]}
              className="bg-gradient-to-br from-blue-500/10 to-purple-500/5"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem label="Active Nations" value="1.2k+" icon={Globe} />
            <StatItem label="Decisions Made" value="450k+" icon={Zap} />
            <StatItem label="Eras Mastered" value="8" icon={History} />
            <StatItem label="AI Models" value="Cloudflare" icon={Sparkles} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-white/5 bg-black/20">
        <div className="max-w-6xl mx-auto flex flex-col md:row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-black text-white text-xs">S</div>
            <span className="font-bold tracking-tighter text-white">STATECRAFT</span>
          </div>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-white/40">
            <a href="#" className="hover:text-blue-400 transition-colors">Twitter</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Discord</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Github</a>
          </div>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">© 2026 Statecraft Protocol. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description, color, delay }: any) {
  const colors: any = {
    blue: "text-blue-400 bg-blue-400/5 border-blue-400/10",
    amber: "text-amber-400 bg-amber-400/5 border-amber-400/10",
    purple: "text-purple-400 bg-purple-400/5 border-purple-400/10",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      className="p-10 rounded-[40px] bg-white/[0.02] border border-white/5 backdrop-blur-3xl hover:bg-white/[0.05] transition-all duration-500 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-transparent group-hover:from-blue-500/[0.02] transition-colors duration-500" />
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 relative z-10", colors[color])}>
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-2xl font-black text-white mb-4 tracking-tighter relative z-10">{title}</h3>
      <p className="text-white/40 leading-relaxed font-medium relative z-10">{description}</p>
    </motion.div>
  )
}

function ModeCard({ title, subtitle, description, icon: Icon, features, className }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className={cn("p-12 rounded-[48px] border border-white/5 backdrop-blur-3xl space-y-10 group relative overflow-hidden transition-all duration-700 hover:bg-white/[0.02]", className)}
    >
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">{subtitle}</p>
          <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">{title}</h3>
        </div>
        <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 text-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
          <Icon className="h-8 w-8" />
        </div>
      </div>
      
      <p className="text-white/40 text-lg font-medium leading-relaxed tracking-tight relative z-10">{description}</p>
      
      <ul className="grid grid-cols-1 gap-4 relative z-10">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-center gap-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
            {f}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

function StatItem({ label, value, icon: Icon }: any) {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-3 text-white/20 mb-1">
        <Icon className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em]">{label}</span>
      </div>
      <div className="text-5xl font-black text-white tracking-tighter">{value}</div>
    </div>
  )
}
