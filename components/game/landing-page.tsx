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
  BookOpen,
  Scale,
  Scroll,
  Landmark
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
              <Landmark className="h-4 w-4 text-blue-400 relative z-10" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400/80">National Governance Framework // 1776-A</span>
          </motion.div>

          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl xs:text-6xl sm:text-7xl md:text-[120px] lg:text-[140px] font-black tracking-[-0.08em] leading-[0.8] text-white text-center flex flex-col sm:flex-row items-center justify-center sm:gap-4"
            >
              <span className="inline-block bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
                STATE
              </span>
              <span className="inline-block bg-gradient-to-b from-blue-400 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                CRAFT
              </span>
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.4 }}
              className="flex items-center justify-center gap-4 md:gap-6"
            >
              <div className="hidden xs:block h-[1px] w-8 md:w-16 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
              <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.4em] md:tracking-[0.8em] text-white/20 whitespace-nowrap">
                Architect of Civilizations
              </span>
              <div className="hidden xs:block h-[1px] w-8 md:w-16 bg-gradient-to-l from-transparent via-blue-500/20 to-transparent" />
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl mx-auto text-lg md:text-2xl text-white/30 font-medium leading-relaxed tracking-tight"
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
              BEGIN ADMINISTRATION
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
                      <Landmark className="h-6 w-6" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em]">National Charter // 1776-A</span>
                    </div>
                    <DialogTitle className="text-5xl font-black tracking-tighter uppercase leading-none">
                      The Statecraft <br/>Manifesto
                    </DialogTitle>
                    <DialogDescription className="text-white/40 text-lg font-medium tracking-tight">
                      A philosophical directive on the nature of governance, power, and historical legacy.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="relative z-10 space-y-10 text-white/70 font-medium leading-relaxed text-lg">
                    <div className="space-y-4">
                      <h4 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        01. THE OBSERVER PARADOX
                      </h4>
                      <p>
                        Governance is not merely the ability to command; it is the capacity to endure the consequences of leadership. In Statecraft, you are the architect of a national identity—a system designed to thrive beyond the tenure of any single individual.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                        <Scale className="h-4 w-4 text-blue-500" />
                        02. ADMINISTRATIVE DOCTRINE
                      </h4>
                      <p>
                        The transition from ancestral survival to a grand civilization is not linear. It is a series of strategic evolutions. Your role is to define the parameters of this growth—balancing liberty against national stability, and innovation against tradition.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                        <Scroll className="h-4 w-4 text-blue-500" />
                        03. THE ETERNAL CHARTER
                      </h4>
                      <p>
                        Whether you choose the long arc of history through the Eras or the immediate weight of an Eternal Empire, the mandate remains: Adaptability is the ultimate virtue of the state. Every decision is a testament to the enduring spirit of your people.
                      </p>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Ratified By</p>
                        <p className="text-white font-black tracking-tighter">The High Council</p>
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
            title="Policy Simulation"
            description="Navigate dynamic dilemmas powered by an advanced administrative engine that reacts to your legislative style."
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
              title="Eras"
              subtitle="The Long Road"
              description="A strategic journey from 10,000 BCE to the distant future. Every era brings unique challenges and visual transformations."
              icon={History}
              features={[
                "Evolutionary Gameplay",
                "Era-specific UI",
                "Historical Events"
              ]}
              className="bg-white/[0.02] border-white/5"
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
      className={cn("p-6 sm:p-8 md:p-12 rounded-[32px] md:rounded-[48px] border border-white/5 backdrop-blur-3xl space-y-6 md:space-y-10 group relative overflow-hidden transition-all duration-700 hover:bg-white/[0.02]", className)}
    >
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-6 relative z-10">
        <div className="space-y-2 md:space-y-3 w-full">
          <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-blue-500/80">{subtitle}</p>
          <h3 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-[-0.06em] uppercase leading-[0.85] break-words overflow-hidden">
            <span className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent block">
              {title}
            </span>
          </h3>
        </div>
        <div className="p-3 md:p-5 rounded-xl md:rounded-3xl bg-white/[0.03] border border-white/10 text-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shrink-0">
          <Icon className="h-5 w-5 md:h-8 md:w-8" />
        </div>
      </div>
      
      <p className="text-white/30 text-sm sm:text-base md:text-lg font-medium leading-relaxed tracking-tight relative z-10 max-w-md">
        {description}
      </p>
      
      <ul className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-1 gap-3 sm:gap-4 relative z-10">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-center gap-3 md:gap-4 text-[8px] md:text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] md:tracking-[0.3em]">
            <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-blue-600/50 shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
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
