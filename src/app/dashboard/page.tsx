'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [profil, setProfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('profils').select('*').eq('id', user.id).single()
      setProfil(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div style={{padding:'40px',fontFamily:'sans-serif'}}>Chargement...</div>

  return (
    <div style={{fontFamily:'sans-serif',padding:'40px',maxWidth:'800px',margin:'0 auto'}}>
      <h1>Riviera Cherchell ✅</h1>
      <p>Connecté en tant que : <strong>{profil?.prenom} {profil?.nom}</strong></p>
      <p>Rôle : <strong>{profil?.role}</strong></p>
      <button onClick={async()=>{await supabase.auth.signOut();router.push('/auth/login')}}>
        Se déconnecter
      </button>
    </div>
  )
}
