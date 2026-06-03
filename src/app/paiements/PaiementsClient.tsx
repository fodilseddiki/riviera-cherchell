'use client'
// app/paiements/PaiementsClient.tsx
import { useState, useMemo } from 'react'
import { Mail, CheckCircle, AlertCircle, Clock, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn, formatMontantEur, formatDateCourt, statutPaiementCouleur } from '@/lib/utils'
import { LABELS_STATUT_PAIEMENT, LABELS_PHASE_PAIEMENT } from '@/types'
import type { AppelPaiement } from '@/types'

const PHASES_CONFIG = [
  { phase: 'phase_1', label: 'P1 — Acompte réservation', pct: 10 },
  { phase: 'phase_2', label: 'P2 — Fondations',           pct: 20 },
  { phase: 'phase_3', label: 'P3 — Murs & toiture',       pct: 20 },
  { phase: 'phase_4', label: 'P4 — Finitions',             pct: 25 },
  { phase: 'phase_5', label: 'P5 — Livraison',             pct: 25 },
]

interface Props { appels: AppelPaiement[]; role: string }

export default function PaiementsClient({ appels, role }: Props) {
  const [phaseF, setPhaseF] = useState('tous')
  const [statutF, setStatutF] = useState('tous')
  const [search, setSearch] = useState('')
  const [sending, setSending] = useState<string | null>(null)

  const canEdit = role === 'directeur' || role === 'comptable'

  const filtered = useMemo(() => appels.filter(a =>
    (phaseF === 'tous' || a.phase === phaseF) &&
    (statutF === 'tous' || a.statut === statutF) &&
    (search === '' || (a.contrat as any)?.acheteur?.nom?.toLowerCase().includes(search.toLowerCase()) ||
      (a.contrat as any)?.numero?.toLowerCase().includes(search.toLowerCase()))
  ), [appels, phaseF, statutF, search])

  // Totaux par phase
  const totaux = useMemo(() => {
    return PHASES_CONFIG.map(p => {
      const phaseAppels = appels.filter(a => a.phase === p.phase)
      return {
        ...p,
        totalAttendu: phaseAppels.reduce((s, a) => s + a.montant, 0),
        totalEncaisse: phaseAppels.filter(a => a.statut === 'paye').reduce((s, a) => s + a.montant, 0),
        nb: phaseAppels.length,
        nbPayes: phaseAppels.filter(a => a.statut === 'paye').length,
      }
    })
  }, [appels])

  async function envoyerRappel(appelId: string, email: string) {
    setSending(appelId)
    try {
      const res = await fetch('/api/rappel-paiement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appelId }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Rappel envoyé à ${email}`)
    } catch {
      toast.error('Erreur lors de l\'envoi du rappel')
    } finally {
      setSending(null)
    }
  }

  async function marquerPaye(appelId: string) {
    const res = await fetch('/api/paiements/marquer-paye', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appelId, date: new Date().toISOString().split('T')[0] }),
    })
    if (res.ok) {
      toast.success('Paiement enregistré')
      window.location.reload()
    } else toast.error('Erreur')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-rc-800">Suivi des paiements</h1>
        <p className="text-rc-500 text-sm mt-1">5 phases liées à l'avancement du chantier</p>
      </div>

      {/* Récapitulatif par phase */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {totaux.map(t => (
          <button
            key={t.phase}
            onClick={() => setPhaseF(phaseF === t.phase ? 'tous' : t.phase)}
            className={cn('card p-4 text-left transition-all', phaseF === t.phase && 'ring-2 ring-rc-400')}
          >
            <div className="text-xs font-medium text-rc-500 mb-2">{t.label}</div>
            <div className="text-lg font-bold text-rc-800 font-display">{t.pct}%</div>
            <div className="h-1.5 bg-sand-100 rounded-full mt-2 mb-2">
              <div
                className="h-full bg-rc-400 rounded-full"
                style={{ width: t.totalAttendu > 0 ? `${Math.round(t.totalEncaisse / t.totalAttendu * 100)}%` : '0%' }}
              />
            </div>
            <div className="text-xs text-rc-400">{t.nbPayes}/{t.nb} payés</div>
          </button>
        ))}
      </div>

      {/* Filtres */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-40">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-rc-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Chercher acheteur ou contrat…" className="input pl-8" />
        </div>
        <select value={statutF} onChange={e => setStatutF(e.target.value)} className="input w-auto">
          <option value="tous">Tous les statuts</option>
          <option value="a_venir">À venir</option>
          <option value="appele">Appelé</option>
          <option value="en_attente">En attente</option>
          <option value="paye">Payé</option>
          <option value="en_retard">En retard</option>
        </select>
        <span className="text-xs text-rc-400">{filtered.length} appels</span>
      </div>

      {/* Tableau */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Acheteur</th>
              <th className="th">Contrat</th>
              <th className="th">Unité</th>
              <th className="th">Phase</th>
              <th className="th">Montant</th>
              <th className="th">Échéance</th>
              <th className="th">Statut</th>
              {canEdit && <th className="th">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => {
              const acheteur = (a.contrat as any)?.acheteur
              const unite = (a.contrat as any)?.unite
              return (
                <tr key={a.id} className="table-row">
                  <td className="td">
                    <div className="font-medium">{acheteur?.prenom} {acheteur?.nom}</div>
                    <div className="text-xs text-rc-400">{acheteur?.email}</div>
                  </td>
                  <td className="td text-rc-500">{(a.contrat as any)?.numero}</td>
                  <td className="td">
                    <div>{unite?.reference}</div>
                    <div className="text-xs text-rc-400">{unite?.type} · {unite?.zone}</div>
                  </td>
                  <td className="td">
                    <div className="text-xs font-medium">Phase {a.numero_phase}</div>
                    <div className="text-xs text-rc-400">{a.pourcentage}%</div>
                  </td>
                  <td className="td font-medium">{formatMontantEur(a.montant)}</td>
                  <td className="td text-rc-400">{formatDateCourt(a.date_echeance)}</td>
                  <td className="td">
                    <span className={cn('badge', statutPaiementCouleur(a.statut))}>
                      {LABELS_STATUT_PAIEMENT[a.statut]}
                    </span>
                  </td>
                  {canEdit && (
                    <td className="td">
                      <div className="flex gap-2">
                        {a.statut !== 'paye' && (
                          <>
                            <button
                              onClick={() => envoyerRappel(a.id, acheteur?.email)}
                              disabled={sending === a.id}
                              title="Envoyer un rappel email"
                              className="btn-ghost p-1.5 text-blue-500 hover:text-blue-700"
                            >
                              {sending === a.id
                                ? <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                : <Mail size={15} />}
                            </button>
                            <button
                              onClick={() => marquerPaye(a.id)}
                              title="Marquer comme payé"
                              className="btn-ghost p-1.5 text-rc-500 hover:text-rc-700"
                            >
                              <CheckCircle size={15} />
                            </button>
                          </>
                        )}
                        {a.statut === 'paye' && (
                          <span className="text-rc-400 text-xs flex items-center gap-1">
                            <CheckCircle size={13} /> {formatDateCourt(a.date_paiement)}
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="td text-center text-rc-400 py-10">Aucun appel de fonds trouvé</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
