"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Vote, 
  Users, 
  Leaf,
  DollarSign,
  Smile,
  ShieldAlert,
  GraduationCap,
  HeartPulse,
  Zap
} from "lucide-react"
import type { NationStats } from "@/lib/game-types"
import { getStatDescription } from "@/lib/game-types"

const statConfig: Record<keyof NationStats, { 
  icon: React.ElementType
  color: string
  glowColor: string
  orbGradient: string
}> = {
  economy: { 
    icon: DollarSign, 
    color: "text-emerald-400",
    glowColor: "rgba(52, 211, 153, 0.5)",
    orbGradient: "from-emerald-500/20 to-emerald-900/40"
  },
  civilRights: { 
    icon: Scale, 
    color: "text-blue-400",
    glowColor: "rgba(96, 165, 250, 0.5)",
    orbGradient: "from-blue-500/20 to-blue-900/40"
  },
  politicalFreedom: { 
    icon: Vote, 
    color: "text-purple-400",
    glowColor: "rgba(192, 132, 252, 0.5)",
    orbGradient: "from-purple-500/20 to-purple-900/40"
  },
  population: { 
    icon: Users, 
    color: "text-orange-400",
    glowColor: "rgba(251, 146, 60, 0.5)",
    orbGradient: "from-orange-500/20 to-orange-900/40"
  },
  environment: { 
    icon: Leaf, 
    color: "text-green-400",
    glowColor: "rgba(74, 222, 128, 0.5)",
    orbGradient: "from-green-500/20 to-green-900/40"
  },
  gdp: { 
    icon: TrendingUp, 
    color: "text-yellow-400",
    glowColor: "rgba(250, 204, 21, 0.5)",
    orbGradient: "from-yellow-500/20 to-yellow-900/40"
  },
  happiness: { 
    icon: Smile, 
    color: "text-pink-400",
    glowColor: "rgba(244, 114, 182, 0.5)",
    orbGradient: "from-pink-500/20 to-pink-900/40"
  },
  crime: { 
    icon: ShieldAlert, 
    color: "text-red-400",
    glowColor: "rgba(248, 113, 113, 0.5)",
    orbGradient: "from-red-500/20 to-red-900/40"
  },
  education: { 
    icon: GraduationCap, 
    color: "text-indigo-400",
    glowColor: "rgba(129, 140, 248, 0.5)",
    orbGradient: "from-indigo-500/20 to-indigo-900/40"
  },
  healthcare: { 
    icon: HeartPulse, 
    color: "text-cyan-400",
    glowColor: "rgba(34, 211, 238, 0.5)",
    orbGradient: "from-cyan-500/20 to-cyan-900/40"
  },
  technology: {
    icon: Zap,
    color: "text-amber-400",
    glowColor: "rgba(251, 191, 36, 0.5)",
    orbGradient: "from-amber-500/20 to-amber-900/40"
  }
}

interface StatCardProps {
  statKey: keyof NationStats
  value: number
  label: string
  change?: number
  compact?: boolean
  era?: string
}

export function StatCard({ statKey, value, label, change, compact = false, era }: StatCardProps) {
  const isModern = era === "Information Age" || era === "Cyberpunk Era" || era === "Intergalactic Empire"
  const config = statConfig[statKey]
  const Icon = config.icon
  const description = getStatDescription(statKey, value)
  const isPercentStat = !["population", "gdp", "technology"].includes(statKey)
  const isTechnology = statKey === "technology"
  
  if (compact) {
    return (
      <motion.div 
        layout
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl backdrop-blur-md border transition-all duration-500 group",
          isModern 
            ? "bg-white/10 border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
            : "bg-white/5 border-white/10"
        )}
      >
        <div className="relative">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-full blur-md"
            style={{ backgroundColor: config.glowColor }}
          />
          <div className={cn("relative p-2 rounded-full border border-white/20 bg-gradient-to-br", config.orbGradient)}>
            <Icon className={cn("h-4 w-4", config.color)} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider truncate">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-white tracking-tight">
              {isTechnology ? `${value}/100` : `${value.toLocaleString()}${isPercentStat ? "%" : ""}`}
            </span>
            <AnimatePresence mode="wait">
              {change !== undefined && change !== 0 && (
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                    change > 0 ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"
                  )}
                >
                  {change > 0 ? "+" : ""}{change}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      layout
      whileHover={{ y: -4 }}
      className={cn(
        "relative overflow-hidden p-6 rounded-3xl backdrop-blur-xl border shadow-2xl group transition-all duration-500",
        isModern 
          ? "bg-white/10 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]" 
          : "bg-white/5 border-white/10 shadow-none"
      )}
    >
      {/* Background Glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl"
        style={{ backgroundColor: config.glowColor }}
      />

      <div className="relative flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="relative">
            <motion.div 
              animate={{ 
                scale: [1, 1.15, 1],
                opacity: [0.4, 0.7, 0.4]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-full blur-lg"
              style={{ backgroundColor: config.glowColor }}
            />
            <div className={cn("relative p-3 rounded-full border border-white/20 bg-gradient-to-br shadow-inner", config.orbGradient)}>
              <Icon className={cn("h-6 w-6", config.color)} />
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {change !== undefined && change !== 0 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className={cn(
                  "flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-md border",
                  change > 0 
                    ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" 
                    : "text-red-400 bg-red-400/10 border-red-400/20"
                )}
              >
                {change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(change)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-[0.2em] mb-1">
            {label}
          </h3>
          <div className="flex items-baseline gap-2">
            <motion.span 
              key={value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-black text-white tracking-tighter"
            >
              {isTechnology ? `${value}/100` : `${value.toLocaleString()}${isPercentStat ? "%" : ""}`}
            </motion.span>
          </div>
        </div>

        <div className="mt-2">
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: isTechnology ? `${value}%` : `${value}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn("h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]", 
                isTechnology ? "bg-amber-400" : (value > 70 ? "bg-emerald-400" : value > 40 ? "bg-blue-400" : "bg-red-400")
              )}
            />
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-white/40 font-medium">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
