'use client'
// app/client/EspaceClientView.tsx
import { cn, formatMontantEur, formatDate, statutPaiementCouleur } from '@/lib/utils'
import { LABELS_STATUT_PAIEMENT } from '@/types'
import { CheckCircle2, Clock, Circle, Home, CreditCard } from 'lucide-react'
import type { Acheteur, Contrat, PhaseConstruction, AppelPaiement } from '@/types'

interface Props {
  acheteur: Acheteur | null
  contrats: Contrat[]
  phases: PhaseConstruction[]
}

export default function EspaceClientView({ acheteur, contrats, phases }: Props) {
  if (!acheteur || contrats.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-80">
        <div className="text-center">
          <Home size={40} className="text-rc-300 mx-auto mb-3" />
          <p className="text-rc-500">Aucun contrat associé à votre compte.</p>
          <p className="text-rc-400 text-sm mt-1">Contactez notre service commercial.</p>
        </div>
      </div>
    )
  }

  const avancementGlobal = Math.round(phases.reduce((s, p) => s + p.avancement_pct, 0) / phases.length)

  return (
    <div className="space-y-8">
      {/* Bienvenue */}
      <div className="bg-rc-900 rounded-xl2 p-8 text-white">
        <div className="font-display text-2xl font-bold mb-1">
          Bienvenue, {acheteur.prenom} {acheteur.nom}
        </div>
        <p className="text-rc-300 text-sm">Suivi de votre acquisition — Résidence Riviera Cherchell</p>
        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 h-3 bg-rc-800 rounded-full overflow-hidden">
            <div className="h-full bg-sand-400 rounded-full transition-all" style={{ width: `${avancementGlobal}%` }} />
          </div>
          <span className="text-sand-400 font-bold text-lg">{avancementGlobal}%</span>
        </div>
        <div className="text-rc-400 text-xs mt-1">Avancement global de la construction</div>
      </div>

      {contrats.map(contrat => {
        const unite = contrat.unite as any
        const appels = (contrat.appels_paiement ?? []) as AppelPaiement[]
        const totalPaye = appels.filter(a => a.statut === 'paye').reduce((s, a) => s + a.montant, 0)
        const payePct = Math.round((totalPaye / contrat.prix_total) * 100)

        return (
          <div key={contrat.id} className="space-y-6">
            {/* Info logement */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-rc-800 mb-4 flex items-center gap-2">
                <Home size={18} className="text-rc-400" />
                Votre logement
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><div className="text-xs text-rc-400 mb-1">Référence</div><div className="font-bold text-rc-700">{unite?.reference}</div></div>
                <div><div className="text-xs text-rc-400 mb-1">Type</div><div className="font-medium">{unite?.type}</div></div>
                <div><div className="text-xs text-rc-400 mb-1">Zone</div><div className="font-medium">{unite?.zone}</div></div>
                <div><div className="text-xs text-rc-400 mb-1">Prix total</div><div className="font-bold text-rc-700">{formatMontantEur(contrat.prix_total)}</div></div>
              </div>
            </div>

            {/* Avancement chantier */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-rc-800 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-rc-400" /> Avancement des travaux
              </h2>
              <div className="space-y-4">
                {phases.map(p => (
                  <div key={p.id} className="flex items-start gap-4">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                      p.statut === 'termine' ? 'bg-rc-400 text-white' :
                      p.statut === 'en_cours' ? 'bg-blue-100 text-blue-600' : 'bg-sand-100 text-sand-400'
                    )}>
                      {p.statut === 'termine' ? <CheckCircle2 size={16} /> : p.statut === 'en_cours' ? <Clock size={16} /> : <Circle size={16} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-rc-700">{p.nom}</span>
                        <span className="text-sm font-bold text-rc-600">{p.avancement_pct}%</span>
                      </div>
                      <div className="h-1.5 bg-sand-100 rounded-full mt-1.5">
                        <div className="h-full bg-rc-400 rounded-full" style={{ width: `${p.avancement_pct}%` }} />
                      </div>
                      <div className="text-xs text-rc-400 mt-1">{formatDate(p.date_debut_prevue)} → {formatDate(p.date_fin_prevue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Échéancier paiements */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-rc-800 flex items-center gap-2">
                  <CreditCard size={18} className="text-rc-400" /> Votre échéancier
                </h2>
                <div className="text-right">
                  <div className="text-sm font-bold text-rc-700">{formatMontantEur(totalPaye)}</div>
                  <div className="text-xs text-rc-400">payé sur {formatMontantEur(contrat.prix_total)} ({payePct}%)</div>
                </div>
              </div>
              <div className="h-2 bg-sand-100 rounded-full mb-6">
                <div className="h-full bg-rc-400 rounded-full" style={{ width: `${payePct}%` }} />
              </div>
              <div className="space-y-3">
                {appels.sort((a, b) => a.numero_phase - b.numero_phase).map(a => (
                  <div key={a.id} className={cn(
                    'flex items-center gap-4 p-3 rounded-lg border',
                    a.statut === 'paye' ? 'bg-rc-50 border-rc-100' :
                    a.statut === 'en_retard' ? 'bg-red-50 border-red-100' :
                    a.statut === 'appele' ? 'bg-amber-50 border-amber-100' : 'bg-sand-50 border-sand-100'
                  )}>
                    <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-xs font-bold text-rc-600 shrink-0">
                      {a.numero_phase}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-rc-700">Phase {a.numero_phase} — {a.pourcentage}%</div>
                      {a.date_echeance && <div className="text-xs text-rc-400">Échéance : {formatDate(a.date_echeance)}</div>}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-rc-700 text-sm">{formatMontantEur(a.montant)}</div>
                      <span className={cn('badge text-xs', statutPaiementCouleur(a.statut))}>
                        {LABELS_STATUT_PAIEMENT[a.statut]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}

      {/* Contact */}
      <div className="card p-6 text-center bg-sand-50">
        <p className="text-sm text-rc-600 font-medium">Une question sur votre acquisition ?</p>
        <p className="text-rc-400 text-sm mt-1">📧 commercial@riviera-cherchell.dz · 📞 +213 XX XX XX XX</p>
      </div>
    </div>
  )
}
