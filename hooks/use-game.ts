"use client"

import { useState, useCallback, useEffect } from "react"
import { useSession } from "next-auth/react"
import type { Nation, Issue, IssueOption, NationStats, GameEra } from "@/lib/game-types"

const ERAS: GameEra[] = [
  "Stone Age",
  "Bronze Age",
  "Iron Age",
  "Classical Era",
  "Medieval Era",
  "Renaissance",
  "Industrial Revolution",
  "Atomic Age",
  "Information Age",
  "Cyberpunk Era",
  "Intergalactic Empire"
]

// Sample issues for fallback categorized by Era
const sampleIssues: Record<GameEra, Issue[]> = {
  "Stone Age": [
    {
      id: "stone-1",
      title: "The Fire Keepers",
      description: "A group of elders suggests that only a select few should be allowed to keep the fire burning through the night. Others argue that every family should have their own flame for warmth and protection.",
      category: "Society",
      options: [
        {
          id: "s1a",
          text: "Designate official Fire Keepers. Centralized control ensures the flame never dies.",
          supporter: "Elder Shaman",
          effects: { politicalFreedom: -10, technology: 15, stability: 10 } as any
        },
        {
          id: "s1b",
          text: "Fire for all. Every family must learn the secret of the spark.",
          supporter: "Young Hunter",
          effects: { politicalFreedom: 15, technology: 5, happiness: 10 } as any
        }
      ]
    },
    {
      id: "stone-2",
      title: "The Great Mammoth Hunt",
      description: "A massive herd of mammoths has been spotted. Should we risk the lives of our best hunters for a massive feast, or stick to gathering berries and small game?",
      category: "Food",
      options: [
        {
          id: "s2a",
          text: "Hunt the mammoths! Glory and meat for months!",
          supporter: "Chief Hunter",
          effects: { population: 10, happiness: 20, healthcare: -10 } as any
        },
        {
          id: "s2b",
          text: "Stay safe. The forest provides enough if we are patient.",
          supporter: "Gatherer Matriarch",
          effects: { population: 2, stability: 15, healthcare: 5 } as any
        }
      ]
    }
  ],
  "Bronze Age": [
    {
      id: "bronze-1",
      title: "The Copper Mines",
      description: "New copper deposits have been found. The miners demand better rations, while the bronze-smiths argue the ore should be prioritized for weapons to defend against raiders.",
      category: "Economy",
      options: [
        {
          id: "b1a",
          text: "Prioritize the army. Bronze spears will keep us safe.",
          supporter: "Warlord",
          effects: { crime: -15, economy: 5, happiness: -5 }
        },
        {
          id: "b1b",
          text: "Feed the workers. A well-fed miner is a productive miner.",
          supporter: "Overseer",
          effects: { economy: 15, happiness: 10, population: 5 }
        }
      ]
    }
  ],
  "Iron Age": [
    {
      id: "iron-1",
      title: "The Iron Plow",
      description: "Blacksmiths have developed a new iron plow that can cut through tougher soil. Farmers are eager to use it, but it requires a significant investment from the treasury.",
      category: "Technology",
      options: [
        {
          id: "i1a",
          text: "Subsidize the plows. Our granaries will overflow.",
          supporter: "Agricultural Advisor",
          effects: { economy: 20, technology: 10, population: 15 }
        },
        {
          id: "i1b",
          text: "Let the farmers pay. The state has other priorities.",
          supporter: "Treasurer",
          effects: { economy: 5, happiness: -10, stability: 5 } as any
        }
      ]
    }
  ],
  "Classical Era": [
    {
      id: "classical-1",
      title: "The Great Library",
      description: "Scholars propose building a massive library to house all known knowledge. Critics argue the gold would be better spent on the navy.",
      category: "Education",
      options: [
        {
          id: "c1a",
          text: "Build the Library. Knowledge is the greatest power.",
          supporter: "Philosopher",
          effects: { education: 25, technology: 15, economy: -10 }
        },
        {
          id: "c1b",
          text: "Expand the Navy. Trade and defense are paramount.",
          supporter: "Admiral",
          effects: { economy: 20, crime: -10, politicalFreedom: -5 }
        }
      ]
    }
  ],
  "Medieval Era": [
    {
      id: "medieval-1",
      title: "The Feudal Dispute",
      description: "Two powerful lords are feuding over a border village. One offers loyalty for your support; the other threatens to withhold his knights.",
      category: "Politics",
      options: [
        {
          id: "m1a",
          text: "Support the loyalist. We must reward fealty.",
          supporter: "Chancellor",
          effects: { politicalFreedom: -10, stability: 20, economy: 5 } as any
        },
        {
          id: "m1b",
          text: "Mediate a peace. Civil war would be disastrous.",
          supporter: "High Priest",
          effects: { stability: 10, happiness: 10, politicalFreedom: 5 }
        }
      ]
    }
  ],
  "Renaissance": [
    {
      id: "renaissance-1",
      title: "The Printing Press",
      description: "A new invention allows for the rapid mass-production of books. The church fears the spread of heresy, while merchants see a new industry.",
      category: "Science",
      options: [
        {
          id: "r1a",
          text: "Embrace the Press. Information must be free.",
          supporter: "Inventor",
          effects: { education: 20, politicalFreedom: 15, technology: 10 }
        },
        {
          id: "r1b",
          text: "Censor the output. Order must be maintained.",
          supporter: "Cardinal",
          effects: { politicalFreedom: -20, stability: 15, education: -5 } as any
        }
      ]
    }
  ],
  "Industrial Revolution": [
    {
      id: "industrial-1",
      title: "The Coal Mines",
      description: "Steam power is transforming industry, but the soot is choking the cities. Factory owners want to expand; health advocates want regulation.",
      category: "Economy",
      options: [
        {
          id: "ir1a",
          text: "Full Steam Ahead. Progress requires sacrifice.",
          supporter: "Industrialist",
          effects: { economy: 30, environment: -20, technology: 10 }
        },
        {
          id: "ir1b",
          text: "Limit the Smog. Our people need to breathe.",
          supporter: "City Physician",
          effects: { healthcare: 15, environment: 10, economy: -10 }
        }
      ]
    }
  ],
  "Atomic Age": [
    {
      id: "atomic-1",
      title: "The Nuclear Program",
      description: "Our scientists have split the atom. We can build a bomb to end all wars, or a reactor to power our future.",
      category: "Science",
      options: [
        {
          id: "a1a",
          text: "Build the Bomb. Peace through strength.",
          supporter: "General",
          effects: { crime: -30, politicalFreedom: -10, technology: 10 }
        },
        {
          id: "a1b",
          text: "Build the Reactor. Clean energy for all.",
          supporter: "Physicist",
          effects: { economy: 20, environment: 15, technology: 20 }
        }
      ]
    }
  ],
  "Information Age": [
    {
      id: "info-1",
      title: "The Social Network",
      description: "A new digital platform connects everyone but is being used to spread misinformation. Should we regulate it or protect free speech?",
      category: "Civil Rights",
      options: [
        {
          id: "in1a",
          text: "Regulate Content. Truth is a public good.",
          supporter: "Information Minister",
          effects: { stability: 15, politicalFreedom: -10, crime: -5 } as any
        },
        {
          id: "in1b",
          text: "Free Expression. Let the people decide.",
          supporter: "Tech Founder",
          effects: { politicalFreedom: 20, happiness: 10, stability: -10 } as any
        }
      ]
    }
  ],
  "Cyberpunk Era": [
    {
      id: "cyber-1",
      title: "Neon Surveillance",
      description: "Corporate entities want to install biometric scanners in every eye-implant to 'enhance security'. The underground hackers warn of total digital enslavement.",
      category: "Civil Rights",
      options: [
        {
            id: "cy1a",
            text: "Authorize Scanners. Order is the highest form of freedom.",
            supporter: "Corp-Sec Director",
            effects: { crime: -40, politicalFreedom: -30, economy: 20 }
          },
          {
            id: "cy1b",
            text: "Defend Digital Privacy. The soul is not for sale.",
            supporter: "Net-Runner",
            effects: { politicalFreedom: 30, happiness: 20, economy: -10 }
          }
      ]
    }
  ],
  "Intergalactic Empire": [
    {
      id: "space-1",
      title: "The Dyson Swarm",
      description: "Our engineers propose surrounding the home star with solar collectors to power our expansion to the outer rim. Environmentalists worry about the ecological impact on the home planet.",
      category: "Technology",
      options: [
        {
          id: "sp1a",
          text: "Harness the Star. We need infinite energy for the stars.",
          supporter: "Stellar Architect",
          effects: { technology: 50, economy: 40, environment: -20 }
        },
        {
          id: "sp1b",
          text: "Protect the Cradle. Earth must remain a sanctuary.",
          supporter: "Planetary Ecologist",
          effects: { environment: 30, happiness: 20, technology: -10 }
        }
      ]
    }
  ]
}

