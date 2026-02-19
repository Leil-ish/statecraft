"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Globe, AlertTriangle, MapPinned } from "lucide-react"
import type { GameEra, MapCrisis, Region, RegionPoint } from "@/lib/game-types"

interface GeopoliticalJurisdictionProps {
  era: GameEra
  nationName: string
  stats?: {
    politicalFreedom: number
    happiness: number
    population: number
  }
  regions?: Region[]
  crises?: MapCrisis[]
  onCrisisClick?: (crisis: MapCrisis) => void
  onRegionClick?: (region: Region) => void
}

interface Point {
  x: number
  y: number
}

const TERRITORY_SHAPES: Point[][] = [
  [{ x: 42, y: 42 }, { x: 58, y: 42 }, { x: 58, y: 58 }, { x: 42, y: 58 }],
  [{ x: 35, y: 40 }, { x: 50, y: 35 }, { x: 65, y: 40 }, { x: 60, y: 60 }, { x: 40, y: 65 }],
  [{ x: 30, y: 30 }, { x: 50, y: 25 }, { x: 70, y: 30 }, { x: 75, y: 50 }, { x: 70, y: 70 }, { x: 50, y: 75 }, { x: 30, y: 70 }, { x: 25, y: 50 }],
  [{ x: 20, y: 20 }, { x: 40, y: 15 }, { x: 60, y: 15 }, { x: 80, y: 20 }, { x: 85, y: 50 }, { x: 80, y: 80 }, { x: 50, y: 85 }, { x: 20, y: 80 }, { x: 15, y: 50 }],
  [{ x: 10, y: 10 }, { x: 30, y: 5 }, { x: 70, y: 5 }, { x: 90, y: 10 }, { x: 95, y: 50 }, { x: 90, y: 90 }, { x: 70, y: 95 }, { x: 30, y: 95 }, { x: 10, y: 90 }, { x: 5, y: 50 }],
]

const REGION_SHAPES: Record<string, RegionPoint[]> = {
  "r-heartland": [
    { x: 40, y: 40 }, { x: 58, y: 38 }, { x: 62, y: 52 }, { x: 50, y: 60 }, { x: 38, y: 52 },
  ],
  "r-coast": [
    { x: 60, y: 30 }, { x: 78, y: 36 }, { x: 82, y: 52 }, { x: 68, y: 58 }, { x: 58, y: 48 },
  ],
  "r-highlands": [
    { x: 20, y: 24 }, { x: 38, y: 28 }, { x: 34, y: 44 }, { x: 18, y: 42 },
  ],
  "r-frontier": [
    { x: 22, y: 56 }, { x: 38, y: 54 }, { x: 46, y: 74 }, { x: 30, y: 84 }, { x: 16, y: 72 },
  ],
}

const ERA_CAPTIONS: Record<GameEra, string> = {
  "Stone Age": "The firelight marks our limits. Beyond is only shadow.",
  "Bronze Age": "The rivers guide our reach; the stone records our stay.",
  "Iron Age": "Walls of stone and wills of iron define the sovereign soil.",
  "Classical Era": "The law extends as far as the messenger can ride.",
  "Medieval Era": "Fealty binds the land more tightly than any border.",
  "Renaissance": "Reason maps the world; the horizon is no longer a ghost.",
  "Industrial Revolution": "Steel rails pierce the wilderness, claiming the unknown.",
  "Atomic Age": "A world divided by invisible lines and terrible power.",
  "Information Age": "Borders blur in the light of the fiber-optic web.",
  "Cyberpunk Era": "Corporate enclaves rise where nations once breathed.",
  "Intergalactic Empire": "The stars themselves are but points on a larger map.",
}

function pointsToPath(points: Point[]): string {
  if (points.length === 0) return ""
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ")
  return `${d} Z`
}

function centroid(points: RegionPoint[]): Point {
  const total = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 })
  return { x: total.x / points.length, y: total.y / points.length }
}

function regionShape(region: Region, index: number): RegionPoint[] {
  if (region.shape && region.shape.length >= 3) return region.shape
  const regionId = region.id
  const known = REGION_SHAPES[regionId]
  if (known) return known

  const layouts: Point[][] = [
    [{ x: 26, y: 30 }, { x: 42, y: 30 }, { x: 42, y: 44 }, { x: 26, y: 44 }],
    [{ x: 44, y: 30 }, { x: 60, y: 30 }, { x: 60, y: 44 }, { x: 44, y: 44 }],
    [{ x: 26, y: 46 }, { x: 42, y: 46 }, { x: 42, y: 60 }, { x: 26, y: 60 }],
    [{ x: 44, y: 46 }, { x: 60, y: 46 }, { x: 60, y: 60 }, { x: 44, y: 60 }],
  ]
  return layouts[index % layouts.length]
}

