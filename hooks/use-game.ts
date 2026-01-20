"use client"

import { useState, useCallback } from "react"
import type { Nation, Issue, IssueOption, NationStats } from "@/lib/game-types"

// Sample issues for demo - in production these would be AI-generated
const sampleIssues: Issue[] = [
  {
    id: "1",
    title: "The Great Transit Debate",
    description: "Public transportation advocates are demanding massive investment in rail and bus networks, arguing it will reduce traffic congestion and carbon emissions. However, car manufacturers and suburban residents warn this could hurt the automobile industry and limit personal freedom.",
    category: "Economy",
    options: [
      {
        id: "1a",
        text: "Invest heavily in public transit. We'll build a world-class rail network that connects every corner of the nation.",
        supporter: "Minister of Transportation",
        effects: { economy: -5, environment: 15, happiness: 5 }
      },
      {
        id: "1b",
        text: "Focus on improving roads and highways instead. Personal vehicles are a fundamental right.",
        supporter: "Automobile Industry Lobbyist",
        effects: { economy: 10, environment: -10, civilRights: 5 }
      },
      {
        id: "1c",
        text: "Implement a balanced approach with modest improvements to both public and private transportation.",
        supporter: "Urban Planning Council",
        effects: { economy: 0, environment: 5, happiness: 3 }
      }
    ]
  },
  {
    id: "2",
    title: "University Tuition Crisis",
    description: "Students are protesting skyrocketing university costs, with many graduating deep in debt. Educators argue that free education is a human right, while economists warn that abolishing tuition could strain the national budget.",
    category: "Education",
    options: [
      {
        id: "2a",
        text: "Make all public universities free. Education is the cornerstone of civilization.",
        supporter: "Student Union President",
        effects: { education: 20, economy: -15, happiness: 10, politicalFreedom: 5 }
      },
      {
        id: "2b",
        text: "Keep the current system but expand scholarship programs for underprivileged students.",
        supporter: "Education Minister",
        effects: { education: 5, economy: -5, civilRights: 5 }
      },
      {
        id: "2c",
        text: "Privatize universities to encourage competition and innovation in education.",
        supporter: "Free Market Foundation",
        effects: { education: -5, economy: 10, civilRights: -10 }
      }
    ]
  },
  {
    id: "3",
    title: "The Surveillance Question",
    description: "Following a series of crimes, law enforcement is requesting expanded surveillance powers including access to private communications and facial recognition technology. Civil liberties groups are alarmed.",
    category: "Security",
    options: [
      {
        id: "3a",
        text: "Grant full surveillance powers. Safety of citizens must come first.",
        supporter: "Chief of Police",
        effects: { crime: -20, civilRights: -25, politicalFreedom: -15 }
      },
      {
        id: "3b",
        text: "Reject all surveillance expansion. Privacy is sacred and non-negotiable.",
        supporter: "Civil Liberties Union",
        effects: { crime: 5, civilRights: 15, politicalFreedom: 20 }
      },
      {
        id: "3c",
        text: "Allow limited surveillance with strict judicial oversight and transparency requirements.",
        supporter: "Constitutional Court Justice",
        effects: { crime: -10, civilRights: -5, politicalFreedom: 5 }
      }
    ]
  },
  {
    id: "4",
    title: "Healthcare System Overhaul",
    description: "Healthcare costs are spiraling out of control, and millions remain uninsured. Some advocate for a universal healthcare system, while others prefer market-based solutions.",
    category: "Healthcare",
    options: [
      {
        id: "4a",
        text: "Implement universal healthcare funded by taxes. Everyone deserves medical care.",
        supporter: "Doctors Without Borders Representative",
        effects: { healthcare: 25, economy: -10, happiness: 15, civilRights: 10 }
      },
      {
        id: "4b",
        text: "Deregulate the healthcare market to increase competition and drive down prices.",
        supporter: "Healthcare Industry CEO",
        effects: { healthcare: -10, economy: 15, civilRights: -5 }
      },
      {
        id: "4c",
        text: "Create a public option that competes with private insurance.",
        supporter: "Health Policy Expert",
        effects: { healthcare: 10, economy: -5, happiness: 5 }
      }
    ]
  },
  {
    id: "5",
    title: "The Green Energy Transition",
    description: "Climate scientists are urging immediate action to transition away from fossil fuels. Energy companies warn of economic disruption and job losses in traditional industries.",
    category: "Environment",
    options: [
      {
        id: "5a",
        text: "Ban all new fossil fuel projects and massively subsidize renewable energy.",
        supporter: "Climate Action Coalition",
        effects: { environment: 25, economy: -15, happiness: -5 }
      },
      {
        id: "5b",
        text: "Continue with fossil fuels while investing modestly in clean energy research.",
        supporter: "Energy Industry Association",
        effects: { environment: -10, economy: 10 }
      },
      {
        id: "5c",
        text: "Set a 20-year transition plan with support for displaced workers.",
        supporter: "Economic Transition Board",
        effects: { environment: 10, economy: 0, happiness: 5, education: 5 }
      }
    ]
  }
]

export function useGame() {
  const [nation, setNation] = useState<Nation | null>(null)
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [recentChanges, setRecentChanges] = useState<Partial<NationStats>>({})
  const [usedIssueIds, setUsedIssueIds] = useState<Set<string>>(new Set())

  const createNation = useCallback((newNation: Nation) => {
    setIsLoading(true)
    // Simulate network delay
    setTimeout(() => {
      setNation(newNation)
      setIsLoading(false)
    }, 1000)
  }, [])

  const generateIssue = useCallback(() => {
    setIsLoading(true)
    setRecentChanges({})
    
    // Simulate AI generation delay
    setTimeout(() => {
      // Get unused issues
      const availableIssues = sampleIssues.filter(issue => !usedIssueIds.has(issue.id))
      
      // If all issues used, reset
      if (availableIssues.length === 0) {
        setUsedIssueIds(new Set())
        const randomIndex = Math.floor(Math.random() * sampleIssues.length)
        setCurrentIssue(sampleIssues[randomIndex])
        setUsedIssueIds(new Set([sampleIssues[randomIndex].id]))
      } else {
        const randomIndex = Math.floor(Math.random() * availableIssues.length)
        const selectedIssue = availableIssues[randomIndex]
        setCurrentIssue(selectedIssue)
        setUsedIssueIds(prev => new Set([...prev, selectedIssue.id]))
      }
      
      setIsLoading(false)
    }, 1500)
  }, [usedIssueIds])

  const selectOption = useCallback((option: IssueOption) => {
    if (!nation) return
    
    setIsLoading(true)
    
    // Apply effects
    setTimeout(() => {
      const newStats = { ...nation.stats }
      const changes: Partial<NationStats> = {}
      
      for (const [stat, change] of Object.entries(option.effects)) {
        if (stat in newStats) {
          const key = stat as keyof NationStats
          const newValue = Math.max(0, Math.min(100, newStats[key] + (change as number)))
          changes[key] = change as number
          newStats[key] = newValue
        }
      }
      
      setNation({
        ...nation,
        stats: newStats,
        issuesResolved: nation.issuesResolved + 1
      })
      setRecentChanges(changes)
      setCurrentIssue(null)
      setIsLoading(false)
    }, 1000)
  }, [nation])

  return {
    nation,
    currentIssue,
    isLoading,
    recentChanges,
    createNation,
    generateIssue,
    selectOption,
  }
}
