// app/ventes/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import VentesClient from './VentesClient'
import type { RoleUtilisateur } from '@/types'

export default async function VentesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profil } = await supabase.from('profils').select('*').eq('id', user.id).single()
  if (!profil) redirect('/auth/login')

  const { data: unites } = await supabase
    .from('unites').select('*').order('reference')

  return (
    <AppLayout role={profil.role as RoleUtilisateur} nom={profil.nom} prenom={profil.prenom}>
      <VentesClient unites={unites ?? []} role={profil.role} />
    </AppLayout>
  )
}