function severityStyle(severity: MapCrisis["severity"]) {
  if (severity === "high") return { dot: "fill-red-500", aura: "fill-red-500/25", size: 1.1 }
  if (severity === "medium") return { dot: "fill-amber-400", aura: "fill-amber-400/20", size: 0.9 }
  return { dot: "fill-sky-400", aura: "fill-sky-400/20", size: 0.75 }
}

function regionFill(stability: number) {
  if (stability < 35) return "fill-red-500/15"
  if (stability < 55) return "fill-amber-500/12"
  return "fill-emerald-500/10"
}

export function GeopoliticalJurisdiction({ era, nationName, stats, regions = [], crises = [], onCrisisClick, onRegionClick }: GeopoliticalJurisdictionProps) {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null)

  const territoryLevel = useMemo(() => {
    if (!stats) return 0
    if (stats.population > 100000000) return 4
    if (stats.population > 50000000) return 3
    if (stats.population > 10000000) return 2
    if (stats.population > 1000000) return 1
    return 0
  }, [stats?.population])

  const pathD = useMemo(() => pointsToPath(TERRITORY_SHAPES[territoryLevel]), [territoryLevel])
  const isModern = ["Information Age", "Cyberpunk Era", "Intergalactic Empire"].includes(era)
  const chronicleFragment = ERA_CAPTIONS[era] || ERA_CAPTIONS["Information Age"]

  const selectedRegion = selectedRegionId ? regions.find((r) => r.id === selectedRegionId) || null : null
  const selectedRegionCrisisCount = selectedRegion ? crises.filter((c) => c.regionId === selectedRegion.id).length : 0
  const hasActionableSignal = crises.length > 0
  const regionCenterById = useMemo(() => {
    const centers = new Map<string, Point>()
    regions.forEach((region, idx) => {
      centers.set(region.id, centroid(regionShape(region, idx)))
    })
    return centers
  }, [regions])

  const crisisCountByRegion = useMemo(() => {
    const counts = new Map<string, number>()
    for (const crisis of crises) {
      if (!crisis.regionId) continue
      counts.set(crisis.regionId, (counts.get(crisis.regionId) || 0) + 1)
    }
    return counts
  }, [crises])
  const crisisRenderPointById = useMemo(() => {
    const points = new Map<string, Point>()
    const seenByRegion = new Map<string, number>()

    for (const crisis of crises) {
      if (!crisis.regionId) {
        points.set(crisis.id, { x: crisis.x, y: crisis.y })
        continue
      }

      const center = regionCenterById.get(crisis.regionId)
      if (!center) {
        points.set(crisis.id, { x: crisis.x, y: crisis.y })
        continue
      }

      const index = seenByRegion.get(crisis.regionId) || 0
      seenByRegion.set(crisis.regionId, index + 1)
      const total = crisisCountByRegion.get(crisis.regionId) || 1

      // Keep dots near their region centroid and fan out only when stacked.
      const radius = total > 1 ? Math.min(2.2, 0.6 + total * 0.25) : 0
      const angle = total > 1 ? (Math.PI * 2 * index) / total : 0
      points.set(crisis.id, {
        x: center.x + radius * Math.cos(angle),
        y: center.y - 3.8 + radius * Math.sin(angle),
      })
    }

    return points
  }, [crises, regionCenterById, crisisCountByRegion])

  useEffect(() => {
    if (regions.length === 0) {
      setSelectedRegionId(null)
      return
    }

    // Preserve explicit user selection if it still exists.
    if (selectedRegionId && regions.some((r) => r.id === selectedRegionId)) return

    // Do not auto-focus to avoid misleading jumps when crisis data updates.
    setSelectedRegionId(null)
  }, [regions, selectedRegionId])

  return (
    <div
      className={cn(
        "relative w-full aspect-[16/9] rounded-[32px] overflow-hidden shadow-2xl transition-all duration-1000 bg-slate-950/40 backdrop-blur-2xl border border-white/5",
        crises.length > 0 && onCrisisClick ? "cursor-crosshair" : "cursor-default"
      )}
    >
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)]" />
      </div>

      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full p-8 select-none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="grid-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.1" className="text-blue-400/20" />
          </pattern>
        </defs>

        <rect width="100" height="100" fill="url(#grid-pattern)" className="opacity-50" />

        {regions.map((region, idx) => {
          const shape = regionShape(region, idx)
          const regionPath = pointsToPath(shape)
          const center = centroid(shape)
          const isSelected = selectedRegionId === region.id
          const crisisCount = crisisCountByRegion.get(region.id) || 0
          const isCrisisRegion = crisisCount > 0
          return (
            <g key={region.id}>
              {isCrisisRegion && (
                <path
                  d={regionPath}
                  className="fill-red-500/8 pointer-events-none"
                  stroke="none"
                />
              )}
              <path
                d={regionPath}
                className={cn(
                  "cursor-pointer stroke-white/20 transition-all",
                  regionFill(region.stability),
                  isSelected
                    ? "stroke-blue-300/80"
                    : isCrisisRegion
                      ? "stroke-amber-300/80"
                      : "hover:stroke-white/45"
                )}
                strokeWidth={isSelected ? 0.8 : isCrisisRegion ? 0.7 : 0.45}
                onPointerDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSelectedRegionId(region.id)
                  onRegionClick?.(region)
                }}
              />
              <text
                x={center.x}
                y={center.y}
                textAnchor="middle"
                className="fill-white/65 text-[3.2px] font-semibold pointer-events-none"
              >
                {region.name.split(" ")[0]}
              </text>
              {isCrisisRegion && (
                <g className="pointer-events-none">
                  <circle cx={center.x} cy={center.y - 3.5} r={2.2} className="fill-amber-400/90" />
                  <text x={center.x} y={center.y - 2.8} textAnchor="middle" className="fill-black text-[2.8px] font-black">
                    {crisisCount}
                  </text>
                </g>
              )}
            </g>
          )
        })}

        <path
          d={pathD}
          className={cn("fill-blue-500/5 transition-colors duration-1000", isModern ? "stroke-blue-400/50" : "stroke-white/20")}
          style={{ strokeDasharray: isModern ? "1, 2" : "none", strokeWidth: 0.35 }}
        />

        <path
          d={pathD}
          className={cn("fill-transparent stroke-[0.65] transition-colors duration-1000", isModern ? "stroke-blue-400/70" : "stroke-white/35")}
          style={{ strokeDasharray: isModern ? "1, 2" : "none" }}
        />

        <AnimatePresence>
          {crises.map((crisis) => {
            const style = severityStyle(crisis.severity)
            const renderPoint = crisisRenderPointById.get(crisis.id) || { x: crisis.x, y: crisis.y }
            return (
              <motion.g
                key={crisis.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className={onCrisisClick ? "cursor-pointer" : "cursor-default"}
                onPointerDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (!onCrisisClick) return
                  if (crisis.regionId) setSelectedRegionId(crisis.regionId)
                  onCrisisClick?.(crisis)
                }}
              >
                <motion.circle
                  cx={renderPoint.x}
                  cy={renderPoint.y}
                  r={1.6 + style.size}
                  className={style.aura}
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <circle cx={renderPoint.x} cy={renderPoint.y} r={0.6 + style.size * 0.2} className={style.dot} />
              </motion.g>
            )
          })}
        </AnimatePresence>
      </svg>

      <div className="absolute top-6 left-6 z-20 flex items-center gap-4 pointer-events-none">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
          <Globe className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Geopolitical Jurisdiction</h4>
          <p className="text-xs font-serif italic text-white/70">{nationName}</p>
        </div>
      </div>

      <div className="absolute top-6 right-6 z-20 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 backdrop-blur-md pointer-events-none">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-300" />
          <span className="text-[10px] uppercase tracking-widest text-white/50">Active crises</span>
        </div>
        <p className="text-lg font-black text-white leading-none mt-1">{crises.length}</p>
      </div>

      {selectedRegion && hasActionableSignal && (
        <div className="absolute right-6 bottom-24 z-20 w-60 rounded-2xl border border-white/10 bg-black/45 p-3 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-white">{selectedRegion.name}</p>
            <MapPinned className="h-4 w-4 text-blue-300" />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">{selectedRegion.terrain} · {selectedRegion.specialization}</p>
          <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
            <div>
              <p className="text-white/35">Stab</p>
              <p className="text-white font-semibold">{selectedRegion.stability}</p>
            </div>
            <div>
              <p className="text-white/35">Dev</p>
              <p className="text-white font-semibold">{selectedRegion.development}</p>
            </div>
            <div>
              <p className="text-white/35">Crises</p>
              <p className="text-white font-semibold">{selectedRegionCrisisCount}</p>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Chronicle Fragment:</span>
          <span className="text-[10px] font-medium text-white/40 italic truncate">{chronicleFragment}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Expansion Level</span>
            <span className="text-[10px] font-black text-blue-400/60 tracking-tighter">LVL 0{territoryLevel + 1}</span>
          </div>
        </div>
      </div>

      {isModern && hasActionableSignal && (
        <motion.div
          className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-blue-500/5 to-transparent h-20 w-full"
          animate={{ top: ["-20%", "120%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
      )}
    </div>
  )
}
