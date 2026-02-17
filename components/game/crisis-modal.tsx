"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronRight, 
  Send, 
  ShieldAlert, 
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Issue, IssueOption } from "@/lib/game-types"

interface CrisisModalProps {
  issue: Issue | null
  isOpen: boolean
  onClose: () => void
  onSelectOption: (option: IssueOption) => void
  onCustomResponse: (text: string) => void
  isLoading?: boolean
}

export function CrisisModal({ 
  issue, 
  isOpen, 
  onClose, 
  onSelectOption, 
  onCustomResponse,
  isLoading = false 
}: CrisisModalProps) {
  const [customResponse, setCustomResponse] = useState("")
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false)

  if (!issue) return null

  const formatEffect = (value: number, key: string) => {
    const prefix = value > 0 ? "+" : ""
    return `${prefix}${value} ${key}`
  }

  const handleCustomSubmit = async () => {
    if (!customResponse.trim() || isLoading) return
    setIsSubmittingCustom(true)
    await onCustomResponse(customResponse)
    setCustomResponse("")
    setIsSubmittingCustom(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!flex !flex-col w-[calc(100vw-1rem)] sm:w-full sm:max-w-[600px] max-h-[92vh] bg-black/90 border-white/10 backdrop-blur-2xl text-white rounded-[32px] overflow-hidden p-0 gap-0">
        {/* Header Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 shrink-0" />
        
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-red-500/60 uppercase tracking-[0.2em]">Priority Alpha</span>
                  <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Emergency Directive</span>
                </div>
              </div>
              <Badge variant="outline" className="rounded-full border-red-500/20 text-red-500 text-[10px] font-bold tracking-widest px-3 py-1 bg-red-500/5">
                CRISIS ACTIVE
              </Badge>
            </div>
            
            <DialogTitle className="text-2xl font-bold tracking-tight leading-tight text-left">
              {issue.title}
            </DialogTitle>
            
            <DialogDescription className="text-white/60 leading-relaxed text-sm font-medium text-left">
              {issue.description}
            </DialogDescription>
            {issue.metadata && (
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest">
                <Badge variant="outline" className="border-white/10 text-white/50">{issue.metadata.source || "system"}</Badge>
                {issue.metadata.severity && <Badge variant="outline" className="border-red-500/20 text-red-300">{issue.metadata.severity}</Badge>}
                {issue.metadata.crisisType && <Badge variant="outline" className="border-white/10 text-white/50">{issue.metadata.crisisType}</Badge>}
                {typeof issue.metadata.stage === "number" && <Badge variant="outline" className="border-amber-400/30 text-amber-300">{`stage ${issue.metadata.stage}`}</Badge>}
              </div>
            )}
          </DialogHeader>

          <div className="space-y-6">
            {/* Predefined Options */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] px-1">Response Paths</h3>
              <div className="max-h-[38vh] overflow-y-auto overscroll-contain pr-1 space-y-3">
                {issue.options.map((option, index) => (
                  <motion.button
                    key={option.id}
                    onClick={() => onSelectOption(option)}
                    disabled={isLoading}
                    className={cn(
                      "w-full p-4 rounded-2xl text-left transition-all relative group overflow-hidden",
                      "bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20",
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-white/40 border border-white/10">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                          {option.text}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-red-400 transition-colors" />
                    </div>
                    <div className="relative mt-3 flex flex-wrap gap-1.5">
                      {Object.entries(option.effects).slice(0, 4).map(([key, value]) => (
                        <span
                          key={`${option.id}-${key}`}
                          className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 bg-black/30 text-white/60"
                        >
                          {formatEffect(value as number, key)}
                        </span>
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Custom Response Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Custom Directive</h3>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-purple-400" />
                  <span className="text-[10px] font-bold text-purple-400/60 uppercase tracking-widest">AI Interpreter</span>
                </div>
              </div>
              
              <div className="relative group">
                <textarea
                  value={customResponse}
                  onChange={(e) => setCustomResponse(e.target.value)}
                  placeholder="Write a specific order..."
                  className={cn(
                    "w-full h-24 p-4 rounded-2xl bg-white/5 border border-white/5 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all outline-none text-sm font-medium resize-none placeholder:text-white/20",
                    isLoading && "opacity-50 pointer-events-none"
                  )}
                />
                <Button
                  onClick={handleCustomSubmit}
                  disabled={!customResponse.trim() || isLoading || isSubmittingCustom}
                  className={cn(
                    "absolute bottom-3 right-3 h-8 px-3 rounded-lg bg-white text-black hover:bg-white/90 transition-all",
                    !customResponse.trim() && "opacity-0 scale-90"
                  )}
                >
                  {isSubmittingCustom ? (
                    <Zap className="h-4 w-4 animate-spin" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Execute</span>
                      <Send className="h-3.5 w-3.5" />
                    </div>
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-white/20 italic px-1">
                Note: Custom directives are interpreted for plausible geopolitical effects.
              </p>
            </div>
          </div>
        </div>

        <div className="shrink-0 px-4 sm:px-8 py-4 bg-red-500/5 border-t border-red-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest">Crisis Window Open</span>
          </div>
          <button 
            onClick={onClose}
            className="text-[10px] font-bold text-white/20 hover:text-white/40 uppercase tracking-widest transition-colors"
          >
            Defer to Council
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  )
}
