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
}

export interface Nation {
  id: string
  name: string
  motto: string
  flag: string
  governmentType: string
  currency: string
  capital: string
  leader: string
  stats: NationStats
  founded: Date
  issuesResolved: number
}

export interface IssueOption {
  id: string
  text: string
  supporter: string
  effects: Partial<NationStats>
}

export interface Issue {
  id: string
  title: string
  description: string
  category: string
  options: IssueOption[]
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

export function getStatLabel(stat: keyof NationStats): string {
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

export function createDefaultNation(name: string, governmentType: string): Nation {
  return {
    id: crypto.randomUUID(),
    name,
    motto: "Unity, Progress, Prosperity",
    flag: "🏳️",
    governmentType,
    currency: "Credit",
    capital: `${name} City`,
    leader: "The People",
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
    },
    founded: new Date(),
    issuesResolved: 0,
  }
}
