"use client"

import { useState, useCallback, useEffect } from "react"
import { useSession } from "next-auth/react"
import type {
  Nation,
  Issue,
  IssueOption,
  NationStats,
  GameEra,
  InstitutionKey,
  FactionKey,
  PolicyCard,
} from "@/lib/game-types"

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

const BOUNDED_STATS: (keyof NationStats)[] = [
  "economy",
  "civilRights",
  "politicalFreedom",
  "environment",
  "happiness",
  "crime",
  "education",
  "healthcare",
  "technology",
]

const DEFAULT_INSTITUTIONS: Record<InstitutionKey, number> = {
  governance: 50,
  economy: 50,
  welfare: 50,
  security: 50,
  knowledge: 50,
}

const DEFAULT_FACTIONS: Record<FactionKey, number> = {
  citizens: 50,
  elites: 50,
  innovators: 50,
  traditionalists: 50,
  securityCouncil: 50,
}



function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value))
}

function applyStatDelta(stat: keyof NationStats, current: number, delta: number): number {
  if (BOUNDED_STATS.includes(stat)) {
    return clamp(current + delta)
  }

  if (stat === "population") {
    return Math.max(1000, Math.round(current * (1 + delta / 100)))
  }

  if (stat === "gdp") {
    return Math.max(500, Math.round(current * (1 + delta / 100)))
  }

  return current
}

function normalizeInstitutions(data?: Partial<Record<InstitutionKey, number>>): Record<InstitutionKey, number> {
  return {
    governance: clamp(data?.governance ?? DEFAULT_INSTITUTIONS.governance),
    economy: clamp(data?.economy ?? DEFAULT_INSTITUTIONS.economy),
    welfare: clamp(data?.welfare ?? DEFAULT_INSTITUTIONS.welfare),
    security: clamp(data?.security ?? DEFAULT_INSTITUTIONS.security),
    knowledge: clamp(data?.knowledge ?? DEFAULT_INSTITUTIONS.knowledge),
  }
}

function normalizeFactions(data?: Partial<Record<FactionKey, number>>): Record<FactionKey, number> {
  return {
    citizens: clamp(data?.citizens ?? DEFAULT_FACTIONS.citizens),
    elites: clamp(data?.elites ?? DEFAULT_FACTIONS.elites),
    innovators: clamp(data?.innovators ?? DEFAULT_FACTIONS.innovators),
    traditionalists: clamp(data?.traditionalists ?? DEFAULT_FACTIONS.traditionalists),
    securityCouncil: clamp(data?.securityCouncil ?? DEFAULT_FACTIONS.securityCouncil),
  }
}





function deriveInstitutionChanges(effects: Partial<NationStats>): Partial<Record<InstitutionKey, number>> {
  const changes: Partial<Record<InstitutionKey, number>> = {}
  const pf = effects.politicalFreedom ?? 0
  const eco = effects.economy ?? 0
  const welfare = (effects.healthcare ?? 0) + (effects.happiness ?? 0)
  const sec = (effects.crime ?? 0) * -1
  const know = (effects.education ?? 0) + (effects.technology ?? 0)

  if (pf !== 0) changes.governance = Math.round(pf * 0.5)
  if (eco !== 0) changes.economy = Math.round(eco * 0.5)
  if (welfare !== 0) changes.welfare = Math.round(welfare * 0.35)
  if (sec !== 0) changes.security = Math.round(sec * 0.4)
  if (know !== 0) changes.knowledge = Math.round(know * 0.45)

  return changes
}

function deriveFactionChanges(
  effects: Partial<NationStats>,
  governmentType: string
): Partial<Record<FactionKey, number>> {
  const changes: Partial<Record<FactionKey, number>> = {}

  const happiness = effects.happiness ?? 0
  const economy = effects.economy ?? 0
  const freedom = effects.politicalFreedom ?? 0
  const tech = effects.technology ?? 0
  const crime = effects.crime ?? 0

  changes.citizens = Math.round((happiness + freedom) * 0.4)
  changes.elites = Math.round((economy - freedom) * 0.35)
  changes.innovators = Math.round((tech + (effects.education ?? 0)) * 0.4)
  changes.traditionalists = Math.round((freedom * -0.3) + ((effects.environment ?? 0) * 0.2))
  changes.securityCouncil = Math.round((crime * -0.45) + (freedom * -0.2))

  if (governmentType.includes("Authoritarian") || governmentType.includes("Theocracy")) {
    changes.securityCouncil = (changes.securityCouncil ?? 0) + 3
    changes.citizens = (changes.citizens ?? 0) - 2
  }

  return changes
}

function applyInstitutionChanges(
  current: Record<InstitutionKey, number>,
  delta: Partial<Record<InstitutionKey, number>>
): Record<InstitutionKey, number> {
  return {
    governance: clamp(current.governance + (delta.governance ?? 0)),
    economy: clamp(current.economy + (delta.economy ?? 0)),
    welfare: clamp(current.welfare + (delta.welfare ?? 0)),
    security: clamp(current.security + (delta.security ?? 0)),
    knowledge: clamp(current.knowledge + (delta.knowledge ?? 0)),
  }
}

