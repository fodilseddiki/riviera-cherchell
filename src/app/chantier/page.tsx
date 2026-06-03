// app/chantier/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import ChantierClient from './ChantierClient'
import type { RoleUtilisateur } from '@/types'

export default async function ChantierPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profil } = await supabase.from('profils').select('*').eq('id', user.id).single()
  if (!profil) redirect('/auth/login')

  if (!['directeur','responsable_chantier'].includes(profil.role)) redirect('/dashboard')

  const { data: phases } = await supabase
    .from('phases_construction').select('*').order('numero')

  return (
    <AppLayout role={profil.role as RoleUtilisateur} nom={profil.nom} prenom={profil.prenom}>
      <ChantierClient phases={phases ?? []} role={profil.role} />
    </AppLayout>
  )
}
