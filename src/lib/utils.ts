// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    maximumFractionDigits: 0,
  }).format(montant)
}

export function formatMontantEur(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(montant)
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  }).format(new Date(dateStr))
}

export function formatDateCourt(dateStr?: string): string {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date(dateStr))
}

export function initiales(nom: string, prenom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
}

export function statutPaiementCouleur(statut: string): string {
  const map: Record<string, string> = {
    paye:       'bg-rc-50 text-rc-700 border-rc-200',
    appele:     'bg-blue-50 text-blue-700 border-blue-200',
    en_attente: 'bg-amber-50 text-amber-700 border-amber-200',
    en_retard:  'bg-red-50 text-red-700 border-red-200',
    a_venir:    'bg-gray-100 text-gray-500 border-gray-200',
  }
  return map[statut] ?? 'bg-gray-100 text-gray-500'
}

export function statutUniteCouleur(statut: string): string {
  const map: Record<string, string> = {
    vendu:      'bg-rc-50 text-rc-700',
    reserve:    'bg-amber-50 text-amber-700',
    disponible: 'bg-blue-50 text-blue-700',
  }
  return map[statut] ?? 'bg-gray-100 text-gray-500'
}
