'use client'
// app/chantier/ChantierClient.tsx
import { useState } from 'react'
import { CheckCircle2, Circle, Clock, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn, formatDate } from '@/lib/utils'
import type { PhaseConstruction } from '@/types'

const STATUT_LABELS: Record<string, string> = {
  planifie: 'Planifié', en_cours: 'En cours', termine: 'Terminé'
}
const STATUT_COLORS: Record<string, string> = {
  planifie: 'bg-gray-100 text-gray-600 border-gray-200',
  en_cours: 'bg-blue-50 text-blue-700 border-blue-200',
  termine:  'bg-rc-50 text-rc-700 border-rc-200',
}
const PHASE_PAIEMENT_LABELS: Record<string, string> = {
  phase_2: 'Déclenche appels Phase 2 (20%)',
  phase_3: 'Déclenche appels Phase 3 (20%)',
  phase_4: 'Déclenche appels Phase 4 (25%)',
  phase_5: 'Déclenche appels Phase 5 (25%)',
}

interface Props { phases: PhaseConstruction[]; role: string }

export default function ChantierClient({ phases: initialPhases, role }: Props) {
  const [phases, setPhases] = useState(initialPhases)
  const [saving, setSaving] = useState<string | null>(null)
  const canEdit = role === 'directeur' || role === 'responsable_chantier'

  function updatePhase(id: string, field: string, value: any) {
    setPhases(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  async function savePhase(phase: PhaseConstruction) {
    setSaving(phase.id)
    const res = await fetch('/api/chantier/update-phase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: phase.id,
        avancement_pct: phase.avancement_pct,
        statut: phase.statut,
        date_debut_reelle: phase.date_debut_reelle,
        date_fin_reelle: phase.date_fin_reelle,
      }),
    })
    setSaving(null)
    if (res.ok) {
      toast.success('Phase mise à jour')
      // Si terminée, déclencher les appels de fonds correspondants
      if (phase.statut === 'termine' && phase.phase_paiement_declenchee) {
        await fetch('/api/paiements/declencher', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phase: phase.phase_paiement_declenchee }),
        })
        toast.success(`Appels de fonds ${phase.phase_paiement_declenchee} déclenchés`)
      }
    } else {
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const avancementGlobal = Math.round(phases.reduce((s, p) => s + p.avancement_pct, 0) / phases.length)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-rc-800">Suivi du chantier</h1>
          <p className="text-rc-500 text-sm mt-1">5 phases de construction — avancement en temps réel</p>
        </div>
        <div className="card px-6 py-4 text-center">
          <div className="text-3xl font-display font-bold text-rc-700">{avancementGlobal}%</div>
          <div className="text-xs text-rc-400 mt-1">Avancement global</div>
          <div className="h-2 bg-sand-100 rounded-full mt-2 w-32">
            <div className="h-full bg-rc-400 rounded-full" style={{ width: `${avancementGlobal}%` }} />
          </div>
        </div>
      </div>

      {/* Timeline visuelle */}
      <div className="card p-6">
        <div className="relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-sand-200" />
          <div className="grid grid-cols-5 gap-2 relative">
            {phases.map((p, i) => (
              <div key={p.id} className="flex flex-col items-center gap-2">
                <div className={cn(
                  'w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 bg-white',
                  p.statut === 'termine' ? 'border-rc-400 bg-rc-400 text-white' :
                  p.statut === 'en_cours' ? 'border-blue-400' : 'border-sand-300'
                )}>
                  {p.statut === 'termine'
                    ? <CheckCircle2 size={20} className="text-white" />
                    : p.statut === 'en_cours'
                    ? <Clock size={18} className="text-blue-500" />
                    : <Circle size={18} className="text-sand-400" />}
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-rc-700">Phase {p.numero}</div>
                  <div className="text-xs font-bold text-rc-500">{p.avancement_pct}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cartes détail par phase */}
      <div className="space-y-4">
        {phases.map(phase => (
          <div key={phase.id} className={cn('card p-6 transition-all', phase.statut === 'en_cours' && 'border-blue-200 shadow-sm')}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg font-bold text-rc-800">{phase.nom}</span>
                  <span className={cn('badge', STATUT_COLORS[phase.statut])}>
                    {STATUT_LABELS[phase.statut]}
                  </span>
                </div>
                {phase.description && (
                  <p className="text-sm text-rc-500 mt-1">{phase.description}</p>
                )}
              </div>
              {phase.phase_paiement_declenchee && (
                <div className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-lg">
                  💰 {PHASE_PAIEMENT_LABELS[phase.phase_paiement_declenchee]}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
              <div>
                <div className="text-xs text-rc-400 mb-1">Début prévu</div>
                <div className="text-rc-700">{formatDate(phase.date_debut_prevue)}</div>
              </div>
              <div>
                <div className="text-xs text-rc-400 mb-1">Fin prévue</div>
                <div className="text-rc-700">{formatDate(phase.date_fin_prevue)}</div>
              </div>
              <div>
                <div className="text-xs text-rc-400 mb-1">Début réel</div>
                {canEdit ? (
                  <input type="date" value={phase.date_debut_reelle ?? ''} onChange={e => updatePhase(phase.id, 'date_debut_reelle', e.target.value)} className="input text-xs py-1" />
                ) : <div className="text-rc-700">{formatDate(phase.date_debut_reelle)}</div>}
              </div>
              <div>
                <div className="text-xs text-rc-400 mb-1">Fin réelle</div>
                {canEdit ? (
                  <input type="date" value={phase.date_fin_reelle ?? ''} onChange={e => updatePhase(phase.id, 'date_fin_reelle', e.target.value)} className="input text-xs py-1" />
                ) : <div className="text-rc-700">{formatDate(phase.date_fin_reelle)}</div>}
              </div>
            </div>

            {canEdit && (
              <div className="flex items-center gap-4 pt-4 border-t border-sand-100">
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-rc-500 mb-1">
                    <span>Avancement</span><span>{phase.avancement_pct}%</span>
                  </div>
                  <input
                    type="range" min="0" max="100" step="5"
                    value={phase.avancement_pct}
                    onChange={e => updatePhase(phase.id, 'avancement_pct', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <select
                  value={phase.statut}
                  onChange={e => updatePhase(phase.id, 'statut', e.target.value)}
                  className="input w-36"
                >
                  <option value="planifie">Planifié</option>
                  <option value="en_cours">En cours</option>
                  <option value="termine">Terminé</option>
                </select>
                <button
                  onClick={() => savePhase(phase)}
                  disabled={saving === phase.id}
                  className="btn-primary flex items-center gap-2"
                >
                  {saving === phase.id
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><Save size={14} /> Sauvegarder</>}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
