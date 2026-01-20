"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  ChevronRight,
  AlertCircle,
  Loader2
} from "lucide-react"
import type { Issue, IssueOption, NationStats } from "@/lib/game-types"
import { getStatLabel } from "@/lib/game-types"

interface IssueCardProps {
  issue: Issue
  onSelectOption: (option: IssueOption) => void
  isLoading?: boolean
}

const categoryColors: Record<string, string> = {
  "Economy": "bg-stat-economy/20 text-stat-economy border-stat-economy/30",
  "Civil Rights": "bg-stat-civil-rights/20 text-stat-civil-rights border-stat-civil-rights/30",
  "Political": "bg-stat-political-freedom/20 text-stat-political-freedom border-stat-political-freedom/30",
  "Environment": "bg-stat-environment/20 text-stat-environment border-stat-environment/30",
  "Social": "bg-primary/20 text-primary border-primary/30",
  "Security": "bg-destructive/20 text-destructive border-destructive/30",
  "Education": "bg-stat-civil-rights/20 text-stat-civil-rights border-stat-civil-rights/30",
  "Healthcare": "bg-stat-environment/20 text-stat-environment border-stat-environment/30",
}

function EffectPreview({ effects }: { effects: Partial<NationStats> }) {
  const entries = Object.entries(effects).filter(([_, value]) => value !== 0)
  
  if (entries.length === 0) return null
  
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {entries.map(([stat, value]) => (
        <div 
          key={stat}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
            (value as number) > 0 
              ? "bg-primary/10 text-primary" 
              : "bg-destructive/10 text-destructive"
          )}
        >
          {(value as number) > 0 
            ? <TrendingUp className="h-3 w-3" /> 
            : <TrendingDown className="h-3 w-3" />
          }
          {getStatLabel(stat as keyof NationStats)}
          <span className="font-bold">
            {(value as number) > 0 ? "+" : ""}{value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function IssueCard({ issue, onSelectOption, isLoading = false }: IssueCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showEffects, setShowEffects] = useState(false)
  
  const handleSelectOption = (option: IssueOption) => {
    setSelectedOption(option.id)
    onSelectOption(option)
  }
  
  const categoryColor = categoryColors[issue.category] ?? "bg-secondary text-secondary-foreground border-border"
  
  return (
    <Card className="overflow-hidden border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="outline" 
                className={cn("text-xs border", categoryColor)}
              >
                {issue.category}
              </Badge>
              <Badge variant="secondary" className="text-xs gap-1 font-normal">
                <Sparkles className="h-3 w-3" />
                Generated
              </Badge>
            </div>
            <CardTitle className="text-lg font-medium text-foreground text-balance font-serif">
              {issue.title}
            </CardTitle>
          </div>
        </div>
        <CardDescription className="text-muted-foreground mt-2 text-pretty leading-relaxed">
          {issue.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground">Policy Options</h4>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowEffects(!showEffects)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {showEffects ? "Hide" : "Show"} effects preview
          </Button>
        </div>
        
        <div className="space-y-3">
          {issue.options.map((option, index) => (
            <button
              key={option.id}
              onClick={() => handleSelectOption(option)}
              disabled={isLoading}
              className={cn(
                "w-full text-left p-4 rounded-lg border transition-all duration-200",
                "hover:border-primary/50 hover:bg-primary/5",
                "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background",
                selectedOption === option.id 
                  ? "border-primary bg-primary/10" 
                  : "border-border bg-secondary/30",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-medium",
                  selectedOption === option.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {String.fromCharCode(65 + index)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-relaxed">
                    {option.text}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    — {option.supporter}
                  </p>
                  {showEffects && <EffectPreview effects={option.effects} />}
                </div>
                <ChevronRight className={cn(
                  "h-5 w-5 flex-shrink-0 transition-transform",
                  selectedOption === option.id 
                    ? "text-primary translate-x-1" 
                    : "text-muted-foreground"
                )} />
              </div>
            </button>
          ))}
        </div>
        
        {isLoading && (
          <div className="flex items-center justify-center gap-2 mt-4 py-3 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Processing your decision...</span>
          </div>
        )}
        
        <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-muted/50">
          <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Your decisions will shape the future of your nation. Consider the long-term 
            consequences carefully before making your choice.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
