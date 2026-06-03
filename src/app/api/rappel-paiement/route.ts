// app/api/rappel-paiement/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { envoyerRappelPaiement } from '@/lib/email'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { appelId } = await req.json()

  const { data: appel } = await supabase
    .from('appels_paiement')
    .select(`*, contrat:contrats(*, unite:unites(*), acheteur:acheteurs(*))`)
    .eq('id', appelId)
    .single()

  if (!appel) return NextResponse.json({ error: 'Appel introuvable' }, { status: 404 })

  try {
    await envoyerRappelPaiement(
      appel,
      appel.contrat,
      appel.contrat.acheteur,
    )
    // Marquer rappel envoyé
    await supabase.from('appels_paiement').update({ rappel_envoye: true }).eq('id', appelId)
    await supabase.from('notifications').insert({
      appel_paiement_id: appelId,
      acheteur_id: appel.contrat.acheteur.id,
      type: 'rappel_paiement',
      sujet: `Rappel phase ${appel.numero_phase}`,
      statut: 'envoye',
    })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
