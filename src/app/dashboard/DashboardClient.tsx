'use client'
// app/dashboard/DashboardClient.tsx
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { TrendingUp, AlertCircle, Clock, Home, Banknote, HardHat } from 'lucide-react'
import { formatMontantEur, formatDateCourt, statutPaiementCouleur } from '@/lib/utils'
import { LABELS_STATUT_PAIEMENT } from '@/types'
import type { DashboardStats, PhaseConstruction, Contrat, AppelPaiement } from '@/types'

const PHASES_LABELS = ['P1 Acompte','P2 Fondations','P3 Murs','P4 Finitions','P5 Livraison']
const PHASES_PCT = [10, 20, 20, 25, 25]

interface Props {
  stats: DashboardStats | null
  phases: PhaseConstruction[]
  contratsRecents: Contrat[]
  paiementsEnRetard: AppelPaiement[]
  role: string
}

export default function DashboardClient({ stats, phases, contratsRecents, paiementsEnRetard, role }: Props) {
  const s = stats ?? { total_unites:103, unites_vendues:0, unites_reservees:0, unites_disponibles:103, total_encaisse:0, total_en_attente:0, valeur_contrats_total:0 }

  const pieData = [
    { name: 'Vendues', value: s.unites_vendues, color: '#1D9E75' },
    { name: 'Réservées', value: s.unites_reservees, color: '#BA7517' },
    { name: 'Disponibles', value: s.unites_disponibles, color: '#B5D4F4' },
  ]

  const paiementsBar = PHASES_LABELS.map((label, i) => ({
    name: label,
    pct: PHASES_PCT[i],
  }))

  const ventesPct = Math.round(((s.unites_vendues + s.unites_reservees) / s.total_unites) * 100)
  const chantierAvg = phases.length
    ? Math.round(phases.reduce((a, p) => a + p.avancement_pct, 0) / phases.length)
    : 0

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease]">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-rc-800">Tableau de bord</h1>
        <p className="text-rc-500 text-sm mt-1">Résidence Riviera Cherchell — 103 unités</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2 text-rc-400">
            <Home size={15} /><span className="stat-label">Unités vendues</span>
          </div>
          <div className="stat-value">{s.unites_vendues}</div>
          <div className="text-xs text-rc-400">{ventesPct}% du programme</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 text-amber-500">
            <Clock size={15} /><span className="stat-label">Réservées</span>
          </div>
          <div className="stat-value">{s.unites_reservees}</div>
          <div className="text-xs text-rc-400">en cours de finalisation</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 text-blue-500">
            <Home size={15} /><span className="stat-label">Disponibles</span>
          </div>
          <div className="stat-value">{s.unites_disponibles}</div>
          <div className="text-xs text-rc-400">à commercialiser</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 text-rc-400">
            <Banknote size={15} /><span className="stat-label">Encaissé</span>
          </div>
          <div className="stat-value text-xl">{formatMontantEur(s.total_encaisse)}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 text-amber-500">
            <TrendingUp size={15} /><span className="stat-label">En attente</span>
          </div>
          <div className="stat-value text-xl">{formatMontantEur(s.total_en_attente)}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 text-rc-400">
            <HardHat size={15} /><span className="stat-label">Avancement chantier</span>
          </div>
          <div className="stat-value">{chantierAvg}%</div>
          <div className="text-xs text-rc-400">moyenne globale</div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie - répartition unités */}
        <div className="card p-6">
          <h3 className="font-display text-base font-bold text-rc-700 mb-4">Répartition des unités</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v} unités`]} />
              <Legend iconType="circle" iconSize={10} formatter={(v) => <span className="text-xs text-rc-600">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Phases chantier */}
        <div className="card p-6">
          <h3 className="font-display text-base font-bold text-rc-700 mb-4">Avancement construction</h3>
          <div className="space-y-3">
            {phases.map(p => (
              <div key={p.id}>
                <div className="flex justify-between text-xs text-rc-600 mb-1">
                  <span className="font-medium">{p.nom}</span>
                  <span>{p.avancement_pct}%</span>
                </div>
                <div className="h-2 bg-sand-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${p.avancement_pct}%`,
                      background: p.statut === 'termine' ? '#1D9E75' : p.statut === 'en_cours' ? '#378ADD' : '#D3D1C7'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertes paiements en retard */}
      {paiementsEnRetard.length > 0 && (
        <div className="card border-red-200 p-6">
          <div className="flex items-center gap-2 text-red-600 mb-4">
            <AlertCircle size={16} />
            <h3 className="font-display text-base font-bold">Paiements en retard ({paiementsEnRetard.length})</h3>
          </div>
          <div className="space-y-2">
            {paiementsEnRetard.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-sand-100 last:border-0">
                <div>
                  <div className="text-sm font-medium text-rc-800">
                    {(p.contrat as any)?.acheteur?.prenom} {(p.contrat as any)?.acheteur?.nom}
                  </div>
                  <div className="text-xs text-rc-400">
                    Contrat {(p.contrat as any)?.numero} · Échéance {formatDateCourt(p.date_echeance)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-red-600">{formatMontantEur(p.montant)}</div>
                  <span className={`badge ${statutPaiementCouleur(p.statut)} text-xs`}>
                    {LABELS_STATUT_PAIEMENT[p.statut]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Derniers contrats */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-sand-100">
          <h3 className="font-display text-base font-bold text-rc-700">Dernières ventes</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">N° contrat</th>
              <th className="th">Unité</th>
              <th className="th">Acheteur</th>
              <th className="th">Zone</th>
              <th className="th">Prix</th>
              <th className="th">Date</th>
            </tr>
          </thead>
          <tbody>
            {contratsRecents.map(c => (
              <tr key={c.id} className="table-row">
                <td className="td font-medium text-rc-600">{c.numero}</td>
                <td className="td">{(c.unite as any)?.reference} — {(c.unite as any)?.type}</td>
                <td className="td">{(c.acheteur as any)?.prenom} {(c.acheteur as any)?.nom}</td>
                <td className="td">{(c.unite as any)?.zone}</td>
                <td className="td font-medium">{formatMontantEur(c.prix_total)}</td>
                <td className="td text-rc-400">{formatDateCourt((c as any).cree_le)}</td>
              </tr>
            ))}
            {contratsRecents.length === 0 && (
              <tr><td colSpan={6} className="td text-center text-rc-400 py-8">Aucune vente enregistrée</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
