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
  MapCrisis,
  MapCrisisSeverity,
  MapCrisisType,
  Region,
  RegionTerrain,
  RegionSpecialization,
  RegionPoint,
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

const DEFAULT_REGIONS: Region[] = [
  { id: "r-heartland", name: "Heartland Basin", terrain: "plains", development: 52, stability: 56, populationShare: 32 },
  { id: "r-coast", name: "Coastal Reach", terrain: "coastal", development: 49, stability: 52, populationShare: 24 },
  { id: "r-highlands", name: "Northern Highlands", terrain: "highlands", development: 42, stability: 50, populationShare: 18 },
  { id: "r-frontier", name: "Frontier March", terrain: "frontier", development: 38, stability: 45, populationShare: 26 },
]

const DEFAULT_REGION_SHAPES: Record<string, RegionPoint[]> = {
  "r-heartland": [
    { x: 40, y: 40 }, { x: 58, y: 38 }, { x: 62, y: 52 }, { x: 50, y: 60 }, { x: 38, y: 52 },
  ],
  "r-coast": [
    { x: 60, y: 30 }, { x: 78, y: 36 }, { x: 82, y: 52 }, { x: 68, y: 58 }, { x: 58, y: 48 },
  ],
  "r-highlands": [
    { x: 20, y: 24 }, { x: 38, y: 28 }, { x: 34, y: 44 }, { x: 18, y: 42 },
  ],
  "r-frontier": [
    { x: 22, y: 56 }, { x: 38, y: 54 }, { x: 46, y: 74 }, { x: 30, y: 84 }, { x: 16, y: 72 },
  ],
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

function normalizeRegions(regions?: Region[]): Region[] {
  const input = regions && regions.length > 0 ? regions : DEFAULT_REGIONS
  const defaultSpecByTerrain: Record<RegionTerrain, RegionSpecialization> = {
    plains: "agrarian",
    highlands: "fortress",
    coastal: "trade",
    riverland: "agrarian",
    industrial: "industrial",
    frontier: "fortress",
  }
  return input.map((r, idx) => ({
    id: r.id || `r-${idx}`,
    name: r.name || `Province ${idx + 1}`,
    terrain: r.terrain || "plains",
    specialization: r.specialization || defaultSpecByTerrain[r.terrain || "plains"],
    shape: (r.shape && r.shape.length >= 3 ? r.shape : DEFAULT_REGION_SHAPES[r.id || `r-${idx}`] || []).map((p) => ({
      x: clamp(Math.round(p.x), 8, 92),
      y: clamp(Math.round(p.y), 8, 92),
    })),
    development: clamp(r.development ?? 50),
    stability: clamp(r.stability ?? 50),
    populationShare: clamp(r.populationShare ?? Math.round(100 / Math.max(input.length, 1))),
  }))
}

function evolveRegionShape(shape: RegionPoint[], seed: string, amplitude: number): RegionPoint[] {
  if (!shape || shape.length < 3 || amplitude <= 0) return shape
  return shape.map((point, idx) => {
    const xJitter = deterministicCoordinate(`${seed}-${idx}-x`, -amplitude, amplitude + 1)
    const yJitter = deterministicCoordinate(`${seed}-${idx}-y`, -amplitude, amplitude + 1)
    return {
      x: clamp(point.x + xJitter, 8, 92),
      y: clamp(point.y + yJitter, 8, 92),
    }
  })
}

function regionCentroid(shape: RegionPoint[]): RegionPoint {
  if (!shape || shape.length === 0) return { x: 50, y: 50 }
  const total = shape.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 })
  return { x: total.x / shape.length, y: total.y / shape.length }
}

function transformRegionShape(
  shape: RegionPoint[],
  opts: { dx?: number; dy?: number; scale?: number }
): RegionPoint[] {
  if (!shape || shape.length < 3) return shape
  const { dx = 0, dy = 0, scale = 1 } = opts
  const c = regionCentroid(shape)
  return shape.map((p) => ({
    x: clamp(Math.round(c.x + (p.x - c.x) * scale + dx), 8, 92),
    y: clamp(Math.round(c.y + (p.y - c.y) * scale + dy), 8, 92),
  }))
}

