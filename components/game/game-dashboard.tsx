"use client"

import { NationHeader } from "./nation-header"
import { StatCard } from "./stat-card"
import { IssueCard } from "./issue-card"
import { WorldMap } from "./world-map"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { AuthModal } from "@/components/auth/auth-modal"
import { 
  RefreshCw, 
  Sparkles, 
  Zap,
  History as HistoryIcon,
  TrendingUp,
  LayoutDashboard,
  Globe,
  Settings,
  User,
  LogOut,
  ShieldCheck
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Nation, Issue, IssueOption, NationStats } from "@/lib/game-types"
import { getStatLabel } from "@/lib/game-types"

type GameView = "overview" | "history" | "rankings" | "system"

interface GameDashboardProps {
  nation: Nation
  currentIssue: Issue | null
  onSelectOption: (option: IssueOption) => void
  onGenerateIssue: () => void
  isLoading?: boolean
  recentChanges?: Partial<NationStats>
  decisionHistory?: string[]
  onNewEmpire?: () => void
  onResetProgress?: () => void
}

const primaryStats: (keyof NationStats)[] = ["economy", "civilRights", "politicalFreedom", "environment"]
const secondaryStats: (keyof NationStats)[] = ["happiness", "crime", "education", "healthcare", "technology"]

export function GameDashboard({ 
  nation, 
  currentIssue, 
  onSelectOption, 
  onGenerateIssue,
  isLoading = false,
  recentChanges = {},
  decisionHistory,
  onNewEmpire,
  onResetProgress
}: GameDashboardProps) {
  const { data: session } = useSession()

  const [currentView, setCurrentView] = useState<GameView>("overview")
  const [showEraLeap, setShowEraLeap] = useState(false)
  const [prevEra, setPrevEra] = useState<string | null>(null)

  // Track Era changes for the "Leap" animation
  useEffect(() => {
    if (nation?.era && prevEra && nation.era !== prevEra) {
      setShowEraLeap(true)
    }
    if (nation?.era) {
      setPrevEra(nation.era)
    }
  }, [nation?.era, prevEra])

  // Era-specific color themes
  const eraThemes: Record<string, string> = {
    "Stone Age": "from-orange-900/10 via-stone-950 to-stone-950 font-serif",
    "Bronze Age": "from-amber-900/10 via-stone-950 to-stone-950 font-serif",
    "Iron Age": "from-slate-900/10 via-slate-950 to-stone-950",
    "Classical Era": "from-blue-900/10 via-slate-950 to-slate-950",
    "Medieval Era": "from-red-900/10 via-slate-950 to-slate-950",
    "Renaissance": "from-emerald-900/10 via-slate-950 to-slate-950",
    "Industrial Revolution": "from-zinc-900/10 via-zinc-950 to-zinc-950",
    "Atomic Age": "from-cyan-900/10 via-slate-950 to-slate-950",
    "Information Age": "from-blue-900/10 via-slate-950 to-black font-sans",
    "Cyberpunk Era": "from-fuchsia-900/10 via-slate-950 to-black font-sans",
    "Intergalactic Empire": "from-indigo-900/10 via-black to-black font-sans",
  }

  const currentTheme = nation ? (eraThemes[nation.era] || eraThemes["Information Age"]) : eraThemes["Information Age"]

  const isStoneAge = nation?.era === "Stone Age" || nation?.era === "Bronze Age"
  const isModern = nation?.era === "Information Age" || nation?.era === "Cyberpunk Era" || nation?.era === "Intergalactic Empire"

  return (
    <div className={cn("min-h-screen text-slate-50 selection:bg-blue-500/30 bg-gradient-to-b transition-all duration-1000", currentTheme)}>
      <AnimatePresence>
        {showEraLeap && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl"
            onClick={() => setShowEraLeap(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="text-center p-12 rounded-full border border-white/10 bg-white/5 shadow-2xl relative overflow-hidden"
            >
              {/* Spinning Aura */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-amber-500/20 opacity-30 blur-3xl"
              />
              
              <div className="relative z-10 space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20"
                >
                  <Sparkles className="h-12 w-12 text-white" />
                </motion.div>
                
                <div className="space-y-2">
                  <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-amber-400">Era Advanced</h2>
                  <h1 className="text-6xl font-black text-white tracking-tighter">
                    {nation?.era}
                  </h1>
                </div>

                <p className="text-white/40 max-w-xs mx-auto text-sm font-medium leading-relaxed">
                  Your people have mastered new technologies and evolved their society. A new age begins.
                </p>

                <Button 
                  onClick={() => setShowEraLeap(false)}
                  className="mt-8 rounded-full px-8 bg-white text-black hover:bg-white/90 font-bold tracking-tight"
                >
                  Enter the New Age
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {isStoneAge && (
          <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('/textures/stone-texture.png')] pointer-events-none" />
        )}
        {isModern && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent)] pointer-events-none" />
        )}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Header Bar */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/20 backdrop-blur-2xl">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setCurrentView("overview")}>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Globe className="h-5 w-5 text-blue-400" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg font-black tracking-tighter text-white uppercase">Statecraft</h1>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Neural Link Active</p>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-1 p-1 bg-white/5 rounded-2xl border border-white/5">
              {[
                { id: "overview", label: "Overview", icon: LayoutDashboard },
                { id: "history", label: "Chronicles", icon: HistoryIcon },
                { id: "rankings", label: "Hegemony", icon: TrendingUp },
                { id: "system", label: "Systems", icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as GameView)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300",
                    currentView === item.id 
                      ? "bg-white/10 text-white shadow-lg" 
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center overflow-hidden">
                  {session.user?.image ? (
                    <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-4 w-4 text-purple-400" />
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[10px] font-black text-white uppercase tracking-wider leading-none">{session.user?.name || session.user?.email}</p>
                  <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-0.5">Imperial Overseer</p>
                </div>
              </div>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-10 px-6 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-widest">
                    Establish Neural Link
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-white/5">
                  <AuthModal />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>
      
      <main className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">
        <AnimatePresence mode="wait">
          {currentView === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              <NationHeader nation={nation} />
                
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Stats and Map */}
                <div className="lg:col-span-8 space-y-8">
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                        <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">National Indicators</h2>
                      </div>
                      <Badge variant="outline" className="rounded-full border-white/10 text-white/40 text-[10px] font-bold tracking-widest px-3">
                        LIVE TELEMETRY
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                         { label: "Stability", value: `${nation.stats.happiness}%`, color: "bg-emerald-500", icon: ShieldCheck, trend: "+2.4%" },
                         { label: "Economy", value: `${nation.stats.economy}%`, color: "bg-blue-500", icon: TrendingUp, trend: "+1.2%" },
                         { label: "Innovation", value: `${nation.stats.technology}%`, color: "bg-purple-500", icon: Sparkles, trend: "+4.8%" },
                         { label: "Liberty", value: `${nation.stats.politicalFreedom}%`, color: "bg-amber-500", icon: ShieldCheck, trend: "Stable" },
                       ].map((stat, i) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="group relative overflow-hidden rounded-[32px] border border-white/5 bg-white/[0.02] p-8 hover:bg-white/[0.05] transition-all duration-500"
                        >
                          <div className="flex justify-between items-start mb-6">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-opacity-10", stat.color.replace('bg-', 'bg-').replace('500', '500/10'))}>
                              <stat.icon className={cn("h-6 w-6", stat.color.replace('bg-', 'text-'))} />
                            </div>
                            <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] text-white/40 font-bold uppercase tracking-widest px-2 py-0.5">
                              {stat.trend}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{stat.label}</p>
                            <h3 className="text-3xl font-black text-white tracking-tighter">{stat.value}</h3>
                          </div>
                          <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: stat.value }}
                              className={cn("h-full", stat.color)}
                              transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {secondaryStats.map((stat) => (
                        <StatCard 
                          key={stat}
                          statKey={stat}
                          value={nation.stats[stat]}
                          label={getStatLabel(stat, nation.era)}
                          change={recentChanges[stat]}
                          compact
                          era={nation.era}
                        />
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
                      <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Global Influence</h2>
                    </div>
                    <WorldMap />
                  </section>
                </div>

                {/* Right Column: Decisions and Events */}
                <div className="lg:col-span-4 space-y-8">
                  <section className="sticky top-28 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
                        <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Active Decree</h2>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {currentIssue ? (
                        <motion.div
                          key={currentIssue.id}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.95 }}
                          transition={{ type: "spring", damping: 20, stiffness: 100 }}
                        >
                          <IssueCard 
                            issue={currentIssue} 
                            onSelectOption={onSelectOption}
                            isLoading={isLoading}
                            era={nation.era}
                          />
                        </motion.div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-8 rounded-[32px] bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center text-center gap-6 backdrop-blur-xl"
                        >
                          <div className="relative">
                            <motion.div 
                              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                              transition={{ duration: 3, repeat: Infinity }}
                              className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"
                            />
                            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-white/10 flex items-center justify-center">
                              <Zap className="h-8 w-8 text-blue-400" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-bold text-white tracking-tight">Administrative Silence</h3>
                            <p className="text-sm text-white/40 leading-relaxed max-w-[240px]">
                              The bureaucracy is awaiting your command. Generate a new legislative priority.
                            </p>
                          </div>
                          <Button 
                            onClick={onGenerateIssue} 
                            disabled={isLoading}
                            className="w-full h-12 rounded-2xl bg-white text-black hover:bg-white/90 font-bold uppercase tracking-widest text-xs transition-all shadow-xl shadow-white/10"
                          >
                            {isLoading ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Zap className="h-4 w-4 mr-2" />
                                Initialize Next Decree
                              </>
                            )}
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Mini History Feed */}
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-slate-500 rounded-full" />
                        <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Recent History</h2>
                      </div>
                      <div className="space-y-3">
                        {decisionHistory?.slice(-3).reverse().map((decision, i) => (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={i}
                            className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-3 items-start"
                          >
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <p className="text-xs text-white/60 leading-relaxed font-medium">
                              {decision}
                            </p>
                          </motion.div>
                        ))}
                        {(!decisionHistory || decisionHistory.length === 0) && (
                          <p className="text-xs text-white/20 italic px-4">No records yet.</p>
                        )}
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          )}

          {currentView === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8 max-w-4xl mx-auto"
            >
              <div className="flex flex-col gap-2 mb-8">
                <h1 className="text-4xl font-bold tracking-tighter">Annals of {nation.name}</h1>
                <p className="text-white/40 font-medium">The complete record of your reign across the ages.</p>
              </div>

              <div className="space-y-6">
                {(nation.historyLog || []).slice().reverse().map((entry, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={i}
                    className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex gap-6 items-start group hover:bg-white/10 transition-all"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <HistoryIcon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Chronicle Entry</span>
                        <div className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">#{ (nation.historyLog?.length || 0) - i }</span>
                      </div>
                      <p className="text-lg text-white/80 leading-relaxed font-medium">
                        {entry}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {(!nation.historyLog || nation.historyLog.length === 0) && (
                  <div className="p-12 rounded-3xl bg-white/5 border border-dashed border-white/10 text-center space-y-4">
                    <HistoryIcon className="h-12 w-12 text-white/10 mx-auto" />
                    <p className="text-white/20 italic">The chronicles are empty. Your story is yet to be written.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {currentView === "rankings" && (
            <motion.div
              key="rankings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8 max-w-4xl mx-auto"
            >
              <div className="flex flex-col gap-2 mb-8">
                <h1 className="text-4xl font-bold tracking-tighter">Global Hegemony</h1>
                <p className="text-white/40 font-medium">How your civilization compares to other world powers.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { name: nation.name, era: nation.era, score: 12500, self: true, rank: 1 },
                  { name: "Neo-Tokyo", era: "Cyberpunk Era", score: 11200, rank: 2 },
                  { name: "Atlantic Union", era: "Information Age", score: 9800, rank: 3 },
                  { name: "Lunar Colony", era: "Information Age", score: 8500, rank: 4 },
                  { name: "Spartan Hegemony", era: "Iron Age", score: 4200, rank: 5 },
                ].map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={i}
                    className={cn(
                      "p-6 rounded-3xl border backdrop-blur-xl flex items-center justify-between group transition-all",
                      item.self 
                        ? "bg-blue-500/10 border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.1)]" 
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold",
                        i === 0 ? "bg-amber-400 text-black" : 
                        i === 1 ? "bg-slate-300 text-black" :
                        i === 2 ? "bg-amber-700 text-white" :
                        "bg-white/5 text-white/40"
                      )}>
                        {item.rank}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-lg">{item.name}</h3>
                          {item.self && <Badge className="bg-blue-500 text-[8px] font-black h-4 px-1.5">YOU</Badge>}
                        </div>
                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{item.era}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-white tracking-tighter">{item.score.toLocaleString()}</div>
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Hegemony Score</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {currentView === "system" && (
            <motion.div
              key="system"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8 max-w-2xl mx-auto"
            >
              <div className="flex flex-col gap-2 mb-8">
                <h1 className="text-4xl font-bold tracking-tighter">System Interface</h1>
                <p className="text-white/40 font-medium">Manage your session, save data, and game preferences.</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <section className="p-8 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                      <Settings className="h-5 w-5 text-purple-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Game Settings</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">Visual Effects</h4>
                        <p className="text-xs text-white/40">Enable era-specific textures and animations.</p>
                      </div>
                      <div className="w-12 h-6 rounded-full bg-blue-600 flex items-center justify-end px-1 cursor-pointer">
                        <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">Auto-Save</h4>
                        <p className="text-xs text-white/40">Persist nation state after every decision.</p>
                      </div>
                      <div className="w-12 h-6 rounded-full bg-blue-600 flex items-center justify-end px-1 cursor-pointer">
                        <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="p-8 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Data Management</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      onClick={onNewEmpire}
                      className="h-20 rounded-2xl border-white/10 bg-white/5 flex flex-col gap-2 hover:bg-white/10"
                    >
                      <Sparkles className="h-5 w-5 text-blue-400" />
                      <span className="text-xs font-bold uppercase tracking-widest">New Empire</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={onResetProgress}
                      className="h-20 rounded-2xl border-white/10 bg-white/5 flex flex-col gap-2 hover:bg-white/10"
                    >
                      <RefreshCw className="h-5 w-5 text-purple-400" />
                      <span className="text-xs font-bold uppercase tracking-widest">Reset Progress</span>
                    </Button>
                  </div>
                </section>

                {session && (
                  <Button 
                    variant="ghost" 
                    onClick={() => signOut()}
                    className="w-full h-14 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 font-bold uppercase tracking-[0.2em] text-xs transition-all"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Terminate Neural Link (Logout)
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