export function useGame() {
  const { data: session } = useSession()
  const [nation, setNation] = useState<Nation | null>(null)
  const [slots, setSlots] = useState<(Nation | null)[]>([null, null, null])
  const [activeSlot, setActiveSlot] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("activeSlot")
      return saved ? parseInt(saved) : null
    }
    return null
  })

  // Persist activeSlot to localStorage
  useEffect(() => {
    if (activeSlot !== null) {
      localStorage.setItem("activeSlot", activeSlot.toString())
    } else {
      localStorage.removeItem("activeSlot")
    }
  }, [activeSlot])
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [recentChanges, setRecentChanges] = useState<Partial<NationStats>>({})
  const [usedIssueIds, setUsedIssueIds] = useState<Set<string>>(new Set())
  const [history, setHistory] = useState<string[]>([])
  const [laws, setLaws] = useState<string[]>([])

  // Load from database or localStorage on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      if (session?.user) {
        try {
          const response = await fetch("/api/nation")
          if (response.ok) {
            const data = await response.json()
            if (Array.isArray(data)) {
              const loadedSlots: (Nation | null)[] = [null, null, null]
              data.forEach((n: any) => {
                const slotIdx = (n.slot || 1) - 1
                if (slotIdx >= 0 && slotIdx < 3) {
                  const gameMode = n.gameMode || "Eternal"
                  loadedSlots[slotIdx] = {
                    ...n,
                    gameMode,
                    era: n.era || (gameMode === "Chronological" ? "Stone Age" : "Information Age"),
                    historyLog: n.historyLog || [],
                    issuesResolved: n.issuesResolved || 0,
                  } as Nation
                }
              })
              setSlots(loadedSlots)
              
              // If we were already in a slot, keep it active
              if (activeSlot !== null && loadedSlots[activeSlot - 1]) {
                setNation(loadedSlots[activeSlot - 1])
              }
            }
          }
        } catch (error) {
          console.error("Failed to load from DB:", error)
        }
      } else {
        // Fallback to localStorage for all slots
        const loadedSlots: (Nation | null)[] = [null, null, null]
        for (let i = 1; i <= 3; i++) {
          const savedNation = localStorage.getItem(`nation_slot_${i}`)
          if (savedNation) {
            const parsed = JSON.parse(savedNation)
            const gameMode = parsed.gameMode || "Eternal"
            loadedSlots[i - 1] = {
              ...parsed,
              slot: i,
              gameMode,
              era: parsed.era || (gameMode === "Chronological" ? "Stone Age" : "Information Age"),
              historyLog: parsed.historyLog || [],
              issuesResolved: parsed.issuesResolved || 0,
            } as Nation
          }
        }
        
        // Backward compatibility for the old single-nation storage
        const legacyNation = localStorage.getItem("nation")
        if (legacyNation && !loadedSlots[0]) {
          const parsed = JSON.parse(legacyNation)
          const gameMode = parsed.gameMode || "Eternal"
          loadedSlots[0] = {
            ...parsed,
            slot: 1,
            gameMode,
            era: parsed.era || (gameMode === "Chronological" ? "Stone Age" : "Information Age"),
            historyLog: parsed.historyLog || [],
            issuesResolved: parsed.issuesResolved || 0,
          } as Nation
          localStorage.setItem("nation_slot_1", JSON.stringify(loadedSlots[0]))
          localStorage.removeItem("nation")
        }

        setSlots(loadedSlots)
        if (activeSlot !== null && loadedSlots[activeSlot - 1]) {
          setNation(loadedSlots[activeSlot - 1])
        }
      }
      setIsLoading(false)
    }

    loadData()
  }, [session])

  const selectSlot = useCallback((slot: number) => {
    setActiveSlot(slot)
    const nationInSlot = slots[slot - 1]
    setNation(nationInSlot)
    
    // Reset other state when switching slots
    setCurrentIssue(null)
    setHistory([])
    setUsedIssueIds(new Set())
    setRecentChanges({})
  }, [slots])

  const deleteSlot = useCallback(async (slot: number) => {
    setIsLoading(true)
    try {
      if (session?.user) {
        await fetch(`/api/nation?slot=${slot}`, { method: "DELETE" })
      }
      
      const newSlots = [...slots]
      newSlots[slot - 1] = null
      setSlots(newSlots)
      
      if (activeSlot === slot) {
        setNation(null)
        setActiveSlot(null)
      }
      
      localStorage.removeItem(`nation_slot_${slot}`)
      if (slot === 1) {
        localStorage.removeItem("nation")
        localStorage.removeItem("decisionHistory")
        localStorage.removeItem("usedIssueIds")
      }
    } catch (error) {
      console.error("Failed to delete slot:", error)
    } finally {
      setIsLoading(false)
    }
  }, [session, slots, activeSlot])

  // Save to database or localStorage on changes
  useEffect(() => {
    if (!nation || activeSlot === null) return

    const saveData = async () => {
      // Save to localStorage for guests or as backup
      localStorage.setItem(`nation_slot_${activeSlot}`, JSON.stringify(nation))
      if (activeSlot === 1) {
        // Legacy support for single slot 1
        localStorage.setItem("nation", JSON.stringify(nation))
      }

      // Save to database if logged in
      if (session?.user) {
        try {
          await fetch("/api/nation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              nation: {
                ...nation,
                slot: activeSlot,
                history,
                usedIssueIds: Array.from(usedIssueIds)
              } 
            }),
          })
        } catch (error) {
          console.error("Failed to save to DB:", error)
        }
      }
    }

    const timeoutId = setTimeout(saveData, 1000)
    return () => clearTimeout(timeoutId)
  }, [nation, history, usedIssueIds, session, activeSlot])

  const createNation = useCallback((newNation: Nation) => {
    setIsLoading(true)
    setTimeout(() => {
      const nationWithSlot = { ...newNation, slot: activeSlot || 1 }
      setNation(nationWithSlot)
      
      // Update slots array
      const newSlots = [...slots]
      newSlots[(activeSlot || 1) - 1] = nationWithSlot
      setSlots(newSlots)
      
      setHistory([])
      setUsedIssueIds(new Set())
      setIsLoading(false)
    }, 1000)
  }, [activeSlot, slots])

  const AI_WORKER_URL = "https://statecraft-ai.paper-archon.workers.dev"

  const generateIssue = useCallback(async () => {
    if (!nation) return
    
    setIsLoading(true)
    setRecentChanges({})
    
    // Handle branching future transition
    if (nation.era === "Information Age" && nation.stats.technology >= 100) {
      const branchingIssue: Issue = {
        id: "branching-future",
        title: "The Great Divergence",
        description: "Humanity has reached the zenith of the Information Age. Our destiny now lies at a crossroads: do we perfect our existence on Earth through cybernetic integration, or do we abandon our cradle and forge an empire among the stars?",
        category: "Technology",
        options: [
          {
            id: "path-cyberpunk",
            text: "Stay on Earth. We will integrate with the machine and create a digital paradise (or neon nightmare).",
            supporter: "Chief Technologist",
            effects: { technology: -100 } // This will be handled in selectOption to change era
          },
          {
            id: "path-space",
            text: "Go to Space. Earth is but a cradle; our future is in the infinite expanse of the galaxy.",
            supporter: "Grand Admiral",
            effects: { technology: -100 } // This will be handled in selectOption to change era
          }
        ]
      }
      setCurrentIssue(branchingIssue)
      setIsLoading(false)
      return
    }
    
    console.log("Generating issue for:", nation.name)
    console.log("Current History:", history)
    
    try {
      // 1. Prepare request body with strict history and forbidden titles
      const requestBody = {
        nationName: nation.name,
        governmentType: nation.governmentType,
        era: nation.era,
        motto: nation.motto,
        leader: nation.leader,
        stats: nation.stats,
        history: history.slice(-20), // Send more history for context
        historyLog: nation.historyLog || [], // Procedural Lore: Historical major choices
        forbidden: Array.from(usedIssueIds), // Explicitly list all seen titles/ids
        timestamp: Date.now()
      }

      console.log("Requesting AI Dilemma with forbidden list:", requestBody.forbidden)

      const response = await fetch(AI_WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })
      
      console.log("AI Worker Response Status:", response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`AI Worker Error (${response.status}): ${errorText}`)
      }
      
      const dilemmaJson = await response.json() as any
      console.log("AI Dilemma Received:", dilemmaJson)

      if (dilemmaJson.error) {
        throw new Error(`AI Worker Logic Error: ${dilemmaJson.error}`)
      }

      // Check if this issue title has already been used
      if (usedIssueIds.has(dilemmaJson.title)) {
        console.warn(`AI generated a duplicate issue: "${dilemmaJson.title}". Forcing fallback.`)
        throw new Error("Duplicate issue generated")
      }
      
      const aiIssue: Issue = {
        id: `ai-${Date.now()}`,
        title: dilemmaJson.title,
        description: dilemmaJson.description,
        category: dilemmaJson.category || "General",
        options: dilemmaJson.options.map((option: any, index: number) => ({
          id: `ai-${Date.now()}-${index}`,
          text: option.text,
          supporter: "Lead Advisor",
          effects: {
            economy: option.impact.economy || 0,
            civilRights: option.impact.civilRights || 0,
            politicalFreedom: option.impact.politicalFreedom || 0,
            environment: option.impact.environment || 0,
            happiness: option.impact.happiness || 0,
            education: option.impact.education || 0,
            healthcare: option.impact.healthcare || 0,
            crime: option.impact.crime || 0,
          }
        }))
      }
      
      setUsedIssueIds(prev => new Set(prev).add(aiIssue.title)) // Track titles for AI issues
      setCurrentIssue(aiIssue)
    } catch (error) {
      console.error("Failed to generate AI dilemma:", error)
      const eraIssues = sampleIssues[nation.era] || sampleIssues["Information Age"]
      const availableFallbacks = eraIssues.filter(issue => !usedIssueIds.has(issue.title))
      const fallbackList = availableFallbacks.length > 0 ? availableFallbacks : eraIssues
      const randomIndex = Math.floor(Math.random() * fallbackList.length)
      const selectedFallback = fallbackList[randomIndex]
      
      setUsedIssueIds(prev => new Set(prev).add(selectedFallback.title))
      setCurrentIssue({
        ...selectedFallback,
        id: `${selectedFallback.id}-${Date.now()}` // Unique ID for this instance
      })
    } finally {
      setIsLoading(false)
    }
  }, [nation, history])

  // ERA TRANSITION LOGIC
  const checkEraTransition = useCallback((newStats: NationStats) => {
    if (!nation) return { nextEra: ERAS[0], updatedStats: newStats };

    const currentEraIndex = ERAS.indexOf(nation.era);
    
    // Check for branching future at Information Age
    if (nation.era === "Information Age" && newStats.technology >= 100) {
      // We don't transition automatically; the next issue will be the branching choice
      return { nextEra: nation.era, updatedStats: newStats };
    }

    if (newStats.technology >= 100 && currentEraIndex < ERAS.indexOf("Information Age")) {
      const nextEra = ERAS[currentEraIndex + 1];
      return {
        nextEra,
        updatedStats: {
          ...newStats,
          technology: 0 // Reset technology for the next era
        }
      };
    }
    return { nextEra: nation.era, updatedStats: newStats };
  }, [nation]);

  const selectOption = useCallback((option: IssueOption) => {
    if (!nation) return
    
    setIsLoading(true)
    
    setTimeout(() => {
      const newStats = { ...nation.stats }
      const changes: Partial<NationStats> = {}
      
      for (const [stat, change] of Object.entries(option.effects)) {
        const key = stat as keyof NationStats
        if (key in newStats) {
          const newValue = Math.max(0, Math.min(1000, newStats[key] + (change as number)))
          changes[key] = change as number
          newStats[key] = newValue
        }
      }

      const { nextEra, updatedStats } = checkEraTransition(newStats)
      
      let finalEra = nextEra
      
      // Handle branching choices
      if (option.id === "path-cyberpunk") {
        finalEra = "Cyberpunk Era"
      } else if (option.id === "path-space") {
        finalEra = "Intergalactic Empire"
      }

      const historyEntry = currentIssue 
        ? `${currentIssue.title}: ${option.text}`
        : `Policy Decision: ${option.text}`

      const currentEra = nation.era || "Information Age"

      const summary = currentIssue 
        ? `In the ${currentEra}, when faced with "${currentIssue.title}", we chose to: ${option.text}.`
        : `Decided to: ${option.text}.`
      
      const updatedNation: Nation = {
        ...nation,
        stats: updatedStats,
        era: finalEra,
        issuesResolved: nation.issuesResolved + 1,
        historyLog: [...(nation.historyLog || []), summary].slice(-10), // Keep last 10 major decisions
      }

      // Add to laws if in Eternal mode
      if (nation.gameMode === 'Eternal') {
        setLaws(prev => [option.text, ...prev].slice(0, 50))
      }

      setNation(updatedNation)
      setHistory(prev => [...prev, historyEntry])
      setRecentChanges(changes)
      setCurrentIssue(null)
      setIsLoading(false)
    }, 800)
  }, [nation, currentIssue, checkEraTransition])

  const resetGame = useCallback(async () => {
    setIsLoading(true)
    try {
      setNation(null)
      setHistory([])
      setUsedIssueIds(new Set())
      localStorage.removeItem("nation")
      localStorage.removeItem("decisionHistory")
      localStorage.removeItem("usedIssueIds")
      
      if (session?.user) {
        await fetch("/api/nation", { method: "DELETE" })
      }
    } catch (error) {
      console.error("Failed to reset game:", error)
    } finally {
      setIsLoading(false)
    }
  }, [session])

  return {
    nation,
    currentIssue,
    isLoading,
    recentChanges,
    history,
    createNation,
    generateIssue,
    selectOption,
    resetGame,
    slots,
    activeSlot,
    selectSlot,
    deleteSlot,
  }
}
