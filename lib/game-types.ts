export interface NationStats {
  economy: number
  civilRights: number
  politicalFreedom: number
  population: number
  environment: number
  gdp: number
  happiness: number
  crime: number
  education: number
  healthcare: number
  technology: number // Progress towards next era
}

export type InstitutionKey =
  | "governance"
  | "economy"
  | "welfare"
  | "security"
  | "knowledge"

export type FactionKey =
  | "citizens"
  | "elites"
  | "innovators"
  | "traditionalists"
  | "securityCouncil"

export interface PolicyCard {
  id: string
  title: string
  era: GameEra
  category: string
  summary: string
  enactedAt: string
  effects: Partial<NationStats>
}

export type RegionTerrain = "plains" | "highlands" | "coastal" | "riverland" | "industrial" | "frontier"
export type RegionSpecialization = "agrarian" | "industrial" | "trade" | "fortress" | "scholarly"

export interface RegionPoint {
  x: number
  y: number
}

export interface Region {
  id: string
  name: string
  terrain: RegionTerrain
  specialization?: RegionSpecialization
  shape?: RegionPoint[]
  development: number // 0-100
  stability: number // 0-100
  populationShare: number // 0-100
}

export type GameEra = 
  | "Stone Age" 
  | "Bronze Age" 
  | "Iron Age" 
  | "Classical Era" 
  | "Medieval Era" 
  | "Renaissance" 
  | "Industrial Revolution" 
  | "Atomic Age" 
  | "Information Age" 
  | "Cyberpunk Era"
  | "Intergalactic Empire"

export interface Nation {
  id: string
  slot: number
  name: string
  motto: string
  flag: string
  governmentType: string
  currency: string
  capital: string
  leader: string
  stats: NationStats
  era: GameEra
  gameMode: "Eternal" | "Eras"
  founded: Date
  issuesResolved: number
  decisionHistory?: string[]
  historyLog: string[]
  regions?: Region[]
  usedIssueTitles?: string[]
  borders?: string[] // SVG paths for the map
  institutions?: Record<InstitutionKey, number>
  factions?: Record<FactionKey, number>
  activePolicies?: PolicyCard[]
  crisisArcs?: MapCrisis[]
  pendingConsequences?: {
    issueTitle: string
    optionText: string
    consequence: NonNullable<IssueOption["consequence"]>
  }[]
}

export interface IssueOption {
  id: string
  text: string
  supporter: string
  effects: Partial<NationStats>
  consequence?: {
    text: string
    chance: number // 0-1
    type: "benefit" | "downside"
    statEffects: Partial<NationStats>
  }
}

export interface Issue {
  id: string
  title: string
  description: string
  category: string
  options: IssueOption[]
  isMapEvent?: boolean
  metadata?: {
    source?: "map" | "faction" | "institution" | "policy" | "ai"
    crisisType?: MapCrisisType
    severity?: MapCrisisSeverity
    crisisId?: string
    regionId?: string
    regionName?: string
    stage?: number
    projectType?: "regional-specialization"
  }
}

export type MapCrisisType =
  | "unrest"
  | "corruption"
  | "infrastructure"
  | "health"
  | "security"
  | "innovation"

export type MapCrisisSeverity = "low" | "medium" | "high"

export interface MapCrisis {
  id: string
  x: number
  y: number
  regionId?: string
  regionName?: string
  regionTerrain?: RegionTerrain
  type: MapCrisisType
  severity: MapCrisisSeverity
  label: string
  source: "faction" | "institution" | "policy"
  reason: string
  stage?: number
  maxStage?: number
  tick?: number
}

export interface GameState {
  nation: Nation | null
  currentIssue: Issue | null
  isCreating: boolean
  isLoading: boolean
}

export const GOVERNMENT_TYPES = [
  "Democratic Republic",
  "Constitutional Monarchy",
  "Federal Republic",
  "Parliamentary Democracy",
  "Socialist Republic",
  "Libertarian Utopia",
  "Authoritarian State",
  "Theocracy",
  "Corporate State",
  "Anarchy",
] as const

export const FLAG_COLORS = [
  { name: "Crimson", primary: "#DC2626", secondary: "#1F2937" },
  { name: "Royal Blue", primary: "#2563EB", secondary: "#F3F4F6" },
  { name: "Forest Green", primary: "#16A34A", secondary: "#FBBF24" },
  { name: "Imperial Gold", primary: "#EAB308", secondary: "#1F2937" },
  { name: "Deep Purple", primary: "#7C3AED", secondary: "#F3F4F6" },
  { name: "Ocean Teal", primary: "#0D9488", secondary: "#F97316" },
] as const

