// types/index.ts

export type RoleUtilisateur =
  | 'directeur'
  | 'agent_commercial'
  | 'responsable_chantier'
  | 'comptable'
  | 'client'

export type StatutUnite = 'disponible' | 'reserve' | 'vendu'
export type TypeUnite = 'Villa' | 'Duplex' | 'Appartement'
export type StatutContrat = 'reservation' | 'compromis' | 'acte_definitif' | 'annule'
export type StatutPaiement = 'a_venir' | 'appele' | 'en_attente' | 'paye' | 'en_retard'
export type PhasePaiement = 'phase_1' | 'phase_2' | 'phase_3' | 'phase_4' | 'phase_5'
export type StatutPhaseConstruction = 'planifie' | 'en_cours' | 'termine'

export interface Profil {
  id: string
  nom: string
  prenom: string
  email: string
  telephone?: string
  role: RoleUtilisateur
  actif: boolean
  cree_le: string
}

export interface Unite {
  id: string
  reference: string
  type: TypeUnite
  zone: string
  etage: number
  superficie_m2?: number
  nb_chambres?: number
  nb_salles_bain?: number
  prix: number
  statut: StatutUnite
  description?: string
}

export interface Acheteur {
  id: string
  profil_id?: string
  nom: string
  prenom: string
  email: string
  telephone?: string
  adresse?: string
  ville?: string
  pays: string
  numero_identite?: string
  type_identite: string
  notes?: string
}

export interface Contrat {
  id: string
  numero: string
  unite_id: string
  acheteur_id: string
  agent_id?: string
  statut: StatutContrat
  prix_total: number
  date_reservation?: string
  date_compromis?: string
  date_acte?: string
  notaire?: string
  notes?: string
  // joins
  unite?: Unite
  acheteur?: Acheteur
  agent?: Profil
  appels_paiement?: AppelPaiement[]
}

export interface AppelPaiement {
  id: string
  contrat_id: string
  phase: PhasePaiement
  numero_phase: number
  pourcentage: number
  montant: number
  statut: StatutPaiement
  date_echeance?: string
  date_paiement?: string
  mode_paiement?: string
  reference_paiement?: string
  rappel_envoye: boolean
  notes?: string
  // join
  contrat?: Contrat
}

export interface PhaseConstruction {
  id: string
  numero: number
  nom: string
  description?: string
  zone?: string
  statut: StatutPhaseConstruction
  avancement_pct: number
  date_debut_prevue?: string
  date_fin_prevue?: string
  date_debut_reelle?: string
  date_fin_reelle?: string
  phase_paiement_declenchee?: PhasePaiement
}

export interface DashboardStats {
  total_unites: number
  unites_vendues: number
  unites_reservees: number
  unites_disponibles: number
  total_encaisse: number
  total_en_attente: number
  valeur_contrats_total: number
}

// Labels français
export const LABELS_STATUT_UNITE: Record<StatutUnite, string> = {
  disponible: 'Disponible',
  reserve: 'Réservé',
  vendu: 'Vendu',
}

export const LABELS_STATUT_PAIEMENT: Record<StatutPaiement, string> = {
  a_venir: 'À venir',
  appele: 'Appelé',
  en_attente: 'En attente',
  paye: 'Payé',
  en_retard: 'En retard',
}

export const LABELS_STATUT_CONTRAT: Record<StatutContrat, string> = {
  reservation: 'Réservation',
  compromis: 'Compromis',
  acte_definitif: 'Acte définitif',
  annule: 'Annulé',
}

export const LABELS_PHASE_PAIEMENT: Record<PhasePaiement, string> = {
  phase_1: 'Phase 1 — Acompte réservation (10%)',
  phase_2: 'Phase 2 — Fondations terminées (20%)',
  phase_3: 'Phase 3 — Murs & toiture (20%)',
  phase_4: 'Phase 4 — Finitions intérieures (25%)',
  phase_5: 'Phase 5 — Livraison des clés (25%)',
}

export const LABELS_ROLE: Record<RoleUtilisateur, string> = {
  directeur: 'Directeur',
  agent_commercial: 'Agent commercial',
  responsable_chantier: 'Responsable chantier',
  comptable: 'Comptable',
  client: 'Client acheteur',
}

export const COULEURS_STATUT_UNITE: Record<StatutUnite, string> = {
  disponible: '#B5D4F4',
  reserve:    '#FAC775',
  vendu:      '#1D9E75',
}
