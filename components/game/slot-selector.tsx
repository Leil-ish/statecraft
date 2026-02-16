"use client"

import { motion } from "framer-motion"
import { Plus, Trash2, Globe, History, TrendingUp, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Nation } from "@/lib/game-types"

interface SlotSelectorProps {
  slots: (Nation | null)[]
  onSelect: (slot: number) => void
  onDelete: (slot: number) => void
  isLoading?: boolean
}

export function SlotSelector({ slots, onSelect, onDelete, isLoading }: SlotSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
      {slots.map((nation, index) => {
        const slotNumber = index + 1
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: index * 0.15,
              type: "spring",
              damping: 25,
              stiffness: 120
            }}
            whileHover={{ y: -8 }}
            className={cn(
              "group relative overflow-hidden rounded-[40px] border transition-all duration-700",
              nation 
                ? "bg-gradient-to-br from-white/[0.08] to-white/[0.02] border-white/10 hover:border-blue-500/40 shadow-2xl" 
                : "bg-black/40 border-white/5 border-dashed hover:border-white/20 hover:bg-white/[0.02]"
            )}
          >
            {nation ? (
              <div className="p-10 h-full flex flex-col relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full" />
                    <div className="relative w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                      {nation.flag}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(slotNumber)
                    }}
                    className="h-10 w-10 rounded-full text-white/10 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 mb-8">
                  <h3 className="text-3xl font-black tracking-tight text-white group-hover:text-blue-400 transition-colors duration-500">
                    {nation.name}
                  </h3>
                  <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-blue-500/5 border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5">
                        {nation.era}
                      </Badge>
                      <Badge variant="outline" className="bg-white/5 border-white/10 text-white/30 text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5">
                        {nation.gameMode}
                      </Badge>
                      <div className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        Registry 0{slotNumber}
                      </span>
                    </div>
                </div>

                <div className="space-y-6 mb-10">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Public Order</span>
                      <span className="text-[10px] font-bold text-white/40">{nation.stats.happiness}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${nation.stats.happiness}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-400" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Infrastructure</span>
                      <span className="text-[10px] font-bold text-white/40">{nation.stats.technology}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${nation.stats.technology}%` }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className="h-full bg-gradient-to-r from-slate-600 to-slate-400" 
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => onSelect(slotNumber)}
                  disabled={isLoading}
                  className="mt-auto w-full h-14 rounded-2xl bg-white text-black hover:bg-blue-600 hover:text-white font-black text-xs uppercase tracking-widest transition-all duration-500 shadow-xl hover:shadow-blue-500/20"
                >
                  Assume Command
                </Button>
              </div>
            ) : (
              <div className="p-10 h-full flex flex-col items-center justify-center text-center space-y-6 relative z-10">
                <div className="relative group/icon">
                  <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full group-hover/icon:bg-blue-500/10 transition-colors duration-700" />
                  <div className="relative w-20 h-20 rounded-[2.5rem] bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:border-white/20 transition-all duration-700">
                    <Plus className="h-8 w-8 text-white/10 group-hover:text-white/40 transition-colors duration-700" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-white/30 text-lg uppercase tracking-tight">Available Charter</h4>
                  <p className="text-xs text-white/20 max-w-[200px] leading-relaxed">
                    No active administration found. Establish a new national doctrine.
                  </p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => onSelect(slotNumber)}
                  disabled={isLoading}
                  className="w-full h-12 rounded-2xl border-white/5 bg-white/[0.03] hover:bg-white/10 hover:border-white/20 font-black uppercase tracking-widest text-[10px] text-white/40 hover:text-white transition-all duration-500"
                >
                  Ratify
                </Button>
              </div>
            )}

            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
            
            {/* Animated Glow */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-500/[0.03] blur-[100px] rounded-full group-hover:bg-blue-500/[0.08] transition-all duration-700" />
          </motion.div>
        )
      })}
    </div>
  )
}