export function getStatLabel(stat: keyof NationStats, era?: GameEra): string {
  if (era === "Stone Age") {
    if (stat === "economy") return "Calories"
    if (stat === "environment") return "Warmth"
    if (stat === "education") return "Ancestral Wisdom"
    if (stat === "healthcare") return "Herbalism"
  }
  
  if (era === "Industrial Revolution" || era === "Atomic Age") {
    if (stat === "economy") return "Industrial Output"
    if (stat === "environment") return "Ecological Impact"
  }

  if (era === "Cyberpunk Era" || era === "Intergalactic Empire") {
    if (stat === "economy") return "Administrative Integration"
    if (stat === "environment") return "Social Cohesion"
    if (stat === "education") return "Universal Knowledge Access"
    if (stat === "healthcare") return "Human Capital Optimization"
  }

  const labels: Record<keyof NationStats, string> = {
    economy: "Economy",
    civilRights: "Civil Rights",
    politicalFreedom: "Political Freedom",
    population: "Population",
    environment: "Environment",
    gdp: "GDP per Capita",
    happiness: "Happiness",
    crime: "Crime Rate",
    education: "Education",
    healthcare: "Healthcare",
    technology: "Technology",
  }
  return labels[stat]
}

export function getStatDescription(stat: keyof NationStats, value: number): string {
  if (stat === "population") {
    return formatPopulation(value)
  }
  if (stat === "gdp") {
    return `$${value.toLocaleString()}`
  }
  
  if (stat === "technology") {
    return `${value}/100 to next Era`
  }
  
  const descriptions: Record<string, string[]> = {
    economy: ["Collapsed", "Struggling", "Developing", "Growing", "Strong", "Powerhouse"],
    civilRights: ["Non-existent", "Minimal", "Some", "Good", "Excellent", "World-leading"],
    politicalFreedom: ["Authoritarian", "Limited", "Moderate", "Free", "Very Free", "Libertarian"],
    environment: ["Devastated", "Polluted", "Concerning", "Stable", "Clean", "Pristine"],
    happiness: ["Miserable", "Unhappy", "Content", "Happy", "Very Happy", "Euphoric"],
    crime: ["Lawless", "Dangerous", "Concerning", "Moderate", "Low", "Negligible"],
    education: ["None", "Basic", "Standard", "Good", "Excellent", "World-class"],
    healthcare: ["None", "Basic", "Adequate", "Good", "Excellent", "Universal"],
  }
  
  const index = Math.min(Math.floor(value / 20), 5)
  return descriptions[stat]?.[index] ?? `${value}%`
}

export function formatPopulation(pop: number): string {
  if (pop >= 1000000000) return `${(pop / 1000000000).toFixed(1)} billion`
  if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)} million`
  if (pop >= 1000) return `${(pop / 1000).toFixed(1)} thousand`
  return pop.toString()
}

export function createDefaultNation(name: string, governmentType: string, gameMode: "Eternal" | "Eras" = "Eternal", slot: number = 1): Nation {
  return {
    id: crypto.randomUUID(),
    slot,
    name,
    motto: "Unity, Progress, Prosperity",
    flag: "🏳️",
    governmentType,
    currency: "Credit",
    capital: `${name} City`,
    leader: "The People",
    era: gameMode === "Eras" ? "Stone Age" : "Information Age",
    gameMode,
    stats: {
      economy: 50,
      civilRights: 50,
      politicalFreedom: 50,
      population: 5000000,
      environment: 50,
      gdp: 25000,
      happiness: 50,
      crime: 50,
      education: 50,
      healthcare: 50,
      technology: 0,
    },
    founded: new Date(),
    issuesResolved: 0,
    decisionHistory: [],
    historyLog: [],
    regions: [
      { id: "r-heartland", name: "Heartland Basin", terrain: "plains", development: 52, stability: 56, populationShare: 32 },
      { id: "r-coast", name: "Coastal Reach", terrain: "coastal", development: 49, stability: 52, populationShare: 24 },
      { id: "r-highlands", name: "Northern Highlands", terrain: "highlands", development: 42, stability: 50, populationShare: 18 },
      { id: "r-frontier", name: "Frontier March", terrain: "frontier", development: 38, stability: 45, populationShare: 26 },
    ],
    usedIssueTitles: [],
    institutions: {
      governance: 50,
      economy: 50,
      welfare: 50,
      security: 50,
      knowledge: 50,
    },
    factions: {
      citizens: 50,
      elites: 50,
      innovators: 50,
      traditionalists: 50,
      securityCouncil: 50,
    },
    activePolicies: [],
    crisisArcs: [],
    pendingConsequences: [],
  }
}
