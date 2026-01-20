"use client"

import React from "react"

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
  HeartPulse
} from "lucide-react"
import type { NationStats } from "@/lib/game-types"
import { getStatDescription } from "@/lib/game-types"

const statConfig: Record<keyof NationStats, { 
  icon: React.ElementType
  color: string
  bgColor: string
}> = {
  economy: { 
    icon: DollarSign, 
    color: "text-stat-economy",
    bgColor: "bg-stat-economy/10"
  },
  civilRights: { 
    icon: Scale, 
    color: "text-stat-civil-rights",
    bgColor: "bg-stat-civil-rights/10"
  },
  politicalFreedom: { 
    icon: Vote, 
    color: "text-stat-political-freedom",
    bgColor: "bg-stat-political-freedom/10"
  },
  population: { 
    icon: Users, 
    color: "text-stat-population",
    bgColor: "bg-stat-population/10"
  },
  environment: { 
    icon: Leaf, 
    color: "text-stat-environment",
    bgColor: "bg-stat-environment/10"
  },
  gdp: { 
    icon: TrendingUp, 
    color: "text-stat-economy",
    bgColor: "bg-stat-economy/10"
  },
  happiness: { 
    icon: Smile, 
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  crime: { 
    icon: ShieldAlert, 
    color: "text-destructive",
    bgColor: "bg-destructive/10"
  },
  education: { 
    icon: GraduationCap, 
    color: "text-stat-civil-rights",
    bgColor: "bg-stat-civil-rights/10"
  },
  healthcare: { 
    icon: HeartPulse, 
    color: "text-stat-environment",
    bgColor: "bg-stat-environment/10"
  },
}

interface StatCardProps {
  statKey: keyof NationStats
  value: number
  label: string
  change?: number
  compact?: boolean
}

export function StatCard({ statKey, value, label, change, compact = false }: StatCardProps) {
  const config = statConfig[statKey]
  const Icon = config.icon
  const description = getStatDescription(statKey, value)
  const isPercentStat = !["population", "gdp"].includes(statKey)
  
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
        <div className={cn("p-2 rounded-md", config.bgColor)}>
          <Icon className={cn("h-4 w-4", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className="text-sm font-medium text-foreground">{description}</p>
        </div>
        {change !== undefined && change !== 0 && (
          <div className={cn(
            "flex items-center gap-0.5 text-xs font-medium",
            change > 0 ? "text-primary" : "text-destructive"
          )}>
            {change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(change)}
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className="p-4 rounded-lg bg-card border border-border hover:border-primary/20 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("p-2 rounded-md", config.bgColor)}>
          <Icon className={cn("h-4 w-4", config.color)} />
        </div>
        {change !== undefined && change !== 0 && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            change > 0 
              ? "bg-primary/10 text-primary" 
              : "bg-destructive/10 text-destructive"
          )}>
            {change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {change > 0 ? "+" : ""}{change}
          </div>
        )}
      </div>
      
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-medium text-foreground mb-2">{description}</p>
      
      {isPercentStat && (
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className={cn("h-full rounded-full transition-all duration-500", config.bgColor.replace("/10", ""))}
            style={{ width: `${Math.min(value, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}
