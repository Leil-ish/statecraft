"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  ChevronRight,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Scale
} from "lucide-react"
import type { Issue, IssueOption, NationStats } from "@/lib/game-types"

interface IssueCardProps {
  issue: Issue
  onSelectOption: (option: IssueOption) => void
  isLoading?: boolean
  era?: string
}

const categoryIcons: Record<string, any> = {
  "Economy": Zap,
  "Civil Rights": ShieldCheck,
  "Political": Scale,
  "Environment": Sparkles,
  "Security": AlertTriangle,
}

export function IssueCard({ issue, onSelectOption, isLoading = false, era }: IssueCardProps) {
  const isModern = era === "Information Age" || era === "Cyberpunk Era" || era === "Intergalactic Empire"
  const [hoveredOption, setHoveredOption] = useState<string | null>(null)
  const Icon = categoryIcons[issue.category] || Sparkles
  
  return (
    <div className="relative group">
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-[32px] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
      
      <div className={cn(
        "relative flex flex-col rounded-[32px] border backdrop-blur-2xl overflow-hidden shadow-2xl transition-all duration-500",
        isModern 
          ? "bg-white/10 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]" 
          : "bg-white/5 border-white/10 shadow-none"
      )}>
        {/* Top Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">National Priority</span>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{issue.category}</span>
                </div>
              </div>
              <Badge variant="outline" className="rounded-full border-white/10 text-white/40 text-[10px] font-bold tracking-widest px-3 py-1">
                DECREE #{issue.id.slice(0, 4).toUpperCase()}
              </Badge>
            </div>
            
            <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">
              {issue.title}
            </h2>
            
            <p className="text-white/60 leading-relaxed text-sm font-medium">
              {issue.description}
            </p>
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {issue.options.map((option, index) => (
              <motion.button
                key={option.id}
                onMouseEnter={() => setHoveredOption(option.id)}
                onMouseLeave={() => setHoveredOption(null)}
                onClick={() => !isLoading && onSelectOption(option)}
                disabled={isLoading}
                className={cn(
                  "w-full p-5 rounded-2xl text-left transition-all relative group/btn overflow-hidden",
                  "bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
                whileHover={{ x: 8 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Background Glow on Hover */}
                <AnimatePresence>
                  {hoveredOption === option.id && (
                    <motion.div
                      layoutId="optionGlow"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>

                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-white/40 border border-white/10">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-sm font-bold text-white group-hover/btn:text-blue-400 transition-colors">
                      {option.text}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/20 group-hover/btn:text-blue-400 transition-colors" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-8 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Decision Window Open</span>
          </div>
          <div className="flex items-center gap-1">
             <Sparkles className="h-3 w-3 text-purple-400" />
             <span className="text-[10px] font-bold text-purple-400/60 uppercase tracking-widest">AI Intelligence</span>
          </div>
        </div>
      </div>
    </div>
  )
}
