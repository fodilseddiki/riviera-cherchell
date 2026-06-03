// app/client/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import EspaceClientView from './EspaceClientView'

export default async function EspaceClientPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profil } = await supabase.from('profils').select('*').eq('id', user.id).single()
  if (!profil) redirect('/auth/login')
  if (profil.role !== 'client') redirect('/dashboard')

  const { data: acheteur } = await supabase
    .from('acheteurs').select('*').eq('profil_id', user.id).single()

  const { data: contrats } = await supabase
    .from('contrats')
    .select(`*, unite:unites(*), appels_paiement(*)`)
    .eq('acheteur_id', acheteur?.id)

  const { data: phases } = await supabase
    .from('phases_construction').select('*').order('numero')

  return (
    <AppLayout role="client" nom={profil.nom} prenom={profil.prenom}>
      <EspaceClientView acheteur={acheteur} contrats={contrats ?? []} phases={phases ?? []} />
    </AppLayout>
  )
}
