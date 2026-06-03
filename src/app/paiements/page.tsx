// app/paiements/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import PaiementsClient from './PaiementsClient'
import type { RoleUtilisateur } from '@/types'

export default async function PaiementsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profil } = await supabase.from('profils').select('*').eq('id', user.id).single()
  if (!profil) redirect('/auth/login')

  if (!['directeur','comptable','agent_commercial'].includes(profil.role)) redirect('/dashboard')

  const { data: appels } = await supabase
    .from('appels_paiement')
    .select(`
      *,
      contrat:contrats(
        numero, prix_total,
        unite:unites(reference, type, zone),
        acheteur:acheteurs(nom, prenom, email, telephone)
      )
    `)
    .order('date_echeance', { ascending: true })

  return (
    <AppLayout role={profil.role as RoleUtilisateur} nom={profil.nom} prenom={profil.prenom}>
      <PaiementsClient appels={appels ?? []} role={profil.role} />
    </AppLayout>
  )
}
