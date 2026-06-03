'use client'
// app/auth/login/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [mdp, setMdp] = useState('')
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: mdp })
    if (error) {
      toast.error('Email ou mot de passe incorrect')
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-rc-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-bold text-white">Riviera</h1>
          <h1 className="font-display text-3xl font-bold text-sand-400">Cherchell</h1>
          <p className="text-rc-400 text-sm mt-2">Gestion immobilière</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl2 p-8 shadow-2xl">
          <h2 className="font-display text-xl font-bold text-rc-800 mb-6">Connexion</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Adresse email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                placeholder="vous@exemple.com"
                required
              />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <input
                  type={visible ? 'text' : 'password'}
                  value={mdp}
                  onChange={e => setMdp(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setVisible(!visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-rc-400 hover:text-rc-600"
                >
                  {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><LogIn size={16} /> Se connecter</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-rc-500 text-xs mt-6">
          © {new Date().getFullYear()} Riviera Cherchell · Tous droits réservés
        </p>
      </div>
    </div>
  )
}
