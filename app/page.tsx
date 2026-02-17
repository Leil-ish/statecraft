"use client"

import { useState } from "react"
import { NationCreation } from "@/components/game/nation-creation"
import { GameDashboard } from "@/components/game/game-dashboard"
import { LandingPage } from "@/components/game/landing-page"
import { SlotSelector } from "@/components/game/slot-selector"
import { Button } from "@/components/ui/button"
import { AuthModal } from "@/components/auth/auth-modal"
import { useGame } from "@/hooks/use-game"
import { useSession } from "next-auth/react"

export default function Home() {
  const { data: session } = useSession()
  const [view, setView] = useState<"landing" | "slots" | "creation" | "game">("landing")
  
  const { 
    nation, 
    currentIssue, 
    isLoading, 
    recentChanges,
    sessionBriefing,
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
    dismissBriefing,
  } = useGame()

  const handleStart = () => {
    setView("slots")
  }

  const handleSelectSlot = (slot: number) => {
    selectSlot(slot)
    if (slots[slot - 1]) {
      setView("game")
    } else {
      setView("creation")
    }
  }

  const handleNewEmpire = async () => {
    setView("slots")
  }

  const handleResetProgress = async () => {
    if (activeSlot) {
      await deleteSlot(activeSlot)
    }
    setView("landing")
  }

  // Show landing page
  if (view === "landing" && !nation) {
    return <LandingPage onStart={handleStart} />
  }

  // Show slot selection
  if (view === "slots") {
    if (!session?.user) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 space-y-10">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold tracking-tighter text-white uppercase">Secure Registry Access</h1>
            <p className="text-white/40 max-w-md mx-auto font-medium">
              Saved games are account-bound. Sign in to access your national archives.
            </p>
          </div>
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
            <AuthModal />
          </div>
          <Button
            variant="outline"
            onClick={() => setView("creation")}
            className="border-white/10 text-white/60 hover:text-white hover:bg-white/10"
          >
            Continue as Guest (No Saves)
          </Button>
          <Button
            variant="ghost"
            onClick={() => setView("landing")}
            className="text-white/20 hover:text-white font-bold uppercase tracking-widest text-[10px]"
          >
            Return to Main Menu
          </Button>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tighter text-white uppercase">National Registry</h1>
          <p className="text-white/40 max-w-md mx-auto font-medium">Access your administrative archives or initialize a new sequence of governance.</p>
        </div>
        <SlotSelector 
          slots={slots} 
          onSelect={handleSelectSlot}
          onDelete={deleteSlot}
          isLoading={isLoading}
        />
        <Button 
          variant="ghost" 
          onClick={() => setView("landing")}
          className="text-white/20 hover:text-white font-bold uppercase tracking-widest text-[10px]"
        >
          Return to Main Menu
        </Button>
      </div>
    )
  }

  // Show nation creation
  if (view === "creation") {
    return (
      <NationCreation 
        onCreateNation={(n) => {
          createNation(n)
          setView("game")
        }} 
        isLoading={isLoading} 
      />
    )
  }

  // Show game dashboard
  if (nation || view === "game") {
    if (!nation) return null // Wait for nation to load from slot
    
    return (
      <GameDashboard
        nation={nation}
        currentIssue={currentIssue}
        onSelectOption={selectOption}
        onGenerateIssue={generateIssue}
        isLoading={isLoading}
        recentChanges={recentChanges}
        sessionBriefing={sessionBriefing}
        onDismissBriefing={dismissBriefing}
        decisionHistory={history}
        mapCrises={mapCrises}
        onNewEmpire={handleNewEmpire}
        onResetProgress={handleResetProgress}
        onMapCrisis={handleMapCrisis}
        onCustomResponse={handleCustomResponse}
        isCrisisModalOpen={isCrisisModalOpen}
        setIsCrisisModalOpen={setIsCrisisModalOpen}
      />
    )
  }

  return <LandingPage onStart={handleStart} />
}
