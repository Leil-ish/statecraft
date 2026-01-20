"use client"

import { NationHeader } from "./nation-header"
import { StatCard } from "./stat-card"
import { IssueCard } from "./issue-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  RefreshCw, 
  Sparkles, 
  Zap,
  History,
  TrendingUp
} from "lucide-react"
import type { Nation, Issue, IssueOption, NationStats } from "@/lib/game-types"
import { getStatLabel } from "@/lib/game-types"

interface GameDashboardProps {
  nation: Nation
  currentIssue: Issue | null
  onSelectOption: (option: IssueOption) => void
  onGenerateIssue: () => void
  isLoading?: boolean
  recentChanges?: Partial<NationStats>
<<<<<<< HEAD
  history?: string[]
=======
>>>>>>> aaefdd64765519e046cb7e6491fd8a3c281bd993
}

const primaryStats: (keyof NationStats)[] = ["economy", "civilRights", "politicalFreedom", "environment"]
const secondaryStats: (keyof NationStats)[] = ["happiness", "crime", "education", "healthcare"]

export function GameDashboard({ 
  nation, 
  currentIssue, 
  onSelectOption, 
  onGenerateIssue,
  isLoading = false,
  recentChanges = {}
}: GameDashboardProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-serif font-medium text-foreground tracking-tight">Statecraft</span>
            <Badge variant="secondary" className="text-xs font-normal">
              Policy Simulation
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Rankings</span>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Nation Header */}
        <NationHeader nation={nation} />
        
        {/* Stats Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground">National Indicators</h2>
            <Badge variant="outline" className="text-xs font-normal">
              Current
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {primaryStats.map((stat) => (
              <StatCard 
                key={stat}
                statKey={stat}
                value={nation.stats[stat]}
                label={getStatLabel(stat)}
                change={recentChanges[stat]}
              />
            ))}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {secondaryStats.map((stat) => (
              <StatCard 
                key={stat}
                statKey={stat}
                value={nation.stats[stat]}
                label={getStatLabel(stat)}
                change={recentChanges[stat]}
                compact
              />
            ))}
          </div>
        </section>
        
        {/* Issue Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm uppercase tracking-wider text-muted-foreground">Policy Decision</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Review the situation and select your response
              </p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onGenerateIssue}
              disabled={isLoading}
              className="gap-2 bg-transparent"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              New Scenario
            </Button>
          </div>
          
          {currentIssue ? (
            <IssueCard 
              issue={currentIssue} 
              onSelectOption={onSelectOption}
              isLoading={isLoading}
            />
          ) : (
            <div className="p-10 rounded-lg border border-dashed border-border bg-card/50 text-center">
              <div className="mx-auto w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-4">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="text-base font-medium text-foreground font-serif mb-2">
                No Pending Matters
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                Your administration is operating smoothly. Generate a new policy 
                scenario to continue governing.
              </p>
              <Button onClick={onGenerateIssue} disabled={isLoading} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Generate Scenario
              </Button>
            </div>
          )}
        </section>
<<<<<<< HEAD

        {/* History Section */}
        <section>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">Decision History</h2>
          <div className="space-y-2">
            {history?.map((item, index) => (
              <div key={index} className="p-3 rounded-lg bg-card/50 border border-border text-sm text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
        </section>
=======
>>>>>>> aaefdd64765519e046cb7e6491fd8a3c281bd993
      </main>
    </div>
  )
}
