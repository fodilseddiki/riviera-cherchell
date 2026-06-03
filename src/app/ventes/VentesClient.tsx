'use client'
// app/ventes/VentesClient.tsx
import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { cn, formatMontantEur, statutUniteCouleur } from '@/lib/utils'
import { LABELS_STATUT_UNITE, COULEURS_STATUT_UNITE } from '@/types'
import type { Unite, StatutUnite, TypeUnite } from '@/types'

interface Props { unites: Unite[]; role: string }

export default function VentesClient({ unites, role }: Props) {
  const [search, setSearch] = useState('')
  const [statutF, setstatutF] = useState<string>('tous')
  const [typeF, setTypeF] = useState<string>('tous')
  const [zoneF, setZoneF] = useState<string>('tous')
  const [selected, setSelected] = useState<Unite | null>(null)

  const zones = [...new Set(unites.map(u => u.zone))].sort()
  const types = [...new Set(unites.map(u => u.type))]

  const filtered = useMemo(() => unites.filter(u =>
    (statutF === 'tous' || u.statut === statutF) &&
    (typeF === 'tous' || u.type === typeF) &&
    (zoneF === 'tous' || u.zone === zoneF) &&
    (search === '' || u.reference.toLowerCase().includes(search.toLowerCase()))
  ), [unites, statutF, typeF, zoneF, search])

  const stats = useMemo(() => ({
    vendu: unites.filter(u => u.statut === 'vendu').length,
    reserve: unites.filter(u => u.statut === 'reserve').length,
    disponible: unites.filter(u => u.statut === 'disponible').length,
  }), [unites])

  const canEdit = role === 'directeur' || role === 'agent_commercial'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-rc-800">Ventes & unités</h1>
        <p className="text-rc-500 text-sm mt-1">Carte des 103 logements du programme</p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-4">
        {(['vendu','reserve','disponible'] as StatutUnite[]).map(s => (
          <button
            key={s}
            onClick={() => setStatutF(statutF === s ? 'tous' : s)}
            className={cn('stat-card text-left transition-all', statutF === s && 'ring-2 ring-rc-400')}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: COULEURS_STATUT_UNITE[s] }} />
              <span className="stat-label">{LABELS_STATUT_UNITE[s]}</span>
            </div>
            <div className="stat-value">{stats[s]}</div>
          </button>
        ))}
      </div>

      {/* Filtres */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-40">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-rc-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une référence…"
            className="input pl-8"
          />
        </div>
        <select value={statutF} onChange={e => setStatutF(e.target.value)} className="input w-auto">
          <option value="tous">Tous les statuts</option>
          <option value="disponible">Disponible</option>
          <option value="reserve">Réservé</option>
          <option value="vendu">Vendu</option>
        </select>
        <select value={typeF} onChange={e => setTypeF(e.target.value)} className="input w-auto">
          <option value="tous">Tous les types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={zoneF} onChange={e => setZoneF(e.target.value)} className="input w-auto">
          <option value="tous">Toutes les zones</option>
          {zones.map(z => <option key={z} value={z}>{z}</option>)}
        </select>
        <span className="text-xs text-rc-400">{filtered.length} unités</span>
      </div>

      <div className="flex gap-6">
        {/* Grille unités */}
        <div className="card p-6 flex-1">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(52px,1fr))] gap-2">
            {filtered.map(u => (
              <button
                key={u.id}
                onClick={() => setSelected(selected?.id === u.id ? null : u)}
                title={u.reference}
                className={cn(
                  'aspect-square rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-0.5 border-2 transition-all duration-150 hover:scale-110',
                  selected?.id === u.id ? 'border-rc-600 scale-110 shadow-lg' : 'border-transparent',
                  u.statut === 'vendu' ? 'text-rc-800' : u.statut === 'reserve' ? 'text-amber-800' : 'text-blue-800'
                )}
                style={{ background: COULEURS_STATUT_UNITE[u.statut] + (selected?.id === u.id ? '' : '99') }}
              >
                <span style={{ fontSize: '10px' }}>{u.reference.replace('RC-','')}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-10 text-rc-400 text-sm">
                Aucune unité ne correspond aux filtres
              </div>
            )}
          </div>
          {/* Légende */}
          <div className="flex gap-4 mt-5 pt-4 border-t border-sand-100">
            {(['vendu','reserve','disponible'] as StatutUnite[]).map(s => (
              <div key={s} className="flex items-center gap-2 text-xs text-rc-500">
                <div className="w-3 h-3 rounded" style={{ background: COULEURS_STATUT_UNITE[s] }} />
                {LABELS_STATUT_UNITE[s]}
              </div>
            ))}
          </div>
        </div>

        {/* Détail unité sélectionnée */}
        {selected && (
          <div className="card p-6 w-72 shrink-0 self-start sticky top-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-display text-lg font-bold text-rc-800">{selected.reference}</div>
                <div className="text-sm text-rc-500">{selected.type} · {selected.zone}</div>
              </div>
              <span className={cn('badge', statutUniteCouleur(selected.statut))}>
                {LABELS_STATUT_UNITE[selected.statut]}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-sand-100">
                <span className="text-rc-500">Prix</span>
                <span className="font-medium text-rc-800">{formatMontantEur(selected.prix)}</span>
              </div>
              {selected.superficie_m2 && (
                <div className="flex justify-between py-1.5 border-b border-sand-100">
                  <span className="text-rc-500">Superficie</span>
                  <span className="font-medium">{selected.superficie_m2} m²</span>
                </div>
              )}
              {selected.nb_chambres && (
                <div className="flex justify-between py-1.5 border-b border-sand-100">
                  <span className="text-rc-500">Chambres</span>
                  <span className="font-medium">{selected.nb_chambres}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-sand-100">
                <span className="text-rc-500">Étage</span>
                <span className="font-medium">{selected.etage === 0 ? 'RDC' : `Étage ${selected.etage}`}</span>
              </div>
            </div>
            {canEdit && selected.statut === 'disponible' && (
              <a href={`/contrats/nouveau?unite=${selected.id}`} className="btn-primary block text-center mt-4 text-sm">
                Créer une réservation
              </a>
            )}
            {canEdit && selected.statut !== 'disponible' && (
              <a href={`/contrats?unite=${selected.id}`} className="btn-secondary block text-center mt-4 text-sm">
                Voir le contrat
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