function applyFactionChanges(
  current: Record<FactionKey, number>,
  delta: Partial<Record<FactionKey, number>>
): Record<FactionKey, number> {
  return {
    citizens: clamp(current.citizens + (delta.citizens ?? 0)),
    elites: clamp(current.elites + (delta.elites ?? 0)),
    innovators: clamp(current.innovators + (delta.innovators ?? 0)),
    traditionalists: clamp(current.traditionalists + (delta.traditionalists ?? 0)),
    securityCouncil: clamp(current.securityCouncil + (delta.securityCouncil ?? 0)),
  }
}















function applyEraFlavorToIssue(issue: Issue, era: GameEra): Issue {
  const preIndustrial = ["Stone Age", "Bronze Age", "Iron Age", "Classical Era", "Medieval Era", "Renaissance"].includes(era)
  if (!preIndustrial) return issue

  const labelByEra: Partial<Record<GameEra, string>> = {
    "Stone Age": "Tribal",
    "Bronze Age": "Temple",
    "Iron Age": "Kingdom",
    "Classical Era": "Civic",
    "Medieval Era": "Feudal",
    "Renaissance": "Guild",
  }
  const prefix = labelByEra[era] || "Ancient"

  const rewrite = (text: string): string => {
    return text
      .replace(/regional/gi, "territorial")
      .replace(/public/gi, "communal")
      .replace(/national/gi, "realm-wide")
      .replace(/cyber/gi, "signal")
      .replace(/systems/gi, "structures")
      .replace(/industry/gi, "craft")
      .replace(/technology/gi, "craft knowledge")
      .replace(/infrastructure/gi, "roads and granaries")
      .replace(/consortium/gi, "guild")
      .replace(/oversight/gi, "council review")
      .replace(/metrics/gi, "records")
  }

  return {
    ...issue,
    title: `${prefix} ${rewrite(issue.title)}`,
    description: rewrite(issue.description),
    options: issue.options.map((opt) => ({
      ...opt,
      text: rewrite(opt.text),
      supporter: rewrite(opt.supporter),
    })),
  }
}

function hasAnachronisticLanguage(issue: Issue, era: GameEra): boolean {
  if (!["Stone Age", "Bronze Age", "Iron Age", "Classical Era", "Medieval Era"].includes(era)) return false
  const text = `${issue.title} ${issue.description} ${issue.options.map((o) => `${o.text} ${o.supporter}`).join(" ")}`.toLowerCase()
  const banned = [
    "ai", "robot", "cyber", "algorithm", "nuclear", "satellite", "internet", "digital", "genetic", "deepfake", "automation"
  ]
  return banned.some((term) => text.includes(term))
}

function ensureEraAdvancementOption(issue: Issue, nation: Nation): Issue {
  if (nation.gameMode !== "Eras") return issue
  if (ERAS.indexOf(nation.era) >= ERAS.indexOf("Information Age")) return issue

  const hasTechPath = issue.options.some((opt) => (opt.effects.technology ?? 0) >= 8)
  if (hasTechPath) return issue

  const bonusTech = nation.stats.technology >= 70 ? 10 : 14
  const researchOption: IssueOption = {
    id: `${issue.id}-advancement`,
    text: "Invest in knowledge transmission and toolmaking to accelerate advancement.",
    supporter: "Scholars and Master Artisans",
    effects: {
      technology: bonusTech,
      economy: -4,
      happiness: -1,
    },
  }

  return {
    ...issue,
    options: normalizeIssueOptions(
      [...issue.options, researchOption],
      Math.max(3, issue.options.length),
      issue.title,
      issue.category,
      nation.era
    ),
  }
}