function policyShapeBias(
  region: Region,
  context?: { effects?: Partial<NationStats>; targetRegionId?: string; optionId?: string; category?: string }
): { dx: number; dy: number; scale: number } {
  const effects = context?.effects || {}
  const isTarget = context?.targetRegionId === region.id

  let dx = 0
  let dy = 0
  let scale = 1

  if (region.specialization === "trade") dx += 1
  if (region.specialization === "fortress") scale += 0.01
  if (region.specialization === "industrial") dy += 1
  if (region.specialization === "agrarian") scale += 0.005
  if (region.specialization === "scholarly") dy -= 1

  dx += Math.sign(effects.economy ?? 0)
  dy += Math.sign((effects.environment ?? 0) * -1)
  scale += ((effects.technology ?? 0) + (effects.education ?? 0)) / 2000

  if (context?.category === "Infrastructure") scale += 0.008
  if (context?.category === "Security") scale += 0.004

  if (context?.optionId?.startsWith("spec-")) {
    scale += 0.02
    if (context.optionId.includes("trade")) dx += 2
    if (context.optionId.includes("fortress")) dy -= 2
    if (context.optionId.includes("industrial")) dy += 2
    if (context.optionId.includes("scholarly")) dx -= 1
  }

  if (isTarget) {
    dx *= 1.8
    dy *= 1.8
    scale += 0.01
  } else {
    dx *= 0.6
    dy *= 0.6
  }

  return { dx, dy, scale: Math.max(0.94, Math.min(1.08, scale)) }
}

function evolveRegionGeometry(
  nation: Nation,
  regions: Region[],
  context?: { effects?: Partial<NationStats>; targetRegionId?: string; optionId?: string; category?: string }
): Region[] {
  const eraIndex = ERAS.indexOf(nation.era)
  const cadence = nation.gameMode === "Eras" ? 3 : 6
  const shouldTick = nation.issuesResolved > 0 && nation.issuesResolved % cadence === 0
  const forceByPolicy = !!context?.optionId?.startsWith("spec-")
  if (!shouldTick && !forceByPolicy) return regions

  const amplitude = Math.max(1, Math.min(4, Math.floor(eraIndex / 3) + 1))
  return regions.map((region) => {
    const base = region.shape || DEFAULT_REGION_SHAPES[region.id] || []
    const jittered = evolveRegionShape(
      base,
      `${nation.id}-${region.id}-${nation.issuesResolved}-${nation.era}-${context?.optionId || "passive"}`,
      amplitude
    )
    const bias = policyShapeBias(region, context)
    return {
      ...region,
      shape: transformRegionShape(jittered, bias),
    }
  })
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

function severityFromPressure(pressure: number): MapCrisisSeverity {
  if (pressure >= 75) return "high"
  if (pressure >= 45) return "medium"
  return "low"
}

function deterministicCoordinate(seed: string, min = 14, max = 86): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return min + (hash % (max - min))
}

function crisisTypeFromInstitution(key: InstitutionKey): MapCrisisType {
  if (key === "governance") return "corruption"
  if (key === "economy") return "infrastructure"
  if (key === "welfare") return "health"
  if (key === "security") return "security"
  return "innovation"
}

function crisisTypeFromFaction(key: FactionKey): MapCrisisType {
  if (key === "citizens" || key === "traditionalists") return "unrest"
  if (key === "elites") return "corruption"
  if (key === "securityCouncil") return "security"
  return "innovation"
}

function buildPressureCrisisCandidates(nation: Nation): MapCrisis[] {
  const crises: MapCrisis[] = []
  const factions = normalizeFactions(nation.factions)
  const institutions = normalizeInstitutions(nation.institutions)
  const regions = normalizeRegions(nation.regions)
  const tick = nation.issuesResolved

  const regionFor = (key: string): Region => {
    const idx = deterministicCoordinate(`${nation.id}-${key}-region-${tick}`, 0, Math.max(regions.length, 1))
    return regions[idx % regions.length]
  }

  const addCrisis = (
    key: string,
    pressure: number,
    source: MapCrisis["source"],
    type: MapCrisisType,
    label: string,
    reason: string
  ) => {
    const severity = severityFromPressure(pressure)
    const region = regionFor(key)
    crises.push({
      id: `cr-${source}-${key}-${tick}`,
      x: deterministicCoordinate(`${nation.id}-${region.id}-${key}-x-${tick}`),
      y: deterministicCoordinate(`${nation.id}-${region.id}-${key}-y-${tick}`),
      regionId: region.id,
      regionName: region.name,
      regionTerrain: region.terrain,
      type,
      severity,
      label,
      source,
      reason,
      stage: 1,
      maxStage: severity === "high" ? 3 : 2,
      tick: 0,
    })
  }

  ;(Object.entries(factions) as [FactionKey, number][])
    .forEach(([key, value]) => {
      const pressure = Math.abs(50 - value)
      if (pressure < 18) return
      addCrisis(
        key,
        pressure * 2,
        "faction",
        crisisTypeFromFaction(key),
        `${key} pressure`,
        `${key} alignment moved to ${value}, creating political volatility.`
      )
    })

  ;(Object.entries(institutions) as [InstitutionKey, number][])
    .forEach(([key, value]) => {
      const pressure = 100 - value
      if (pressure < 22) return
      addCrisis(
        key,
        pressure,
        "institution",
        crisisTypeFromInstitution(key),
        `${key} strain`,
        `${key} capacity is at ${value}, opening systemic vulnerabilities.`
      )
    })

  const policies = nation.activePolicies || []
  const policy = policies.length > 0 ? policies[policies.length - 1] : undefined
  if (policy) {
    const pressure = Math.min(95, 30 + Math.abs((policy.effects.politicalFreedom ?? 0)) + Math.abs((policy.effects.economy ?? 0)))
    addCrisis(
      "policy-echo",
      pressure,
      "policy",
      "unrest",
      "policy backlash",
      `Recent policy \"${policy.title}\" is producing second-order effects.`
    )
  }

  return crises
}

