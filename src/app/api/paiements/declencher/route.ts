// app/api/paiements/declencher/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { phase } = await req.json()

  // Passer tous les appels "a_venir" de cette phase à "appele"
  const { data, error } = await supabase
    .from('appels_paiement')
    .update({ statut: 'appele' })
    .eq('phase', phase)
    .eq('statut', 'a_venir')
    .select('*, contrat:contrats(*, acheteur:acheteurs(*))')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, declenches: data?.length ?? 0 })
}
