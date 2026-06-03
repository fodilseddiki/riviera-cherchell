'use client'
// components/layout/AppLayout.tsx
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import { createClient } from '@/lib/supabase/client'
import type { RoleUtilisateur } from '@/types'

interface AppLayoutProps {
  children: React.ReactNode
  role: RoleUtilisateur
  nom: string
  prenom: string
}

export default function AppLayout({ children, role, nom, prenom }: AppLayoutProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} nom={nom} prenom={prenom} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto bg-sand-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