function mergeAndAdvanceCrisisArcs(nation: Nation): MapCrisis[] {
  const existing = (nation.crisisArcs || []).map((arc) => ({
    ...arc,
    stage: arc.stage ?? 1,
    maxStage: arc.maxStage ?? 3,
    tick: (arc.tick ?? 0) + 1,
  }))

  const advanced = existing
    .map((arc) => {
      const shouldAdvance = (arc.tick ?? 0) >= 2 && (arc.stage ?? 1) < (arc.maxStage ?? 3)
      if (!shouldAdvance) return arc
      const nextStage = (arc.stage ?? 1) + 1
      const nextSeverity: MapCrisisSeverity = nextStage >= 3 ? "high" : nextStage === 2 ? "medium" : "low"
      return { ...arc, stage: nextStage, severity: nextSeverity, tick: 0 }
    })
    .slice(0, 8)

  const candidates = buildPressureCrisisCandidates(nation)
  const ids = new Set(advanced.map((arc) => `${arc.source}-${arc.type}-${arc.regionId}`))
  const additions: MapCrisis[] = []
  for (const c of candidates) {
    const key = `${c.source}-${c.type}-${c.regionId}`
    if (ids.has(key)) continue
    additions.push(c)
    ids.add(key)
    if (advanced.length + additions.length >= 8) break
  }

  return [...advanced, ...additions]
    .sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "high" ? -1 : b.severity === "high" ? 1 : a.severity === "medium" ? -1 : 1))
    .slice(0, 8)
}

function buildMapCrises(nation: Nation): MapCrisis[] {
  return (nation.crisisArcs || [])
    .filter((arc) => (arc.stage ?? 1) <= (arc.maxStage ?? 3))
    .sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "high" ? -1 : b.severity === "high" ? 1 : a.severity === "medium" ? -1 : 1))
    .slice(0, 5)
}

function updateRegionsFromDecision(
  regions: Region[],
  effects: Partial<NationStats>,
  targetRegionId?: string
): Region[] {
  const baseDelta = Math.round(((effects.happiness ?? 0) + (effects.economy ?? 0) - (effects.crime ?? 0)) * 0.15)
  const devDelta = Math.round(((effects.economy ?? 0) + (effects.education ?? 0) + (effects.technology ?? 0)) * 0.12)

  return regions.map((region) => {
    const localBonus = targetRegionId && region.id === targetRegionId ? 3 : 0
    return {
      ...region,
      stability: clamp(region.stability + baseDelta + localBonus),
      development: clamp(region.development + devDelta + localBonus),
    }
  })
}

function resolveAndAdvanceArcs(
  nation: Nation,
  effects: Partial<NationStats>,
  currentIssue: Issue
): MapCrisis[] {
  const targetCrisisId = currentIssue.metadata?.crisisId
  const arcs = mergeAndAdvanceCrisisArcs(nation)
    .filter((arc) => arc.id !== targetCrisisId)
    .map((arc) => {
      const stabilityPressure = (effects.happiness ?? 0) + (effects.crime ?? 0) * -1
      const shouldDeescalate = stabilityPressure >= 8 && (arc.stage ?? 1) > 1
      if (!shouldDeescalate) return arc
      const nextStage = Math.max(1, (arc.stage ?? 1) - 1)
      const nextSeverity: MapCrisisSeverity = nextStage >= 3 ? "high" : nextStage === 2 ? "medium" : "low"
      return { ...arc, stage: nextStage, severity: nextSeverity, tick: 0 }
    })

  return arcs.slice(0, 8)
}

