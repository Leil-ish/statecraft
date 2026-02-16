"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  Globe, 
  Flag, 
  Sparkles, 
  ChevronRight,
  ArrowLeft,
  Loader2,
  History as HistoryIcon
} from "lucide-react"
import { GOVERNMENT_TYPES, type Nation, createDefaultNation } from "@/lib/game-types"

interface NationCreationProps {
  onCreateNation: (nation: Nation) => void
  isLoading?: boolean
}

const flagEmojis = [
  "🦅", "🦁", "🐉", "🦬", "🐺", "🐻", "🐍", "🦊",
  "🌞", "🌙", "⭐", "☄️", "🔥", "⚡", "🌊", "🌿",
  "🏔️", "🌋", "🏛️", "🗿", "⚔️", "🛡️", "🏹", "🪓",
  "👑", "🧭", "🔱", "⚒️", "🎭", "🕊️", "🦉", "🦄",
]

export function NationCreation({ onCreateNation, isLoading = false }: NationCreationProps) {
  const [step, setStep] = useState(1)
  const [nationName, setNationName] = useState("")
  const [governmentType, setGovernmentType] = useState<string>("")
  const [selectedFlag, setSelectedFlag] = useState("🦅")
  const [customFlag, setCustomFlag] = useState("")
  const [motto, setMotto] = useState("")
  const [capitalName, setCapitalName] = useState("")
  const [leaderName, setLeaderName] = useState("")
  const [gameMode, setGameMode] = useState<"Eternal" | "Eras">("Eternal")
  const effectiveFlag = customFlag.trim() || selectedFlag
  
  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    }
  }
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }
  
  const handleCreate = () => {
    const nation = createDefaultNation(nationName, governmentType, gameMode)
    nation.flag = effectiveFlag
    if (motto) nation.motto = motto
    if (capitalName.trim()) nation.capital = capitalName.trim()
    if (leaderName.trim()) nation.leader = leaderName.trim()
    onCreateNation(nation)
  }
  
  const canProceed = () => {
    if (step === 1) return nationName.trim().length >= 3
    if (step === 2) return governmentType !== ""
    return true
  }
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 selection:bg-blue-500/30">
      {/* Sophisticated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-2xl relative"
      >
        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden rounded-[32px] sm:rounded-[40px] border-t-white/10">
          {/* Header */}
          <CardHeader className="text-center pb-6 sm:pb-10 relative pt-8 sm:pt-12">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent" />
            <div className="relative space-y-4 sm:space-y-6">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-1 sm:mb-2 shadow-2xl relative group">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-2xl sm:rounded-3xl group-hover:bg-blue-500/30 transition-colors" />
                <Globe className="h-8 w-8 sm:h-10 sm:w-10 text-blue-400 relative z-10" />
              </div>
              <div>
                <CardTitle className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[-0.05em] leading-[0.9] uppercase">
                  <span className="bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">Establish</span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Legacy</span>
                </CardTitle>
                <CardDescription className="mt-4 sm:mt-6 text-white/20 font-bold uppercase tracking-[0.4em] text-[8px] sm:text-[9px]">
                  Registry Protocol 0{step}.0
                </CardDescription>
              </div>
              
              {/* Progress indicator */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
                {[1, 2, 3, 4].map((s) => (
                  <div 
                    key={s}
                    className={cn(
                      "h-0.5 sm:h-1 transition-all duration-500 rounded-full",
                      s <= step ? "w-6 sm:w-8 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "w-1.5 sm:w-2 bg-white/5"
                    )}
                  />
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-6 sm:px-12 pb-8 sm:pb-12">
            {/* Step 1: Nation Name */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-3">
                  <Label htmlFor="nationName" className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Nation Name</Label>
                  <Input 
                    id="nationName"
                    placeholder="e.g. United Republic of Atlas"
                    value={nationName}
                    onChange={(e) => setNationName(e.target.value)}
                    className="text-xl h-16 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-2xl focus:ring-blue-500/40 focus:border-blue-500/40 transition-all px-6 font-bold"
                    autoFocus
                  />
                  <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest ml-1">
                    Enter the formal name of your sovereign state
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="motto" className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">National Motto</Label>
                  <Input 
                    id="motto"
                    placeholder="Unity through Strength..."
                    value={motto}
                    onChange={(e) => setMotto(e.target.value)}
                    className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-2xl focus:ring-blue-500/40 focus:border-blue-500/40 transition-all px-6 font-medium"
                  />
                </div>
              </div>
            )}
            
            {/* Step 2: Government Type */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {GOVERNMENT_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setGovernmentType(type)}
                      className={cn(
                        "p-6 rounded-[1.5rem] border text-left transition-all duration-300 group relative overflow-hidden",
                        governmentType === type 
                          ? "border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]" 
                          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                      )}
                    >
                      {governmentType === type && (
                        <motion.div 
                          layoutId="active-gov"
                          className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"
                        />
                      )}
                      <div className="relative flex items-center justify-between">
                        <span className={cn(
                          "text-sm font-bold tracking-tight transition-colors",
                          governmentType === type ? "text-blue-400" : "text-white/60 group-hover:text-white"
                        )}>
                          {type}
                        </span>
                        {governmentType === type && <Sparkles className="h-4 w-4 text-blue-400" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Step 3: Game Mode */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={() => setGameMode("Eternal")}
                    className={cn(
                      "flex items-start gap-6 p-6 rounded-[2rem] border text-left transition-all duration-300 group",
                      gameMode === "Eternal"
                        ? "bg-blue-500/10 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    )}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all",
                      gameMode === "Eternal" ? "bg-blue-600 text-white shadow-lg" : "bg-white/5 text-white/20"
                    )}>
                      <Sparkles className="h-7 w-7" />
                    </div>
                    <div className="space-y-2">
                      <h4 className={cn(
                        "text-xl font-black tracking-tight transition-colors",
                        gameMode === "Eternal" ? "text-white" : "text-white/40"
                      )}>Eternal Empire</h4>
                      <p className="text-sm text-white/40 font-medium leading-relaxed">
                        Start in the modern era with advanced technology. Focus on pure policy and global dominance.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setGameMode("Eras")}
                    className={cn(
                      "flex items-start gap-6 p-6 rounded-[2rem] border text-left transition-all duration-300 group",
                      gameMode === "Eras"
                        ? "bg-amber-500/10 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.1)]"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    )}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all",
                      gameMode === "Eras" ? "bg-amber-500 text-white shadow-lg" : "bg-white/5 text-white/20"
                    )}>
                      <HistoryIcon className="h-7 w-7" />
                    </div>
                    <div className="space-y-2">
                      <h4 className={cn(
                        "text-xl font-black tracking-tight transition-colors",
                        gameMode === "Eras" ? "text-white" : "text-white/40"
                      )}>Eras</h4>
                      <p className="text-sm text-white/40 font-medium leading-relaxed">
                        Start in the Stone Age and guide your people through history. Unlock new eras through tech.
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 4: Flag & Finalize */}
            {step === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="capitalName" className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Capital City</Label>
                    <Input
                      id="capitalName"
                      placeholder={`${nationName || "Nation"} City`}
                      value={capitalName}
                      onChange={(e) => setCapitalName(e.target.value)}
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-2xl focus:ring-blue-500/40 focus:border-blue-500/40 transition-all px-4 font-medium"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="leaderName" className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Leader Title</Label>
                    <Input
                      id="leaderName"
                      placeholder="The People"
                      value={leaderName}
                      onChange={(e) => setLeaderName(e.target.value)}
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-2xl focus:ring-blue-500/40 focus:border-blue-500/40 transition-all px-4 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="customFlag" className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Custom Icon (Optional)</Label>
                  <Input
                    id="customFlag"
                    placeholder="Use any emoji or symbol"
                    value={customFlag}
                    onChange={(e) => setCustomFlag(Array.from(e.target.value).slice(0, 2).join(""))}
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-2xl focus:ring-blue-500/40 focus:border-blue-500/40 transition-all px-4 font-medium"
                  />
                  <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest ml-1">
                    If filled, this overrides the preset icon palette.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  {flagEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedFlag(emoji)}
                      className={cn(
                        "w-14 h-14 rounded-2xl text-2xl transition-all duration-300 flex items-center justify-center",
                        selectedFlag === emoji 
                          ? "bg-blue-600 border border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-110" 
                          : "bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-105"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                
                {/* Preview Card */}
                <div className="relative p-8 rounded-[2rem] bg-gradient-to-br from-blue-600/20 to-purple-600/10 border border-white/10 overflow-hidden shadow-inner">
                  <div className="absolute top-0 right-0 p-4">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px] font-black tracking-[0.2em] px-3">READY FOR RATIFICATION</Badge>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-white/10 border border-white/20 flex items-center justify-center shadow-2xl backdrop-blur-md">
                      <span className="text-4xl">{effectiveFlag}</span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black text-white tracking-tighter leading-none">{nationName || "Unnamed Nation"}</h3>
                      <p className="text-sm font-bold text-blue-400 uppercase tracking-widest">{governmentType || "Undefined Government"}</p>
                      <p className="text-xs text-white/35 font-semibold uppercase tracking-[0.15em]">
                        Capital: {capitalName.trim() || `${nationName || "Nation"} City`}
                      </p>
                      <p className="text-xs text-white/35 font-semibold uppercase tracking-[0.15em]">
                        Leader: {leaderName.trim() || "The People"}
                      </p>
                      {motto && (
                        <p className="text-sm text-white/40 font-medium mt-2">
                          &ldquo;{motto}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/5">
              <Button 
                variant="ghost" 
                onClick={handleBack}
                disabled={step === 1 || isLoading}
                className="h-12 px-6 rounded-full text-white/40 hover:text-white hover:bg-white/5 font-bold transition-all"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              
              {step < 4 ? (
                <Button 
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="h-12 px-8 rounded-full bg-white text-black hover:bg-white/90 font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10"
                >
                  Continue
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleCreate}
                  disabled={isLoading || !canProceed()}
                  className="h-12 px-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ratifying...
                    </>
                  ) : (
                    <>
                      <Flag className="mr-2 h-4 w-4" />
                      Commence Mandate
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
