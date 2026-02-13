"use client"

import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { 
  Crown, 
  MapPin, 
  Calendar,
  Landmark,
  Coins,
  FileText,
  Shield,
  Zap,
  History as HistoryIcon,
  Atom,
  Sword,
  Scroll,
  Microscope,
  Rocket,
  Cpu,
  Orbit
} from "lucide-react"
import type { Nation, GameEra } from "@/lib/game-types"
import { formatPopulation } from "@/lib/game-types"

interface NationHeaderProps {
  nation: Nation
}

const eraConfig: Record<GameEra, { icon: any, color: string, bgColor: string }> = {
  "Stone Age": { icon: Sword, color: "text-orange-400", bgColor: "bg-orange-400/10" },
  "Bronze Age": { icon: Shield, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  "Iron Age": { icon: Sword, color: "text-slate-400", bgColor: "bg-slate-400/10" },
  "Classical Era": { icon: Landmark, color: "text-blue-400", bgColor: "bg-blue-400/10" },
  "Medieval Era": { icon: Shield, color: "text-red-400", bgColor: "bg-red-400/10" },
  "Renaissance": { icon: Scroll, color: "text-emerald-400", bgColor: "bg-emerald-400/10" },
  "Industrial Revolution": { icon: Zap, color: "text-yellow-400", bgColor: "bg-yellow-400/10" },
  "Atomic Age": { icon: Atom, color: "text-cyan-400", bgColor: "bg-cyan-400/10" },
  "Information Age": { icon: Microscope, color: "text-indigo-400", bgColor: "bg-indigo-400/10" },
  "Cyberpunk Era": { icon: Cpu, color: "text-fuchsia-400", bgColor: "bg-fuchsia-400/10" },
  "Intergalactic Empire": { icon: Orbit, color: "text-indigo-400", bgColor: "bg-indigo-400/10" },
}

export function NationHeader({ nation }: NationHeaderProps) {
  const foundedDate = new Date(nation.founded).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  })
  
  const currentEra = eraConfig[nation.era] || eraConfig["Information Age"]
  const EraIcon = currentEra.icon
  
  return (
    <div className="relative overflow-hidden rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 blur-[60px] rounded-full -ml-24 -mb-24" />
      
      <div className="relative p-8 md:p-10">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8">
          {/* Emblem Section */}
          <div className="flex-shrink-0 relative group">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shadow-2xl relative z-10"
            >
              <span className="text-5xl md:text-6xl filter drop-shadow-lg">{nation.flag}</span>
            </motion.div>
            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          {/* Main Info */}
          <div className="flex-1 min-w-0 space-y-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  {nation.name}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-full border-blue-500/30 bg-blue-500/10 text-blue-400 px-4 py-1 text-[10px] font-bold tracking-widest uppercase">
                    {nation.governmentType}
                  </Badge>
                  {nation.gameMode === "Chronological" && (
                    <Badge className={cn("rounded-full border-none px-4 py-1 text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5", currentEra.bgColor, currentEra.color)}>
                      <EraIcon className="h-3 w-3" />
                      {nation.era}
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-lg text-white/40 italic font-medium">
                &ldquo;{nation.motto}&rdquo;
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                  <Crown className="h-4 w-4 text-amber-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Head of State</span>
                  <span className="text-sm font-bold text-white/80">{nation.leader}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                  <MapPin className="h-4 w-4 text-rose-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Capital City</span>
                  <span className="text-sm font-bold text-white/80">{nation.capital}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                  <Coins className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">National Currency</span>
                  <span className="text-sm font-bold text-white/80">{nation.currency}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                  <Calendar className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Foundation Date</span>
                  <span className="text-sm font-bold text-white/80">{foundedDate}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Stats Column */}
          <div className="flex flex-row lg:flex-col gap-6 lg:items-end lg:pl-8 lg:border-l lg:border-white/5">
            <div className="flex flex-col lg:items-end">
              <div className="flex items-center gap-2 mb-1">
                <Landmark className="h-4 w-4 text-white/30" />
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Total Population</span>
              </div>
              <span className="text-3xl font-black text-white tracking-tighter">
                {formatPopulation(nation.stats.population)}
              </span>
            </div>
            
            {nation.gameMode === "Chronological" ? (
              <div className="flex flex-col lg:items-end w-full max-w-[160px]">
                <div className="flex items-center gap-2 mb-2 justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Technology</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400">{nation.stats.technology}/100</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${nation.stats.technology}%` }}
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col lg:items-end">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-white/30" />
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Stability Index</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-blue-400 tracking-tighter">
                    {nation.issuesResolved}
                  </span>
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Decisions</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
