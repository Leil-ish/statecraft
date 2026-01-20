"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { 
  Globe, 
  Flag, 
  Sparkles, 
  ChevronRight,
  ArrowLeft,
  Loader2
} from "lucide-react"
import { GOVERNMENT_TYPES, type Nation, createDefaultNation } from "@/lib/game-types"

interface NationCreationProps {
  onCreateNation: (nation: Nation) => void
  isLoading?: boolean
}

const flagEmojis = ["🦅", "🦁", "🐉", "🌟", "🔥", "⚔️", "🌊", "🏔️", "🌲", "🎭", "👑", "🛡️"]

export function NationCreation({ onCreateNation, isLoading = false }: NationCreationProps) {
  const [step, setStep] = useState(1)
  const [nationName, setNationName] = useState("")
  const [governmentType, setGovernmentType] = useState<string>("")
  const [selectedFlag, setSelectedFlag] = useState("🦅")
  const [motto, setMotto] = useState("")
  
  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }
  
  const handleCreate = () => {
    const nation = createDefaultNation(nationName, governmentType)
    nation.flag = selectedFlag
    if (motto) nation.motto = motto
    onCreateNation(nation)
  }
  
  const canProceed = () => {
    if (step === 1) return nationName.trim().length >= 3
    if (step === 2) return governmentType !== ""
    return true
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-border bg-card overflow-hidden">
        {/* Header */}
        <CardHeader className="text-center pb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="relative">
            <div className="mx-auto w-14 h-14 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl md:text-3xl text-foreground font-serif tracking-tight">
              Establish Your Nation
            </CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
              Begin your journey in governance and policy-making
            </CardDescription>
            
            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    s === step 
                      ? "w-8 bg-primary" 
                      : s < step 
                        ? "w-2 bg-primary/50" 
                        : "w-2 bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-8">
          {/* Step 1: Nation Name */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-foreground font-serif mb-1">
                  Identity
                </h3>
                <p className="text-sm text-muted-foreground">
                  Define your nation&apos;s name and founding principles
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nationName">Nation Name</Label>
                <Input 
                  id="nationName"
                  placeholder="The Republic of..."
                  value={nationName}
                  onChange={(e) => setNationName(e.target.value)}
                  className="text-lg h-12 bg-input border-border"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 3 characters required
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="motto">National Motto (optional)</Label>
                <Input 
                  id="motto"
                  placeholder="Unity, Progress, Prosperity..."
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  className="bg-input border-border"
                />
              </div>
            </div>
          )}
          
          {/* Step 2: Government Type */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-foreground font-serif mb-1">
                  Governance Structure
                </h3>
                <p className="text-sm text-muted-foreground">
                  Select your nation&apos;s political framework
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GOVERNMENT_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setGovernmentType(type)}
                    className={cn(
                      "p-4 rounded-lg border text-left transition-all duration-200",
                      "hover:border-primary/50 hover:bg-primary/5",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50",
                      governmentType === type 
                        ? "border-primary bg-primary/10" 
                        : "border-border bg-secondary/30"
                    )}
                  >
                    <span className="text-sm font-medium text-foreground">{type}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Step 3: Flag & Finalize */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-foreground font-serif mb-1">
                  National Symbol
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose an emblem to represent your nation
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-2">
                {flagEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedFlag(emoji)}
                    className={cn(
                      "w-12 h-12 rounded-lg text-xl transition-all duration-150",
                      "hover:bg-primary/10 focus:outline-none focus:ring-1 focus:ring-primary/40",
                      selectedFlag === emoji 
                        ? "bg-primary/15 border border-primary/50" 
                        : "bg-secondary/30 border border-border"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              
              {/* Preview */}
              <div className="mt-8 p-5 rounded-lg bg-secondary/20 border border-border">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
                  Preview
                </h4>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-primary/10 border border-border flex items-center justify-center">
                    <span className="text-2xl">{selectedFlag}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground font-serif">{nationName}</h3>
                    <p className="text-sm text-muted-foreground">{governmentType}</p>
                    {motto && (
                      <p className="text-xs text-muted-foreground italic mt-1">
                        &ldquo;{motto}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              disabled={step === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            {step < 3 ? (
              <Button 
                onClick={handleNext}
                disabled={!canProceed()}
                className="gap-2"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleCreate}
                disabled={isLoading || !canProceed()}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Establishing...
                  </>
                ) : (
                  <>
                    <Flag className="h-4 w-4" />
                    Establish Nation
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
