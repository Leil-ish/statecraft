"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Mail, Lock, User, ArrowRight } from "lucide-react"

export function AuthModal() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (isLogin) {
      await signIn("credentials", {
        email,
        password,
        callbackUrl: "/",
      })
    } else {
      // Register logic would go to a separate API route
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })
      if (res.ok) {
        setIsLogin(true)
      }
    }
    setIsLoading(false)
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/20 flex items-center justify-center mb-2">
          <Shield className="h-6 w-6 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          {isLogin ? "Welcome Back" : "Establish Identity"}
        </h2>
        <p className="text-sm text-white/40 max-w-[240px]">
          {isLogin 
            ? "Access your national telemetry and secure link." 
            : "Register your administrative credentials."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Identity Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-white/20" />
              <Input 
                id="name" 
                placeholder="Full Name" 
                className="pl-10 h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500/50"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Comm-Link Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-white/20" />
            <Input 
              id="email" 
              type="email" 
              placeholder="name@agency.gov" 
              className="pl-10 h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Access Key</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-white/20" />
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              className="pl-10 h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500/50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-500/20"
        >
          {isLoading ? "Processing..." : (
            <span className="flex items-center gap-2">
              {isLogin ? "Authenticate" : "Register Credentials"}
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>

      <div className="pt-4 text-center">
        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="text-xs font-bold text-white/30 hover:text-white transition-colors uppercase tracking-widest"
        >
          {isLogin ? "Need new credentials?" : "Already have identity?"}
        </button>
      </div>
    </div>
  )
}