function applyMaxStageArcConsequences(
  arcs: MapCrisis[],
  stats: NationStats,
  regions: Region[]
): { arcs: MapCrisis[]; stats: NationStats; regions: Region[]; logs: string[] } {
  let nextStats = { ...stats }
  let nextRegions = [...regions]
  const remaining: MapCrisis[] = []
  const logs: string[] = []

  for (const arc of arcs) {
    const atMax = (arc.stage ?? 1) >= (arc.maxStage ?? 3)
    const overdue = (arc.tick ?? 0) >= 2
    if (!atMax || !overdue) {
      remaining.push(arc)
      continue
    }

    const penalty: Partial<NationStats> = {
      economy: -6,
      happiness: -8,
      crime: 7,
    }
    if (arc.type === "security") {
      penalty.crime = 10
      penalty.politicalFreedom = -4
    }
    if (arc.type === "health") {
      penalty.healthcare = -8
      penalty.population = -3
    }
    if (arc.type === "infrastructure") {
      penalty.economy = -10
      penalty.gdp = -4
    }
    if (arc.type === "innovation") {
      penalty.technology = -6
      penalty.education = -4
    }

    for (const [k, v] of Object.entries(penalty)) {
      const key = k as keyof NationStats
      nextStats[key] = applyStatDelta(key, nextStats[key], v as number)
    }

    if (arc.regionId) {
      nextRegions = nextRegions.map((region) =>
        region.id === arc.regionId
          ? {
              ...region,
              stability: clamp(region.stability - 10),
              development: clamp(region.development - 4),
            }
          : region
      )
    }

    logs.push(`[CRISIS BREAKDOWN] ${arc.label} reached maximum escalation in ${arc.regionName || "a province"} and caused systemic losses.`)
  }

  return { arcs: remaining.slice(0, 8), stats: nextStats, regions: nextRegions, logs }
}

const CRISIS_SEVERITY_MULTIPLIER: Record<MapCrisisSeverity, number> = {
  low: 1.0,
  medium: 1.1,
  high: 1.2,
}

const CRISIS_TEMPLATES: Record<
  MapCrisisType,
  {
    title: string
    description: string
    category: string
    options: Array<Omit<IssueOption, "id">>
  }
> = {
  unrest: {
    title: "Regional Unrest Escalation",
    description: "Coordinated demonstrations are spreading through provincial hubs. Leadership must choose between concession, containment, or repression.",
    category: "Civil Rights",
    options: [
      {
        text: "Open emergency talks and concessions.",
        supporter: "Civic Mediation Council",
        effects: { politicalFreedom: 8, happiness: 10, economy: -6 },
        consequence: { text: "A reform bloc forms and demands constitutional guarantees.", chance: 0.35, type: "benefit", statEffects: { civilRights: 8 } },
      },
      {
        text: "Declare curfew and deploy security forces.",
        supporter: "National Security Directorate",
        effects: { crime: -8, politicalFreedom: -10, happiness: -8 },
        consequence: { text: "Suppression radicalizes opposition networks underground.", chance: 0.45, type: "downside", statEffects: { crime: 10, happiness: -10 } },
      },
    ],
  },
  corruption: {
    title: "Procurement Corruption Probe",
    description: "A procurement ring tied to powerful insiders is draining state capacity. The administration must pick between deep reform or elite compromise.",
    category: "Politics",
    options: [
      {
        text: "Authorize independent anti-corruption audits.",
        supporter: "Inspector General",
        effects: { economy: 6, politicalFreedom: 6, happiness: 4 },
        consequence: { text: "Institutional reform weakens patronage networks long term.", chance: 0.4, type: "benefit", statEffects: { economy: 8, education: 5 } },
      },
      {
        text: "Contain scandal quietly to preserve elite stability.",
        supporter: "Cabinet Secretariat",
        effects: { economy: -8, politicalFreedom: -6, crime: 10 },
        consequence: { text: "Public trust collapses after leaked internal documents.", chance: 0.45, type: "downside", statEffects: { happiness: -12, civilRights: -6 } },
      },
    ],
  },
  infrastructure: {
    title: "Infrastructure Reliability Failure",
    description: "A critical logistics corridor is failing under load. Trade and services are now vulnerable to cascading outages.",
    category: "Infrastructure",
    options: [
      {
        text: "Fund an accelerated public works rebuild.",
        supporter: "Planning Ministry",
        effects: { economy: 8, happiness: 5, gdp: -2 },
        consequence: { text: "Modernized systems attract skilled migration.", chance: 0.3, type: "benefit", statEffects: { population: 3, technology: 6 } },
      },
      {
        text: "Outsource rapid repair to private consortiums.",
        supporter: "Commercial Alliance",
        effects: { economy: 10, civilRights: -4, happiness: -4 },
        consequence: { text: "Monopoly pricing emerges around essential services.", chance: 0.4, type: "downside", statEffects: { economy: -6, happiness: -8 } },
      },
    ],
  },
  health: {
    title: "Public Health Capacity Stress",
    description: "Hospitals are operating near maximum load and regional clinics report shortage spikes.",
    category: "Healthcare",
    options: [
      {
        text: "Mobilize national emergency health programs.",
        supporter: "Health Directorate",
        effects: { healthcare: 10, happiness: 6, economy: -5 },
        consequence: { text: "Preventive care systems improve baseline resilience.", chance: 0.35, type: "benefit", statEffects: { healthcare: 8, education: 4 } },
      },
      {
        text: "Restrict care to critical regions and triage access.",
        supporter: "Fiscal Stabilization Board",
        effects: { economy: 4, healthcare: -8, happiness: -10 },
        consequence: { text: "Localized outbreaks trigger migration pressure.", chance: 0.5, type: "downside", statEffects: { population: -4, crime: 7 } },
      },
    ],
  },
  security: {
    title: "Security Breach Chain",
    description: "Multiple security incidents indicate coordinated probing of state systems and transit hubs.",
    category: "Security",
    options: [
      {
        text: "Invest in intelligence and cyber defense modernization.",
        supporter: "Strategic Defense Bureau",
        effects: { crime: -10, technology: 8, economy: -4 },
        consequence: { text: "Advanced monitoring tools trigger civil rights backlash.", chance: 0.3, type: "downside", statEffects: { politicalFreedom: -8, happiness: -4 } },
      },
      {
        text: "Expand patrol powers and emergency detention.",
        supporter: "Internal Security Council",
        effects: { crime: -12, politicalFreedom: -9, happiness: -5 },
        consequence: { text: "Short-term safety gains decay as trust declines.", chance: 0.45, type: "downside", statEffects: { crime: 6, happiness: -7 } },
      },
    ],
  },
  innovation: {
    title: "Strategic Technology Schism",
    description: "A major technological transition is splitting regulators, industry, and labor over who captures the upside.",
    category: "Technology",
    options: [
      {
        text: "Open innovation grants with broad public access.",
        supporter: "Science Coalition",
        effects: { technology: 12, education: 8, economy: -4 },
        consequence: { text: "Talent clusters emerge and boost long-term productivity.", chance: 0.35, type: "benefit", statEffects: { gdp: 3, economy: 6 } },
      },
      {
        text: "License strategic tech only to national champions.",
        supporter: "Industrial Cabinet",
        effects: { economy: 9, technology: 5, civilRights: -6 },
        consequence: { text: "Concentrated power slows diffusion and sparks resentment.", chance: 0.4, type: "downside", statEffects: { happiness: -9, education: -5 } },
      },
    ],
  },
}

