"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Shield, Activity, Globe } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Region {
  id: string
  name: string
  path: string
  status: "stable" | "tension" | "powerhouse" | "neutral"
  details: string
}

const regions: Region[] = [
  { id: "na", name: "North America", path: "M 20,20 L 40,20 L 45,35 L 30,50 L 15,40 Z", status: "stable", details: "Economic stability remains high." },
  { id: "sa", name: "South America", path: "M 30,55 L 45,60 L 40,85 L 30,90 L 25,75 Z", status: "tension", details: "Rising civil unrest reported." },
  { id: "eu", name: "Europe", path: "M 50,25 L 65,25 L 68,35 L 60,45 L 52,40 Z", status: "powerhouse", details: "Technological innovation leader." },
  { id: "af", name: "Africa", path: "M 50,48 L 65,45 L 75,60 L 68,85 L 55,88 L 48,65 Z", status: "tension", details: "Resource disputes in central sectors." },
  { id: "as", name: "Asia", path: "M 70,20 L 95,20 L 98,50 L 85,65 L 72,55 L 68,35 Z", status: "stable", details: "Manufacturing output at record highs." },
  { id: "oc", name: "Oceania", path: "M 85,75 L 95,72 L 98,85 L 88,90 Z", status: "neutral", details: "Standard diplomatic relations." },
]

const statusConfig = {
  stable: { fill: "fill-blue-500/20", stroke: "stroke-blue-400/50", glow: "rgba(59, 130, 246, 0.3)", textColor: "text-blue-400" },
  tension: { fill: "fill-red-500/20", stroke: "stroke-red-400/50", glow: "rgba(239, 68, 68, 0.3)", textColor: "text-red-400" },
  powerhouse: { fill: "fill-yellow-500/20", stroke: "stroke-yellow-400/50", glow: "rgba(234, 179, 8, 0.3)", textColor: "text-yellow-400" },
  neutral: { fill: "fill-slate-500/20", stroke: "stroke-slate-400/50", glow: "rgba(100, 116, 139, 0.3)", textColor: "text-slate-400" },
}

export function WorldMap() {
  const [activeRegion, setActiveRegion] = useState<Region | null>(null)

  return (
    <div className="relative w-full aspect-[16/9] rounded-[32px] bg-[#020617]/40 backdrop-blur-2xl border border-white/5 overflow-hidden group">
      {/* HUD Elements */}
      <div className="absolute top-6 left-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Globe className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Satellite Link</h4>
          <p className="text-xs font-bold text-white tracking-tight">GLOBAL TELEMETRY ACTIVE</p>
        </div>
      </div>

      <div className="absolute top-6 right-6 flex items-center gap-3">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Signal</span>
          <div className="flex gap-0.5 mt-1">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={cn("w-1 h-2 rounded-full", i <= 3 ? "bg-blue-400" : "bg-white/10")} />
            ))}
          </div>
        </div>
      </div>

      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full p-12 lg:p-16 drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <g className="regions">
          {regions.map((region) => {
            const config = statusConfig[region.status]
            const isActive = activeRegion?.id === region.id
            const center = getCenter(region.path)

            return (
              <motion.g
                key={region.id}
                onMouseEnter={() => setActiveRegion(region)}
                onMouseLeave={() => setActiveRegion(null)}
                className="cursor-pointer"
              >
                {/* Connection lines to center point */}
                <motion.line 
                  x1="50" y1="50" x2={center.x} y2={center.y}
                  stroke="white" strokeWidth="0.1" strokeDasharray="1 1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isActive ? 0.2 : 0 }}
                />

                <motion.path
                  d={region.path}
                  className={cn("transition-all duration-700", config.fill, config.stroke)}
                  strokeWidth={isActive ? "1" : "0.4"}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    filter: isActive ? `drop-shadow(0 0 12px ${config.glow})` : "none"
                  }}
                  whileHover={{ 
                    fillOpacity: 0.6,
                  }}
                />
                
                {/* Node Point */}
                <motion.circle 
                  cx={center.x} 
                  cy={center.y} 
                  r={isActive ? "0.8" : "0.4"} 
                  className={cn("transition-all duration-300", isActive ? "fill-white" : "fill-white/20")}
                  animate={{
                    r: isActive ? [0.8, 1.2, 0.8] : 0.4,
                    opacity: isActive ? 1 : 0.5
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </motion.g>
            )
          })}
        </g>
      </svg>

      {/* Region Detail Card */}
      <AnimatePresence>
        {activeRegion && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-8 bottom-24 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl w-64 space-y-3 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-tight">{activeRegion.name}</h3>
              <Badge variant="outline" className={cn("text-[8px] font-black uppercase px-2 py-0 border-white/10", statusConfig[activeRegion.status].textColor)}>
                {activeRegion.status}
              </Badge>
            </div>
            <p className="text-[10px] text-white/40 leading-relaxed font-medium">
              {activeRegion.details}
            </p>
            <div className="pt-2 flex items-center gap-4 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-blue-400/60" />
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Secure</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="h-3 w-3 text-purple-400/60" />
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Synced</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend & Footer Info */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
        <div className="flex gap-6">
          {Object.entries(statusConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px]", config.fill.replace("fill-", "bg-").replace("/20", ""))} 
                   style={{ boxShadow: `0 0 8px ${config.glow}` }} />
              <span className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-black">{key}</span>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">System Nominal</span>
        </div>
      </div>
    </div>
  )
}

function getCenter(path: string) {
  const coords = path.match(/[\d.]+/g)?.map(Number) || []
  if (coords.length < 2) return { x: 50, y: 50 }
  
  let x = 0, y = 0
  const count = Math.floor(coords.length / 2)
  for (let i = 0; i < coords.length - 1; i += 2) {
    x += coords[i]
    y += coords[i+1]
  }
  return { x: x / count, y: y / count }
}
