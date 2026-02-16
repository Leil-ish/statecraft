"use client"

import { useState } from "react"
import { NationCreation } from "@/components/game/nation-creation"
import { GameDashboard } from "@/components/game/game-dashboard"
import { LandingPage } from "@/components/game/landing-page"
import { SlotSelector } from "@/components/game/slot-selector"
import { Button } from "@/components/ui/button"
import { useGame } from "@/hooks/use-game"

export default function Home() {
  const [isCreating, setIsCreating] = useState(false)
  const [view, setView] = useState<"landing" | "slots" | "creation" | "game">("landing")
  
  const { 
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
    deleteSlot
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
  if (view === "creation" || (!nation && isCreating)) {
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