function scaleEffectsBySeverity(effects: Partial<NationStats>, severity: MapCrisisSeverity): Partial<NationStats> {
  const multiplier = CRISIS_SEVERITY_MULTIPLIER[severity]
  return Object.fromEntries(
    Object.entries(effects).map(([k, v]) => [k, typeof v === "number" ? Math.round(v * multiplier) : v])
  ) as Partial<NationStats>
}

function terrainDescriptor(terrain?: RegionTerrain): string {
  if (terrain === "coastal") return "coastal ports and fisheries"
  if (terrain === "highlands") return "mountain passes and upland settlements"
  if (terrain === "riverland") return "river corridors and floodplains"
  if (terrain === "industrial") return "factory districts and rail depots"
  if (terrain === "frontier") return "frontier routes and border villages"
  return "the central plains and market roads"
}

function specializeCrisisEffects(
  effects: Partial<NationStats>,
  terrain?: RegionTerrain,
  specialization?: RegionSpecialization
): Partial<NationStats> {
  const out = { ...effects }
  if (terrain === "coastal") {
    out.economy = (out.economy ?? 0) + 2
  } else if (terrain === "highlands") {
    out.crime = (out.crime ?? 0) - 1
  } else if (terrain === "industrial") {
    out.environment = (out.environment ?? 0) - 2
  }

  if (specialization === "agrarian") out.population = (out.population ?? 0) + 1
  if (specialization === "industrial") out.technology = (out.technology ?? 0) + 1
  if (specialization === "trade") out.economy = (out.economy ?? 0) + 1
  if (specialization === "fortress") out.crime = (out.crime ?? 0) - 1
  if (specialization === "scholarly") out.education = (out.education ?? 0) + 1

  return out
}

