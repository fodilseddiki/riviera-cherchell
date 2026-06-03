// app/api/paiements/marquer-paye/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: profil } = await supabase.from('profils').select('role').eq('id', user.id).single()
  if (!['directeur','comptable'].includes(profil?.role ?? ''))
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { appelId, date, mode, reference } = await req.json()
  const { error } = await supabase.from('appels_paiement').update({
    statut: 'paye',
    date_paiement: date ?? new Date().toISOString().split('T')[0],
    mode_paiement: mode,
    reference_paiement: reference,
  }).eq('id', appelId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