function createEraAdvancementProject(nation: Nation): Issue | null {
  if (nation.gameMode !== "Eras") return null
  if (ERAS.indexOf(nation.era) >= ERAS.indexOf("Information Age")) return null
  if (nation.stats.technology >= 100) return null
  if (nation.issuesResolved > 0 && nation.issuesResolved % 4 !== 0) return null

  const projectByEra: Partial<Record<GameEra, { title: string; description: string; options: Array<Omit<IssueOption, "id">> }>> = {
    "Stone Age": {
      title: "The Memory Fires",
      description: "Elders propose formal nights of storytelling and tool instruction so survival knowledge is not lost between generations.",
      options: [
        { text: "Create apprentice circles around each hearth.", supporter: "Elder Circle", effects: { technology: 18, happiness: 3, economy: -4 } },
        { text: "Focus only on hunting drills for immediate survival.", supporter: "War Chief", effects: { technology: 10, economy: 4, happiness: -2 } },
        { text: "Spread instruction slowly through wandering teachers.", supporter: "Story Keepers", effects: { technology: 14, education: 6, economy: -2 } },
      ],
    },
    "Bronze Age": {
      title: "Foundry Standardization",
      description: "Bronze-smiths ask for standard molds, measurements, and shared techniques to raise output and quality.",
      options: [
        { text: "Fund realm-wide foundry standards.", supporter: "Master Smiths", effects: { technology: 16, economy: 6, happiness: -3 } },
        { text: "Keep guild secrets local for elite leverage.", supporter: "Temple Council", effects: { technology: 8, economy: 7, politicalFreedom: -4 } },
        { text: "Open craft schools in every market town.", supporter: "Merchants League", effects: { technology: 14, education: 7, economy: -3 } },
      ],
    },
  }

  const project = projectByEra[nation.era] || {
    title: "Institutional Knowledge Drive",
    description: "The administration can formalize its learning systems to push civilization toward the next age.",
    options: [
      { text: "Centralize advanced research under state patronage.", supporter: "Royal Academy", effects: { technology: 16, economy: -4, politicalFreedom: -2 } },
      { text: "Decentralize experimentation to provinces and guilds.", supporter: "Regional Governors", effects: { technology: 12, politicalFreedom: 4, economy: -2 } },
      { text: "Balance state labs with civic schools.", supporter: "Grand Chancellor", effects: { technology: 14, education: 8, economy: -3 } },
    ],
  }

  return {
    id: `adv-${nation.era.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
    title: project.title,
    description: project.description,
    category: "Technology",
    metadata: { source: "policy" },
    options: project.options.map((opt, idx) => ({ ...opt, id: `adv-opt-${idx}` })),
  }
}



function normalizeIssueOptions(
  options: IssueOption[],
  desiredCount: number,
  issueTitle: string,
  category: string,
  era?: GameEra
): IssueOption[] {
  const trimmed = options.slice(0, 5)
  const templates: Array<Omit<IssueOption, "id">> =
    era === "Stone Age"
      ? [
          {
            text: "Lead a bold hunt and claim meat, hides, and status.",
            supporter: "Hunt Chief",
            effects: { economy: 4, happiness: 2, population: -1 },
          },
          {
            text: "Expand foraging routes and preserve stores for lean moons.",
            supporter: "Gatherer Circle",
            effects: { economy: 2, healthcare: 2, happiness: 1 },
          },
          {
            text: "Train apprentices in knapping, firekeeping, and shelter craft.",
            supporter: "Elder Keepers",
            effects: { education: 3, technology: 4, economy: -2 },
          },
          {
            text: "Move part of the tribe to safer camps until danger fades.",
            supporter: "Trail Scouts",
            effects: { crime: -2, population: 1, happiness: -1 },
          },
          {
            text: "Offer tribute and rites to keep rival clans from raiding.",
            supporter: "Shaman Circle",
            effects: { crime: -2, politicalFreedom: -1, happiness: 1 },
          },
        ]
      : era === "Bronze Age"
        ? [
            {
              text: "Standardize bronze tools and share molds across workshops.",
              supporter: "Master Smiths",
              effects: { technology: 4, economy: 3, happiness: -1 },
            },
            {
              text: "Raise granary reserves and ration by tablet record.",
              supporter: "Temple Stewards",
              effects: { economy: 2, healthcare: 2, politicalFreedom: -1 },
            },
            {
              text: "Call a levy from each district and secure trade roads.",
              supporter: "War Captains",
              effects: { crime: -3, economy: 1, happiness: -1 },
            },
            {
              text: "Broker a pact among city notables before acting.",
              supporter: "Court Scribes",
              effects: { politicalFreedom: 2, crime: -1, economy: -1 },
            },
            {
              text: "Fund apprenticeships for metalwork, farming, and records.",
              supporter: "Guild Elders",
              effects: { education: 3, technology: 3, economy: -2 },
            },
          ]
        : era === "Iron Age"
          ? [
              {
                text: "Forge iron tools at scale and push frontier production.",
                supporter: "Forge Masters",
                effects: { economy: 4, technology: 3, environment: -2 },
              },
              {
                text: "Fortify border settlements and rotate militia duty.",
                supporter: "Marshal Council",
                effects: { crime: -3, happiness: -1, economy: -1 },
              },
              {
                text: "Convene clan leaders to settle disputes and share burdens.",
                supporter: "Hall of Chiefs",
                effects: { politicalFreedom: 2, crime: -1, economy: -1 },
              },
              {
                text: "Expand irrigation and maintain roads linking market towns.",
                supporter: "Road Wardens",
                effects: { economy: 3, healthcare: 1, education: 1 },
              },
              {
                text: "Delay reform and gather reports from provincial stewards.",
                supporter: "Royal Surveyors",
                effects: { economy: 1, happiness: -1, education: 2 },
              },
            ]
          : [
              {
                text: "Launch a phased pilot and reassess after one quarter.",
                supporter: "Policy Lab Director",
                effects: { economy: -2, education: 3, happiness: 2 },
              },
              {
                text: "Negotiate a compromise package with opposition blocs.",
                supporter: "Parliamentary Whip",
                effects: { politicalFreedom: 3, economy: -1, crime: -2 },
              },
              {
                text: "Delegate implementation to local governments with federal oversight.",
                supporter: "Regional Affairs Minister",
                effects: { politicalFreedom: 2, economy: 2, healthcare: 1 },
              },
              {
                text: "Create an emergency stabilization fund and temporary controls.",
                supporter: "Treasury Board",
                effects: { economy: 3, happiness: -3, crime: -2 },
              },
              {
                text: "Delay major action and intensify intelligence gathering first.",
                supporter: "Strategic Assessment Council",
                effects: { economy: 1, happiness: -2, education: 1 },
              },
            ]

  const existingTexts = new Set(trimmed.map((o) => o.text.toLowerCase()))
  let idx = 0
  while (trimmed.length < Math.min(5, desiredCount) && idx < templates.length) {
    const candidate = templates[idx++]
    if (existingTexts.has(candidate.text.toLowerCase())) continue
    trimmed.push({
      ...candidate,
      id: `supp-${issueTitle.slice(0, 12).replace(/\s+/g, "-").toLowerCase()}-${trimmed.length}`,
      supporter: `${candidate.supporter} (${category})`,
    })
  }

  return trimmed
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
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false)
  const [mapCrises, setMapCrises] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [recentChanges, setRecentChanges] = useState<Partial<NationStats>>({})
  const [usedIssueIds, setUsedIssueIds] = useState<Set<string>>(new Set())
  const [history, setHistory] = useState<string[]>([])
  const [consequenceTimer, setConsequenceTimer] = useState<number>(0)
  const AI_WORKER_URL = process.env.NEXT_PUBLIC_AI_WORKER_URL || "https://statecraft-ai.paper-archon.workers.dev"

  // Consequence Engine: Check every 60 seconds
  useEffect(() => {
    if (!nation) return

    const interval = setInterval(() => {
      setConsequenceTimer(prev => prev + 1)
    }, 60000)

    return () => clearInterval(interval)
  }, [nation?.id])

  useEffect(() => {
    if (consequenceTimer > 0 && consequenceTimer % 2 === 0) { // Every 2 minutes
      processConsequences()
    }
  }, [consequenceTimer])



  const processConsequences = useCallback(() => {
    if (!nation || !nation.pendingConsequences || nation.pendingConsequences.length === 0) return

    // Pick a random pending consequence
    const idx = Math.floor(Math.random() * nation.pendingConsequences.length)
    const pc = nation.pendingConsequences[idx]

    // Roll the dice
    if (Math.random() < pc.consequence.chance) {
      // Trigger!
      const { statEffects, text } = pc.consequence
      
      const updatedStats = { ...nation.stats }
      Object.entries(statEffects).forEach(([key, value]) => {
        const k = key as keyof NationStats
        if (typeof value === 'number') {
          updatedStats[k] = applyStatDelta(k, updatedStats[k], value)
        }
      })

      const logEntry = `[CONSEQUENCE] ${text} (Result of: ${pc.issueTitle})`
      
      const updatedNation = {
        ...nation,
        stats: updatedStats,
        historyLog: [...(nation.historyLog || []), logEntry],
        // Remove the consequence once triggered
        pendingConsequences: nation.pendingConsequences.filter((_, i) => i !== idx)
      }

      setNation(updatedNation)
      
      // Save to storage
      if (activeSlot) {
        localStorage.setItem(`nation_slot_${activeSlot}`, JSON.stringify(updatedNation))
      }
    }
  }, [nation, activeSlot])

  const handleMapCrisis = useCallback((crisis: any) => {
    if (!nation) return

    const fallbackIssue: Issue = {
      id: `map-${crisis?.id || Date.now()}`,
      title: `${crisis?.label || "Regional Crisis"}`,
      description: crisis?.reason || "A regional crisis demands immediate leadership action.",
      category: "Security",
      options: [
        {
          id: `map-opt-a-${Date.now()}`,
          text: "Deploy emergency response teams and stabilize key routes.",
          supporter: "Security Council",
          effects: { crime: -8, economy: -3, happiness: -1 },
        },
        {
          id: `map-opt-b-${Date.now()}`,
          text: "Open negotiations with local leaders and fund rapid relief.",
          supporter: "Civic Delegation",
          effects: { happiness: 4, economy: -5, politicalFreedom: 2 },
        },
        {
          id: `map-opt-c-${Date.now()}`,
          text: "Hold reserves and gather intelligence before committing fully.",
          supporter: "Strategic Office",
          effects: { economy: 1, crime: 2, education: 1 },
        },
      ],
    }

    setCurrentIssue(ensureEraAdvancementOption(applyEraFlavorToIssue(fallbackIssue, nation.era), nation))
    setIsCrisisModalOpen(true)
  }, [nation])



  // Load from database or localStorage on mount
  useEffect(() => {
    function sanitizeStats(stats: any): NationStats {
      return {
        economy: stats?.economy ?? 50,
        civilRights: stats?.civilRights ?? 50,
        politicalFreedom: stats?.politicalFreedom ?? 50,
        population: stats?.population ?? 5000000,
        environment: stats?.environment ?? 50,
        gdp: stats?.gdp ?? 25000,
        happiness: stats?.happiness ?? 50,
        crime: stats?.crime ?? 50,
        education: stats?.education ?? 50,
        healthcare: stats?.healthcare ?? 50,
        technology: stats?.technology ?? 0,
      }
    }

    function sanitizeNationSystems(n: any) {
      return {
        decisionHistory: n.decisionHistory || n.history || [],
        historyLog: n.historyLog || [],
        usedIssueTitles: n.usedIssueTitles || [],
        pendingConsequences: n.pendingConsequences || [],
        institutions: normalizeInstitutions(n.institutions),
        factions: normalizeFactions(n.factions),
        activePolicies: n.activePolicies || [],
      }
    }

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
                  const loadedNation = {
                    ...n,
                    gameMode,
                    era: n.era || (gameMode === "Eras" ? "Stone Age" : "Information Age"),
                    stats: sanitizeStats(n.stats),
                    ...sanitizeNationSystems(n),
                    issuesResolved: n.issuesResolved || 0,
                  } as Nation
                  if (!loadedNation.crisisArcs || loadedNation.crisisArcs.length === 0) {
                    loadedNation.crisisArcs = mergeAndAdvanceCrisisArcs(loadedNation)
                  }
                  loadedSlots[slotIdx] = loadedNation
                }
              })
              setSlots(loadedSlots)
              
              // If we were already in a slot, keep it active
              if (activeSlot !== null && loadedSlots[activeSlot - 1]) {
                const activeNation = loadedSlots[activeSlot - 1]
                setNation(activeNation)
                if (activeNation?.usedIssueTitles) {
                  setUsedIssueIds(new Set(activeNation.usedIssueTitles))
                }
                if (activeNation?.decisionHistory) {
                  setHistory(activeNation.decisionHistory)
                }
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
            const loadedNation = {
              ...parsed,
              slot: i,
              gameMode,
              era: parsed.era || (gameMode === "Eras" ? "Stone Age" : "Information Age"),
              stats: sanitizeStats(parsed.stats),
              ...sanitizeNationSystems(parsed),
              issuesResolved: parsed.issuesResolved || 0,
            } as Nation
            if (!loadedNation.crisisArcs || loadedNation.crisisArcs.length === 0) {
              loadedNation.crisisArcs = mergeAndAdvanceCrisisArcs(loadedNation)
            }
            loadedSlots[i - 1] = loadedNation
          }
        }
        
        // Backward compatibility for the old single-nation storage
        const legacyNation = localStorage.getItem("nation")
        if (legacyNation && !loadedSlots[0]) {
          const parsed = JSON.parse(legacyNation)
          const gameMode = parsed.gameMode || "Eternal"
          const loadedNation = {
            ...parsed,
            slot: 1,
            gameMode,
            era: parsed.era || (gameMode === "Eras" ? "Stone Age" : "Information Age"),
            stats: sanitizeStats(parsed.stats),
            ...sanitizeNationSystems(parsed),
            issuesResolved: parsed.issuesResolved || 0,
          } as Nation
          if (!loadedNation.crisisArcs || loadedNation.crisisArcs.length === 0) {
            loadedNation.crisisArcs = mergeAndAdvanceCrisisArcs(loadedNation)
          }
          loadedSlots[0] = loadedNation
          localStorage.setItem("nation_slot_1", JSON.stringify(loadedNation))
          localStorage.removeItem("nation")
        }

        setSlots(loadedSlots)
        if (activeSlot !== null && loadedSlots[activeSlot - 1]) {
          const activeNation = loadedSlots[activeSlot - 1]
          setNation(activeNation)
          setUsedIssueIds(new Set(activeNation?.usedIssueTitles || []))
          setHistory(activeNation?.decisionHistory || [])
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
    setHistory(nationInSlot?.decisionHistory || [])
    setUsedIssueIds(new Set(nationInSlot?.usedIssueTitles || []))
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
      const nationToSave = {
        ...nation,
        decisionHistory: history,
        usedIssueTitles: Array.from(usedIssueIds),
        regions: normalizeRegions(nation.regions),
        crisisArcs: nation.crisisArcs || []
      }

      // Save to localStorage for guests or as backup
      localStorage.setItem(`nation_slot_${activeSlot}`, JSON.stringify(nationToSave))
      if (activeSlot === 1) {
        // Legacy support for single slot 1
        localStorage.setItem("nation", JSON.stringify(nationToSave))
      }

      // Save to database if logged in
      if (session?.user) {
        try {
          await fetch("/api/nation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              nation: {
                ...nationToSave,
                slot: activeSlot,
                borders: nation.borders || [],
                pendingConsequences: nation.pendingConsequences || [],
                institutions: nation.institutions || DEFAULT_INSTITUTIONS,
                factions: nation.factions || DEFAULT_FACTIONS,
                activePolicies: nation.activePolicies || [],
                regions: nation.regions || DEFAULT_REGIONS,
                crisisArcs: nation.crisisArcs || []
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
      const nationWithSlot = { 
        ...newNation, 
        slot: activeSlot || 1,
        borders: ERA_MAP_DATA[newNation.era].baseBorders,
        decisionHistory: [],
        institutions: normalizeInstitutions(newNation.institutions),
        factions: normalizeFactions(newNation.factions),
        activePolicies: newNation.activePolicies || [],
        pendingConsequences: newNation.pendingConsequences || [],
        regions: normalizeRegions(newNation.regions),
        crisisArcs: [] as MapCrisis[]
      }
      nationWithSlot.regions = evolveRegionGeometry(nationWithSlot, nationWithSlot.regions || [])
      nationWithSlot.crisisArcs = mergeAndAdvanceCrisisArcs(nationWithSlot)
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

  const generateIssue = useCallback(async () => {
    if (!nation) return
    
    setIsLoading(true)
    setRecentChanges({})
    const complexity = getIssueComplexity(nation, mapCrises)
    const desiredOptionCount = getDesiredOptionCount(complexity)

    // Use the most up-to-date forbidden list from both state and nation object
    const forbiddenSet = new Set([
      ...Array.from(usedIssueIds),
      ...(nation.usedIssueTitles || [])
    ])
    
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
            effects: { technology: -100 }
          },
          {
            id: "path-space",
            text: "Go to Space. Earth is but a cradle; our future is in the infinite expanse of the galaxy.",
            supporter: "Grand Admiral",
            effects: { technology: -100 }
          }
        ]
      }
      setCurrentIssue(branchingIssue)
      setIsLoading(false)
      return
    }

    const priorityCrises = buildMapCrises(nation)
      .filter((c) => c.severity === "high")
      .filter((c) => !forbiddenSet.has(`System Stress: ${c.label}`))

    if (priorityCrises.length > 0) {
      const selected = priorityCrises[0]
      const forcedIssue = createIssueFromCrisis(selected, nation)
      forcedIssue.title = `System Stress: ${forcedIssue.title}`
      const flavoredForced = ensureEraAdvancementOption(applyEraFlavorToIssue(forcedIssue, nation.era), nation)
      setUsedIssueIds((prev) => new Set([...Array.from(prev), flavoredForced.title]))
      setCurrentIssue(flavoredForced)
      setIsLoading(false)
      return
    }

    const regionalProject = createRegionalSpecializationIssue(nation)
    if (regionalProject && !forbiddenSet.has(regionalProject.title)) {
      const projectIssue = ensureEraAdvancementOption(applyEraFlavorToIssue(regionalProject, nation.era), nation)
      setUsedIssueIds((prev) => new Set([...Array.from(prev), projectIssue.title]))
      setCurrentIssue(projectIssue)
      setIsLoading(false)
      return
    }

    const advancementProject = createEraAdvancementProject(nation)
    if (advancementProject && !forbiddenSet.has(advancementProject.title)) {
      const projectIssue = ensureEraAdvancementOption(applyEraFlavorToIssue(advancementProject, nation.era), nation)
      setUsedIssueIds((prev) => new Set([...Array.from(prev), projectIssue.title]))
      setCurrentIssue(projectIssue)
      setIsLoading(false)
      return
    }
    
    const forbiddenArray = Array.from(forbiddenSet)
    console.log("Generating issue for:", nation.name, "Era:", nation.era)
    console.log("Forbidden titles:", forbiddenArray)
    console.log("AI Worker URL:", AI_WORKER_URL)

    try {
      console.log("Fetching from AI Worker...")
      // Add a timeout to the fetch call
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      const payload = {
        era: nation.era,
        stats: nation.stats,
        history: history.slice(-5),
        historyLog: nation.historyLog || [], // Explicitly send historyLog for old worker
        institutions: nation.institutions || DEFAULT_INSTITUTIONS,
        factions: nation.factions || DEFAULT_FACTIONS,
        activePolicies: (nation.activePolicies || []).slice(-8),
        complexity,
        desiredOptionCount,
        forbidden: forbiddenArray,
        nationName: nation.name,
        motto: nation.motto,
        leader: nation.leader,
        governmentType: nation.governmentType,
        timestamp: Date.now(), // Explicitly send timestamp
        // Still send nested for worker flexibility
        nation: {
          name: nation.name,
          motto: nation.motto,
          leader: nation.leader,
          governmentType: nation.governmentType
        }
      }

      console.log("Sending payload to AI Worker:", payload)

      const response = await fetch(`${AI_WORKER_URL}?cb=${Date.now()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      console.log("AI Worker response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("AI Worker Error Details:", errorText)
        throw new Error(`AI Worker failed (${response.status} ${response.statusText}): ${errorText}`)
      }

      const rawIssue = await response.json() as any
      console.log("Parsed Raw AI Issue:", rawIssue)

      // Extract options with multiple fallback keys
      const rawOptions = rawIssue.options || rawIssue.choices || rawIssue.actions || []
      
      if (!Array.isArray(rawOptions) || rawOptions.length < 3) {
        console.error("AI returned no options, triggering fallback.")
        throw new Error("AI issue missing options")
      }

      // Map raw response to the expected Issue type
      let aiIssue: Issue = {
        id: `ai-${Date.now()}`,
        title: rawIssue.title || "National Decree",
        description: rawIssue.description || "The state must decide.",
        category: rawIssue.category || "General",
        options: normalizeIssueOptions(
          rawOptions.map((opt: any, idx: number) => ({
          id: `ai-opt-${Date.now()}-${idx}`,
          text: opt.text || opt.label || opt.choice || "Acknowledge",
          supporter: opt.supporter || "The Bureaucracy",
          // Handle both 'effects' and 'impact' keys from the AI
          effects: opt.effects || opt.impact || opt.results || {}
          })),
          desiredOptionCount,
          rawIssue.title || "National Decree",
          rawIssue.category || "General",
          nation.era
        )
      }

      aiIssue = ensureEraAdvancementOption(applyEraFlavorToIssue(aiIssue, nation.era), nation)
      if (hasAnachronisticLanguage(aiIssue, nation.era)) {
        throw new Error("Anachronistic AI issue for era")
      }
       
       // Double check against forbidden set
       if (forbiddenSet.has(aiIssue.title)) {
         console.warn("AI ignored forbidden list for title:", aiIssue.title)
         throw new Error("Duplicate title from AI")
       }
 
       console.log("Successfully generated AI issue:", aiIssue.title)
       setUsedIssueIds(prev => new Set([...Array.from(prev), aiIssue.title]))
       setCurrentIssue(aiIssue)
    } catch (error: any) {
      console.error("CRITICAL: AI Generation failed!", error)
      if (error.name === 'AbortError') {
        console.error("AI Worker call timed out after 15s")
      }
      
      // FALLBACK LOGIC
      const eraIssues = sampleIssues[nation.era as keyof typeof sampleIssues] || sampleIssues["Information Age"]
      
      // Filter out issues that have already been seen
      const availableFallbacks = eraIssues.filter(issue => !forbiddenSet.has(issue.title))
      
      console.log(`Fallback Strategy: ${availableFallbacks.length} unused issues found in ${nation.era} pool`)
      
      // If we've used everything in this era, we might have to repeat, 
      // but let's try to pick the one that was seen longest ago if possible
      let selectedFallback
      if (availableFallbacks.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableFallbacks.length)
        selectedFallback = availableFallbacks[randomIndex]
      } else {
        // All have been seen, just pick one at random from the full era list
        console.warn("All era issues used, repeating...")
        const randomIndex = Math.floor(Math.random() * eraIssues.length)
        selectedFallback = eraIssues[randomIndex]
      }
      
      const uniqueId = `${selectedFallback.id}-${Date.now()}`
      let finalIssue: Issue = {
        ...selectedFallback,
        id: uniqueId,
        options: normalizeIssueOptions(
          selectedFallback.options.map((opt, idx) => ({ ...opt, id: `${uniqueId}-opt-${idx}` })),
          desiredOptionCount,
          selectedFallback.title,
          selectedFallback.category,
          nation.era
        ),
      }

      finalIssue = ensureEraAdvancementOption(applyEraFlavorToIssue(finalIssue, nation.era), nation)
      
      setUsedIssueIds(prev => new Set([...Array.from(prev), finalIssue.title]))
      setCurrentIssue(finalIssue)
    } finally {
      setIsLoading(false)
    }
  }, [nation, history, usedIssueIds, AI_WORKER_URL, mapCrises])

  // ERA TRANSITION LOGIC
  const checkEraTransition = useCallback((newStats: NationStats) => {
    if (!nation) return { nextEra: ERAS[0], updatedStats: newStats };

    const currentEraIndex = ERAS.indexOf(nation.era);
    
    // Only transition eras in Eras mode
    if (nation.gameMode !== "Eras") return { nextEra: nation.era, updatedStats: newStats };

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

  const selectOption = useCallback(async (option: IssueOption) => {
    if (!nation || !currentIssue) return

    setIsLoading(true)
    const issueTitle = currentIssue.title
    const issueCategory = currentIssue.category

    // Simulate decision processing time
    await new Promise(resolve => setTimeout(resolve, 800))

    const newStats = { ...nation.stats }
    const changes: Partial<NationStats> = {}

    for (const [stat, change] of Object.entries(option.effects)) {
      const key = stat as keyof NationStats
      if (key in newStats) {
        const newValue = applyStatDelta(key, newStats[key], change as number)
        changes[key] = newValue - newStats[key]
        newStats[key] = newValue
      }
    }

    const { nextEra, updatedStats } = checkEraTransition(newStats)

    let finalEra = nextEra
    if (option.id === "path-cyberpunk") finalEra = "Cyberpunk Era"
    else if (option.id === "path-space") finalEra = "Intergalactic Empire"

    const historyEntry = `${issueTitle}: ${option.text}`
    const currentEra = nation.era || "Information Age"
    const summary = `Policy Result: In the ${currentEra}, we addressed "${issueTitle}" by choosing to ${option.text}. This reflected our commitment to ${issueCategory}.`

    const newUsedTitles = [...(nation.usedIssueTitles || [])]
    if (!currentIssue.isMapEvent) {
      newUsedTitles.push(issueTitle)
    }

    const newPendingConsequences = [...(nation.pendingConsequences || [])]
    if (option.consequence) {
      newPendingConsequences.push({
        issueTitle: currentIssue.title,
        optionText: option.text,
        consequence: option.consequence
      })
    }

    const institutionDelta = deriveInstitutionChanges(option.effects)
    const factionDelta = deriveFactionChanges(option.effects, nation.governmentType)
    const updatedInstitutions = applyInstitutionChanges(
      normalizeInstitutions(nation.institutions),
      institutionDelta
    )
    const updatedFactions = applyFactionChanges(
      normalizeFactions(nation.factions),
      factionDelta
    )

    const policyCard: PolicyCard = {
      id: `policy-${Date.now()}`,
      title: issueTitle,
      era: nation.era,
      category: issueCategory,
      summary: option.text,
      enactedAt: new Date().toISOString(),
      effects: option.effects,
    }

    const activePolicies = [...(nation.activePolicies || []), policyCard].slice(-12)
    let updatedRegions = updateRegionsFromDecision(
      normalizeRegions(nation.regions),
      option.effects,
      currentIssue.metadata?.regionId
    )

    if (currentIssue.metadata?.projectType === "regional-specialization" && currentIssue.metadata.regionId) {
      const selectedSpec = getSpecializationFromOption(option.id)
      if (selectedSpec) {
        updatedRegions = updatedRegions.map((region) =>
          region.id === currentIssue.metadata?.regionId
            ? {
                ...region,
                specialization: selectedSpec,
                development: clamp(region.development + 8),
                stability: clamp(region.stability + 5),
              }
            : region
        )
      }
    }

    const provisionalNation: Nation = {
      ...nation,
      stats: updatedStats,
      institutions: updatedInstitutions,
      factions: updatedFactions,
      activePolicies,
      regions: updatedRegions,
      issuesResolved: nation.issuesResolved + 1,
    }
    updatedRegions = evolveRegionGeometry(provisionalNation, updatedRegions, {
      effects: option.effects,
      targetRegionId: currentIssue.metadata?.regionId,
      optionId: option.id,
      category: issueCategory,
    })
    provisionalNation.regions = updatedRegions
    const updatedCrisisArcs = resolveAndAdvanceArcs(provisionalNation, option.effects, currentIssue)
    const arcOutcome = applyMaxStageArcConsequences(updatedCrisisArcs, updatedStats, updatedRegions)

    const updatedNation: Nation = {
      ...nation,
      stats: arcOutcome.stats,
      era: finalEra,
      borders: ERA_MAP_DATA[finalEra].baseBorders,
      issuesResolved: nation.issuesResolved + 1,
      decisionHistory: [...(nation.decisionHistory || []), historyEntry].slice(-100),
      historyLog: [...(nation.historyLog || []), summary, ...arcOutcome.logs].slice(-30),
      usedIssueTitles: Array.from(new Set(newUsedTitles)).filter(Boolean),
      pendingConsequences: newPendingConsequences,
      institutions: updatedInstitutions,
      factions: updatedFactions,
      activePolicies,
      regions: arcOutcome.regions,
      crisisArcs: arcOutcome.arcs,
    }

    setUsedIssueIds(new Set(updatedNation.usedIssueTitles))
    setNation(updatedNation)
    setHistory(updatedNation.decisionHistory || [])
    setRecentChanges(changes)
    setCurrentIssue(null)
    setIsLoading(false)

    // Save to DB immediately if session exists
    if (session?.user && activeSlot) {
      try {
        await fetch("/api/nation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nation: {
              ...updatedNation,
              slot: activeSlot,
              borders: updatedNation.borders || [],
              regions: updatedNation.regions || DEFAULT_REGIONS,
              crisisArcs: updatedNation.crisisArcs || []
            }
          }),
        })
      } catch (error) {
        console.error("Failed to save to DB during selection:", error)
      }
    }
  }, [nation, currentIssue, checkEraTransition, session, activeSlot])

  const handleCustomResponse = useCallback(async (text: string) => {
    if (!nation || !currentIssue) return

    setIsLoading(true)
    try {
      const response = await fetch(`${AI_WORKER_URL}?cb=${Date.now()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "interpret",
          nationName: nation.name,
          governmentType: nation.governmentType,
          era: nation.era,
          stats: nation.stats,
          crisisContext: currentIssue.description,
          userResponse: text
        }),
      })

      if (!response.ok) throw new Error("AI Interpretation failed")
      
      const result = await response.json() as { 
        text: string, 
        effects: Partial<NationStats>,
        consequence?: IssueOption["consequence"]
      }

      // Create a dynamic option based on AI interpretation
      const customOption: IssueOption = {
        id: `custom-${Date.now()}`,
        text: text,
        supporter: "Direct Command",
        effects: result.effects,
        consequence: result.consequence
      }

      // Close modal before processing
      setIsCrisisModalOpen(false)
      
      // Use existing selectOption logic
      await selectOption(customOption)
    } catch (error) {
      console.error("Custom response error:", error)
    } finally {
      setIsLoading(false)
    }
  }, [nation, currentIssue, selectOption, AI_WORKER_URL])

  const resetGame = useCallback(async () => {
    if (activeSlot === null) return
    setIsLoading(true)
    try {
      setNation(null)
      setHistory([])
      setUsedIssueIds(new Set())
      
      localStorage.removeItem(`nation_slot_${activeSlot}`)
      if (activeSlot === 1) {
        localStorage.removeItem("nation")
        localStorage.removeItem("decisionHistory")
        localStorage.removeItem("usedIssueIds")
      }
      
      if (session?.user) {
        await fetch(`/api/nation?slot=${activeSlot}`, { method: "DELETE" })
      }
      
      const newSlots = [...slots]
      newSlots[activeSlot - 1] = null
      setSlots(newSlots)
    } catch (error) {
      console.error("Failed to reset game:", error)
    } finally {
      setIsLoading(false)
    }
  }, [session, activeSlot, slots])

  return {
    nation,
    currentIssue,
    isLoading,
    recentChanges,
    history,
    mapCrises,
    createNation,
    generateIssue,
    selectOption,
    resetGame,
    handleMapCrisis,
    handleCustomResponse,
    isCrisisModalOpen,
    setIsCrisisModalOpen,
    slots,
    activeSlot,
    selectSlot,
    deleteSlot,
  }
}
