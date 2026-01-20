"use client"

import { NationCreation } from "@/components/game/nation-creation"
import { GameDashboard } from "@/components/game/game-dashboard"
import { useGame } from "@/hooks/use-game"

export default function Home() {
  const { 
    nation, 
    currentIssue, 
    isLoading, 
    recentChanges,
    history,
    createNation, 
    generateIssue, 
    selectOption 
  } = useGame()

  // Show nation creation if no nation exists
  if (!nation) {
    return (
      <NationCreation 
        onCreateNation={createNation} 
        isLoading={isLoading} 
      />
    )
  }

  // Show game dashboard
  return (
    <GameDashboard
      nation={nation}
      currentIssue={currentIssue}
      onSelectOption={selectOption}
      onGenerateIssue={generateIssue}
      isLoading={isLoading}
      recentChanges={recentChanges}
      history={history}
    />
  )
}
