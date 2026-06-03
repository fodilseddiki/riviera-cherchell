// app/api/chantier/update-phase/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: profil } = await supabase.from('profils').select('role').eq('id', user.id).single()
  if (!['directeur','responsable_chantier'].includes(profil?.role ?? ''))
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { id, avancement_pct, statut, date_debut_reelle, date_fin_reelle } = await req.json()

  const { error } = await supabase.from('phases_construction').update({
    avancement_pct,
    statut,
    date_debut_reelle: date_debut_reelle || null,
    date_fin_reelle: date_fin_reelle || null,
    mis_a_jour_par: user.id,
    mis_a_jour_le: new Date().toISOString(),
  }).eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
