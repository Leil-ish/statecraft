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
  crisisLoadStreak?: number
  recentIssueKeys?: string[]
  pendingConsequences?: {
    issueTitle: string
    optionText: string
    dueAtIssueCount?: number
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
    projectType?: "regional-specialization" | "founding-currency" | "founding-capital" | "founding-leadership"
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

export function getGovernmentLeadershipLabel(governmentType: string): string {
  const type = governmentType.toLowerCase()
  if (type.includes("monarchy") || type.includes("realm")) return "Crowned Authority"
  if (type.includes("theocracy") || type.includes("temple")) return "Sacred Steward"
  if (type.includes("corporate") || type.includes("mercantile") || type.includes("league")) return "Executive Office"
  if (type.includes("authoritarian") || type.includes("directorate")) return "Supreme Command"
  if (type.includes("anarchy")) return "Coordinating Voice"
  if (type.includes("republic") || type.includes("democracy") || type.includes("commonwealth")) return "Elected Mandate"
  return "National Leadership"
}

export function getLeaderTitleSuggestions(governmentType: string): string[] {
  const type = governmentType.toLowerCase()

  if (type.includes("monarchy") || type.includes("realm")) {
    return ["Keeper of the Iron Crown", "First Banner of the Realm", "Sovereign of Hearth and Horizon"]
  }
  if (type.includes("theocracy") || type.includes("temple")) {
    return ["High Oracle of State", "Steward of the Sacred Charter", "Warden of Divine Mandate"]
  }
  if (type.includes("corporate") || type.includes("mercantile") || type.includes("league")) {
    return ["Chief Prosperity Architect", "Prime Negotiator of the League", "Grand Executive of Civic Profit"]
  }
  if (type.includes("authoritarian") || type.includes("directorate")) {
    return ["Marshal of National Will", "First Directive Officer", "Guardian of Order Protocol"]
  }
  if (type.includes("anarchy") || type.includes("plural")) {
    return ["Rotating Voice of the Commons", "Convener of Many Banners", "First Among Unruly Equals"]
  }
  if (type.includes("republic") || type.includes("democracy") || type.includes("commonwealth")) {
    return ["Prime Steward of the Republic", "Speaker of the National Assembly", "Custodian of the Public Trust"]
  }

  return ["High Chancellor", "Civic Pathfinder", "First Steward of the State"]
}

export function getLeaderTitleSuggestionsFromSeed(governmentType: string, seed = 0): string[] {
  const base = getLeaderTitleSuggestions(governmentType)
  const type = governmentType.toLowerCase()
  const extrasByFamily: Record<string, string[]> = {
    monarchy: ["Keeper of the Seven Seals", "Sun-Crowned Regent", "Warden of the Royal Standard"],
    theocracy: ["Voice of the Eternal Canon", "First Light of the Temple", "Keeper of Sacred Ordinance"],
    corporate: ["Chief Synergy Marshal", "Quartermaster of Ambition", "Prime Ledger Visionary"],
    mercantile: ["Harbormaster of Fortune", "Grand Broker of Stars", "Steward of the Trading Dawn"],
    authoritarian: ["Supreme Stabilizer", "First Executor of Order", "Iron Custodian of State Protocol"],
    directorate: ["Marshal of the Executive Matrix", "Directive Primarch", "Custodian of the Core Mandate"],
    anarchy: ["Coordinator of Constructive Chaos", "Speaker for Unruly Harmony", "First Convenor of Free Banners"],
    plural: ["Rotating Convener of Many Voices", "Mediator of the Great Assembly", "Custodian of Consensus"],
    republic: ["Tribune of the Public Mandate", "Prime Civic Arbiter", "Keeper of the Common Seal"],
    democracy: ["Speaker of the Open Ballot", "First Delegate of the Commons", "Custodian of Civic Choice"],
    commonwealth: ["Steward of Shared Prosperity", "Warden of the Civic Compact", "First Servant of the Commonwealth"],
  }

  let extras: string[] = []
  for (const [family, pool] of Object.entries(extrasByFamily)) {
    if (type.includes(family)) {
      extras = pool
      break
    }
  }
  if (extras.length === 0) {
    extras = ["High Steward of Destiny", "Prime Curator of Statecraft", "First Architect of the National Project"]
  }

  const merged = [...base, ...extras]
  let hash = 0
  const seedText = `${governmentType}:${seed}`
  for (let i = 0; i < seedText.length; i++) {
    hash = (hash * 31 + seedText.charCodeAt(i)) >>> 0
  }
  const start = merged.length > 0 ? hash % merged.length : 0

  const picked: string[] = []
  for (let i = 0; i < merged.length && picked.length < 3; i++) {
    const candidate = merged[(start + i) % merged.length]
    if (!picked.includes(candidate)) picked.push(candidate)
  }

  return picked
}

export function getDefaultCurrencyForEra(era: GameEra): string {
  if (era === "Stone Age") return "Shell Beads"
  if (era === "Bronze Age") return "Bronze Rings"
  if (era === "Iron Age") return "Iron Marks"
  if (era === "Classical Era") return "Silver Drachms"
  if (era === "Medieval Era") return "Crown Pennies"
  if (era === "Renaissance") return "Guild Florins"
  if (era === "Industrial Revolution") return "Industrial Notes"
  if (era === "Atomic Age") return "State Bonds"
  return "Credit"
}

export function createDefaultNation(name: string, governmentType: string, gameMode: "Eternal" | "Eras" = "Eternal", slot: number = 1): Nation {
  const era: GameEra = gameMode === "Eras" ? "Stone Age" : "Information Age"
  return {
    id: crypto.randomUUID(),
    slot,
    name,
    motto: "Unity, Progress, Prosperity",
    flag: "🏳️",
    governmentType,
    currency: getDefaultCurrencyForEra(era),
    capital: `${name} City`,
    leader: "The People",
    era,
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
    crisisLoadStreak: 0,
    recentIssueKeys: [],
    pendingConsequences: [],
  }
}
