"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Crown, 
  MapPin, 
  Calendar,
  Landmark,
  Coins,
  FileText,
  Settings
} from "lucide-react"
import type { Nation } from "@/lib/game-types"
import { formatPopulation } from "@/lib/game-types"

interface NationHeaderProps {
  nation: Nation
}

export function NationHeader({ nation }: NationHeaderProps) {
  const foundedDate = new Date(nation.founded).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })
  
  return (
    <div className="relative overflow-hidden rounded-lg bg-card border border-border">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent" />
      
      <div className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Flag / Emblem */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 md:w-18 md:h-18 rounded-lg bg-primary/10 border border-border flex items-center justify-center">
              <span className="text-3xl md:text-4xl">{nation.flag}</span>
            </div>
          </div>
          
          {/* Nation Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-xl md:text-2xl font-medium text-foreground font-serif tracking-tight">
                {nation.name}
              </h1>
              <Badge variant="secondary" className="text-xs font-normal">
                {nation.governmentType}
              </Badge>
            </div>
            
            <p className="text-muted-foreground italic mb-4 text-balance">
              &ldquo;{nation.motto}&rdquo;
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Crown className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Leader:</span>
                <span className="text-foreground font-medium truncate">{nation.leader}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">Capital:</span>
                <span className="text-foreground font-medium truncate">{nation.capital}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Coins className="h-4 w-4 text-stat-economy" />
                <span className="text-muted-foreground">Currency:</span>
                <span className="text-foreground font-medium">{nation.currency}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Founded:</span>
                <span className="text-foreground font-medium">{foundedDate}</span>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex flex-col gap-2 md:text-right">
            <div className="flex items-center gap-2 md:justify-end">
              <Landmark className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold text-foreground">
                {formatPopulation(nation.stats.population)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Population</p>
            
            <div className="flex items-center gap-2 mt-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-lg font-semibold text-foreground">
                {nation.issuesResolved}
              </span>
              <span className="text-sm text-muted-foreground">issues resolved</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Settings className="h-4 w-4" />
            Nation Settings
          </Button>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <FileText className="h-4 w-4" />
            View History
          </Button>
        </div>
      </div>
    </div>
  )
}