function createIssueFromCrisis(crisis: MapCrisis, nation?: Nation): Issue {
  const template = CRISIS_TEMPLATES[crisis.type]
  const desiredOptions = crisis.severity === "high" ? 5 : crisis.severity === "medium" ? 4 : 3
  const region = normalizeRegions(nation?.regions).find((r) => r.id === crisis.regionId)
  const regionDescriptor = terrainDescriptor(crisis.regionTerrain || region?.terrain)
  const era = nation?.era
  const baseOptions = template.options.map((opt, idx) => ({
    ...opt,
    id: `${crisis.id}-${idx}`,
    effects: scaleEffectsBySeverity(
      specializeCrisisEffects(opt.effects, crisis.regionTerrain || region?.terrain, region?.specialization),
      crisis.severity
    ),
  }))

  const preIndustrial = ["Stone Age", "Bronze Age", "Iron Age", "Classical Era", "Medieval Era", "Renaissance"].includes(era || "")
  const fallbackOptions: IssueOption[] = preIndustrial
    ? [
        {
          id: `${crisis.id}-fallback-a`,
          text: "Send trusted scouts first, then commit the full clan if signs are favorable.",
          supporter: "Pathfinders Circle",
          effects: scaleEffectsBySeverity({ economy: -2, education: 4, happiness: 2 }, crisis.severity),
        },
        {
          id: `${crisis.id}-fallback-b`,
          text: "Gather elders from each settlement to agree on one realm-wide response.",
          supporter: "Elders Council",
          effects: scaleEffectsBySeverity({ politicalFreedom: 4, crime: -3, economy: -2 }, crisis.severity),
        },
        {
          id: `${crisis.id}-fallback-c`,
          text: "Preserve current routines and ration stores while the shock passes.",
          supporter: "Steward Keepers",
          effects: scaleEffectsBySeverity({ economy: 2, happiness: -2, healthcare: 2 }, crisis.severity),
        },
      ]
    : [
        {
          id: `${crisis.id}-fallback-a`,
          text: "Run a phased response with regional pilots before full rollout.",
          supporter: "Strategic Planning Office",
          effects: scaleEffectsBySeverity({ economy: -3, education: 4, happiness: 3 }, crisis.severity),
        },
        {
          id: `${crisis.id}-fallback-b`,
          text: "Create a cross-faction oversight task force and publish weekly metrics.",
          supporter: "National Audit Committee",
          effects: scaleEffectsBySeverity({ politicalFreedom: 4, crime: -3, economy: -2 }, crisis.severity),
        },
        {
          id: `${crisis.id}-fallback-c`,
          text: "Hold course but deploy targeted emergency reserves.",
          supporter: "Continuity Secretariat",
          effects: scaleEffectsBySeverity({ economy: 2, happiness: -2, healthcare: 2 }, crisis.severity),
        },
      ]

  const options: IssueOption[] = [...baseOptions]
  for (const opt of fallbackOptions) {
    if (options.length >= desiredOptions) break
    options.push(opt)
  }

  return {
    id: `map-${crisis.id}`,
    title: `${template.title} - ${crisis.regionName || "Province"} (${crisis.severity.toUpperCase()})`,
    description: `${template.description} In ${crisis.regionName || "the affected region"} (${regionDescriptor}), ${crisis.reason}`,
    category: template.category,
    isMapEvent: true,
    metadata: {
      source: crisis.source,
      crisisType: crisis.type,
      severity: crisis.severity,
      crisisId: crisis.id,
      regionId: crisis.regionId,
      regionName: crisis.regionName,
      stage: crisis.stage,
    },
    options,
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

function createRegionalSpecializationIssue(nation: Nation): Issue | null {
  const regions = normalizeRegions(nation.regions)
  if (regions.length === 0) return null
  if (nation.issuesResolved > 0 && nation.issuesResolved % 6 !== 0) return null

  const target = [...regions].sort((a, b) => (a.development + a.stability) - (b.development + b.stability))[0]
  if (!target) return null

  return {
    id: `regional-specialization-${target.id}-${Date.now()}`,
    title: `Provincial Charter: ${target.name}`,
    description: `The council is drafting a long-term charter for ${target.name}. Select a specialization path that will shape regional development and future crises.`,
    category: "Infrastructure",
    metadata: {
      source: "policy",
      projectType: "regional-specialization",
      regionId: target.id,
      regionName: target.name,
    },
    options: [
      { id: "spec-agrarian", text: "Agrarian Breadbasket", supporter: "Land Stewards", effects: { population: 4, economy: 5, technology: -2 } },
      { id: "spec-industrial", text: "Industrial Engine", supporter: "Manufacturing Syndicate", effects: { economy: 9, environment: -7, technology: 5 } },
      { id: "spec-trade", text: "Trade and Logistics Hub", supporter: "Mercantile Guilds", effects: { economy: 7, politicalFreedom: 3, crime: 2 } },
      { id: "spec-fortress", text: "Defensive Frontier Complex", supporter: "Defense Command", effects: { crime: -7, politicalFreedom: -4, economy: 2 } },
      { id: "spec-scholarly", text: "Scholarly and Civic Center", supporter: "Academy Council", effects: { education: 8, technology: 6, economy: -3 } },
    ],
  }
}

function getSpecializationFromOption(optionId: string): RegionSpecialization | null {
  if (optionId.startsWith("spec-agrarian")) return "agrarian"
  if (optionId.startsWith("spec-industrial")) return "industrial"
  if (optionId.startsWith("spec-trade")) return "trade"
  if (optionId.startsWith("spec-fortress")) return "fortress"
  if (optionId.startsWith("spec-scholarly")) return "scholarly"
  return null
}

function getIssueComplexity(nation: Nation, mapCrises: MapCrisis[]): "low" | "medium" | "high" {
  const highCrises = mapCrises.filter((c) => c.severity === "high").length
  const mediumCrises = mapCrises.filter((c) => c.severity === "medium").length
  const volatility =
    Math.abs((nation.factions?.citizens ?? 50) - 50) +
    Math.abs((nation.factions?.elites ?? 50) - 50) +
    Math.abs((nation.factions?.securityCouncil ?? 50) - 50)

  if (highCrises > 0 || volatility >= 85) return "high"
  if (mediumCrises > 0 || volatility >= 45) return "medium"
  return "low"
}

function getDesiredOptionCount(complexity: "low" | "medium" | "high"): number {
  if (complexity === "high") return 5
  if (complexity === "medium") return 4
  return 3
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

const ERA_MAP_DATA: Record<GameEra, { viewBox: string; baseBorders: string[] }> = {
  "Stone Age": {
    viewBox: "30 30 40 40",
    baseBorders: ["M 40,40 L 60,40 L 60,60 L 40,60 Z"]
  },
  "Bronze Age": {
    viewBox: "25 25 50 50",
    baseBorders: ["M 35,35 L 65,35 L 65,65 L 35,65 Z"]
  },
  "Iron Age": {
    viewBox: "20 20 60 60",
    baseBorders: ["M 30,30 L 70,30 L 70,70 L 30,70 Z"]
  },
  "Classical Era": {
    viewBox: "15 15 70 70",
    baseBorders: ["M 25,25 L 75,25 L 75,75 L 25,75 Z"]
  },
  "Medieval Era": {
    viewBox: "10 10 80 80",
    baseBorders: ["M 20,20 L 80,20 L 80,80 L 20,80 Z"]
  },
  "Renaissance": {
    viewBox: "5 5 90 90",
    baseBorders: ["M 15,15 L 85,15 L 85,85 L 15,85 Z"]
  },
  "Industrial Revolution": {
    viewBox: "0 0 100 100",
    baseBorders: ["M 10,10 L 90,10 L 90,90 L 10,90 Z"]
  },
  "Atomic Age": {
    viewBox: "0 0 100 100",
    baseBorders: ["M 5,5 L 95,5 L 95,95 L 5,95 Z"]
  },
  "Information Age": {
    viewBox: "0 0 100 100",
    baseBorders: ["M 2,2 L 98,2 L 98,98 L 2,98 Z"]
  },
  "Cyberpunk Era": {
    viewBox: "0 0 100 100",
    baseBorders: ["M 0,0 L 100,0 L 100,100 L 0,100 Z"]
  },
  "Intergalactic Empire": {
    viewBox: "-50 -50 200 200",
    baseBorders: ["M -20,-20 L 120,-20 L 120,120 L -20,120 Z"]
  }
}

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
          effects: { politicalFreedom: -10, technology: 15, happiness: 10 }
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
          effects: { population: 2, happiness: 15, healthcare: 5 }
        }
      ]
    },
    {
      id: "stone-3",
      title: "The Cave Paintings",
      description: "A young member of the tribe has begun painting scenes of the hunt on the cave walls. Some say it's a waste of time that could be spent gathering, while others find it inspiring.",
      category: "Culture",
      options: [
        {
          id: "s3a",
          text: "Encourage the Art. It gives our people an identity.",
          supporter: "Artist",
          effects: { happiness: 25, education: 10, population: -2 }
        },
        {
          id: "s3b",
          text: "Back to Work. Survival leaves no room for vanity.",
          supporter: "Elder",
          effects: { economy: 10, population: 5, happiness: -10 }
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
    },
    {
      id: "bronze-2",
      title: "The Irrigation Canal",
      description: "The river has been unpredictable lately. A plan has been proposed to build a grand canal system to ensure the crops never fail, but it requires the labor of every citizen.",
      category: "Infrastructure",
      options: [
        {
          id: "b2a",
          text: "Build the Canal. Security in water is security in life.",
          supporter: "Architect",
          effects: { economy: 25, population: 10, happiness: -10 }
        },
        {
          id: "b2b",
          text: "Trust the Gods. The labor is too much to ask.",
          supporter: "High Priest",
          effects: { happiness: 15, politicalFreedom: 10, economy: -15 }
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
          effects: { economy: 5, happiness: -5 }
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
          effects: { politicalFreedom: -10, happiness: 20, economy: 5 }
        },
        {
          id: "m1b",
          text: "Mediate a peace. Civil war would be disastrous.",
          supporter: "High Priest",
          effects: { happiness: 20, politicalFreedom: 5 }
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
          effects: { politicalFreedom: -20, happiness: 15, education: -5 }
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
          effects: { happiness: 15, politicalFreedom: -10, crime: -5 }
        },
        {
          id: "in1b",
          text: "Free Expression. Let the people decide.",
          supporter: "Tech Founder",
          effects: { politicalFreedom: 20, happiness: 10 }
        }
      ]
    },
    {
      id: "info-2",
      title: "Automation Anxiety",
      description: "AI-driven robotics are displacing workers in the service sector. Labor unions demand a 'Robot Tax' to fund universal basic income.",
      category: "Economy",
      options: [
        {
          id: "in2a",
          text: "Implement the Robot Tax. Human dignity must come first.",
          supporter: "Labor Leader",
          effects: { economy: -15, happiness: 20, technology: 5 }
        },
        {
          id: "in2b",
          text: "Embrace Efficiency. Automation is the engine of progress.",
          supporter: "Industrialist",
          effects: { economy: 25, happiness: -10, technology: 20 }
        }
      ]
    },
    {
      id: "info-4",
      title: "Space Tourism",
      description: "Wealthy citizens are clamoring for commercial space travel. Should we subsidize this new industry to lead the space race, or tax it heavily to fund social programs?",
      category: "Economy",
      options: [
        {
          id: "in4a",
          text: "Subsidize Space. The stars are our destiny.",
          supporter: "Rocket Scientist",
          effects: { economy: 20, education: 10, population: -5 }
        },
        {
          id: "in4b",
          text: "Tax the Tourists. Focus on the Earth first.",
          supporter: "Social Worker",
          effects: { healthcare: 15, population: 10, economy: -5 }
        }
      ]
    },
    {
      id: "info-3",
      title: "The Climate Accord",
      description: "Global temperatures are rising. We are pressured to sign a restrictive climate accord that will hurt our heavy industry but save the environment.",
      category: "Environment",
      options: [
        {
          id: "in3a",
          text: "Sign the Accord. We only have one planet.",
          supporter: "Environmentalist",
          effects: { environment: 30, economy: -20, healthcare: 10 }
        },
        {
          id: "in3b",
          text: "Prioritize Growth. Our people need jobs now.",
          supporter: "Industrialist",
          effects: { economy: 25, environment: -25, happiness: 5 }
        }
      ]
    },
    {
      id: "info-4",
      title: "Deepfake Security Crisis",
      description: "Highly convincing deepfakes of your administration are circulating, causing confusion among the citizenry. Should we ban all synthetic media or launch a media literacy campaign?",
      category: "Security",
      options: [
        {
          id: "in4a",
          text: "Ban Synthetic Media. Security requires total control over our image.",
          supporter: "Security Chief",
          effects: { politicalFreedom: -20, crime: -15, happiness: 5 }
        },
        {
          id: "in4b",
          text: "Education Campaign. Empower the citizens to see the truth themselves.",
          supporter: "Education Minister",
          effects: { education: 20, politicalFreedom: 10, happiness: 5 }
        }
      ]
    },
    {
      id: "info-5",
      title: "Genetic Sovereignty",
      description: "A major corporation has patented a new 'optimized' human genome. They want to sell genetic enhancements to the wealthy. Critics warn of a biological class system.",
      category: "Civil Rights",
      options: [
        {
          id: "in5a",
          text: "Nationalize Genetic Tech. Health is a right, not a luxury.",
          supporter: "Health Minister",
          effects: { healthcare: 30, economy: -10, politicalFreedom: -5 }
        },
        {
          id: "in5b",
          text: "Allow Private Market. Innovation requires a profit motive.",
          supporter: "CEO",
          effects: { economy: 25, healthcare: 10, politicalFreedom: 5 }
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
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false)
  const [mapCrises, setMapCrises] = useState<MapCrisis[]>([])
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

  useEffect(() => {
    if (!nation) {
      setMapCrises([])
      return
    }
    setMapCrises(buildMapCrises(nation))
  }, [nation])

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

  const handleMapCrisis = useCallback((crisis: MapCrisis) => {
    if (!nation) return

    setIsLoading(true)
    const baseIssue = createIssueFromCrisis(crisis, nation)
    const flavored = applyEraFlavorToIssue(baseIssue, nation.era)
    setCurrentIssue(ensureEraAdvancementOption(flavored, nation))
    setIsCrisisModalOpen(true)
    setIsLoading(false)
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
        regions: normalizeRegions(n.regions),
        crisisArcs: (n.crisisArcs || []) as MapCrisis[],
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
