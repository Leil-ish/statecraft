import { AuthModal } from "@/components/auth/auth-modal"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
        <AuthModal />
      </div>
    </div>
  )
}
