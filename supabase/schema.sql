-- ============================================================
-- RIVIERA CHERCHELL — Schéma Supabase
-- Coller dans : Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLE : profils utilisateurs (liée à auth.users de Supabase)
-- ============================================================
create type role_utilisateur as enum (
  'directeur', 'agent_commercial', 'responsable_chantier', 'comptable', 'client'
);

create table profils (
  id uuid references auth.users on delete cascade primary key,
  nom text not null,
  prenom text not null,
  email text not null,
  telephone text,
  role role_utilisateur not null default 'agent_commercial',
  actif boolean default true,
  cree_le timestamptz default now(),
  mis_a_jour_le timestamptz default now()
);

-- ============================================================
-- TABLE : unites (les 103 logements)
-- ============================================================
create type statut_unite as enum ('disponible', 'reserve', 'vendu');
create type type_unite as enum ('Villa', 'Duplex', 'Appartement');

create table unites (
  id uuid default uuid_generate_v4() primary key,
  reference text not null unique,        -- ex: RC-001
  type type_unite not null,
  zone text not null,                    -- Zone A, B, C, D, E
  etage int default 0,
  superficie_m2 numeric(8,2),
  nb_chambres int,
  nb_salles_bain int,
  prix numeric(12,2) not null,
  statut statut_unite default 'disponible',
  description text,
  cree_le timestamptz default now(),
  mis_a_jour_le timestamptz default now()
);

-- ============================================================
-- TABLE : acheteurs
-- ============================================================
create table acheteurs (
  id uuid default uuid_generate_v4() primary key,
  profil_id uuid references profils(id),  -- si le client a un compte
  nom text not null,
  prenom text not null,
  email text not null unique,
  telephone text,
  adresse text,
  ville text,
  pays text default 'Algérie',
  numero_identite text,
  type_identite text default 'CIN',
  notes text,
  cree_le timestamptz default now(),
  mis_a_jour_le timestamptz default now()
);

-- ============================================================
-- TABLE : contrats
-- ============================================================
create type statut_contrat as enum ('reservation', 'compromis', 'acte_definitif', 'annule');

create table contrats (
  id uuid default uuid_generate_v4() primary key,
  numero text not null unique,           -- ex: RC-2024-0042
  unite_id uuid references unites(id) not null,
  acheteur_id uuid references acheteurs(id) not null,
  agent_id uuid references profils(id),
  statut statut_contrat default 'reservation',
  prix_total numeric(12,2) not null,
  date_reservation date,
  date_compromis date,
  date_acte date,
  notaire text,
  documents jsonb default '[]',          -- liste de fichiers Supabase Storage
  notes text,
  cree_le timestamptz default now(),
  mis_a_jour_le timestamptz default now()
);

-- ============================================================
-- TABLE : appels_paiement (5 phases × N contrats)
-- ============================================================
create type statut_paiement as enum ('a_venir', 'appele', 'en_attente', 'paye', 'en_retard');
create type phase_paiement as enum ('phase_1','phase_2','phase_3','phase_4','phase_5');

create table appels_paiement (
  id uuid default uuid_generate_v4() primary key,
  contrat_id uuid references contrats(id) not null,
  phase phase_paiement not null,
  numero_phase int not null check (numero_phase between 1 and 5),
  pourcentage numeric(5,2) not null,     -- ex: 20.00
  montant numeric(12,2) not null,
  statut statut_paiement default 'a_venir',
  date_echeance date,
  date_paiement date,
  mode_paiement text,                    -- virement, chèque, espèces
  reference_paiement text,
  rappel_envoye boolean default false,
  notes text,
  cree_le timestamptz default now(),
  mis_a_jour_le timestamptz default now()
);

-- ============================================================
-- TABLE : phases_construction
-- ============================================================
create type statut_phase_construction as enum ('planifie','en_cours','termine');

create table phases_construction (
  id uuid default uuid_generate_v4() primary key,
  numero int not null unique check (numero between 1 and 5),
  nom text not null,
  description text,
  zone text,
  statut statut_phase_construction default 'planifie',
  avancement_pct int default 0 check (avancement_pct between 0 and 100),
  date_debut_prevue date,
  date_fin_prevue date,
  date_debut_reelle date,
  date_fin_reelle date,
  phase_paiement_declenchee phase_paiement,  -- phase de paiement que cette étape déclenche
  mis_a_jour_par uuid references profils(id),
  mis_a_jour_le timestamptz default now()
);

-- ============================================================
-- TABLE : notifications (log des emails envoyés)
-- ============================================================
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  appel_paiement_id uuid references appels_paiement(id),
  acheteur_id uuid references acheteurs(id),
  type text not null,                    -- rappel_paiement, confirmation, bienvenue
  sujet text,
  statut text default 'envoye',
  envoye_le timestamptz default now()
);

-- ============================================================
-- DONNÉES INITIALES : 5 phases de construction
-- ============================================================
insert into phases_construction (numero, nom, description, statut, avancement_pct, date_debut_prevue, date_fin_prevue, phase_paiement_declenchee) values
(1, 'Fondations & structure', 'Terrassement, fondations, structure béton armé', 'termine', 100, '2024-01-15', '2024-06-30', 'phase_2'),
(2, 'Murs & toiture', 'Maçonnerie, charpente, couverture, étanchéité', 'en_cours', 65, '2024-07-01', '2025-01-31', 'phase_3'),
(3, 'Fluides & second œuvre gros', 'Plomberie, électricité, climatisation brut', 'planifie', 0, '2025-02-01', '2025-08-31', 'phase_4'),
(4, 'Finitions intérieures', 'Carrelage, peinture, menuiseries, cuisine', 'planifie', 0, '2025-09-01', '2026-02-28', 'phase_5'),
(5, 'Livraison & espaces verts', 'Nettoyage, landscaping, réception officielle', 'planifie', 0, '2026-03-01', '2026-09-30', null);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profils enable row level security;
alter table unites enable row level security;
alter table acheteurs enable row level security;
alter table contrats enable row level security;
alter table appels_paiement enable row level security;
alter table phases_construction enable row level security;
alter table notifications enable row level security;

-- Profils : chacun voit son propre profil + les directeurs voient tout
create policy "profil_own" on profils for select using (auth.uid() = id);
create policy "profil_directeur" on profils for all using (
  exists (select 1 from profils p where p.id = auth.uid() and p.role = 'directeur')
);

-- Unités : lecture pour tous les rôles internes, écriture directeur/agent
create policy "unites_lecture" on unites for select using (
  exists (select 1 from profils p where p.id = auth.uid() and p.role != 'client')
);
create policy "unites_ecriture" on unites for all using (
  exists (select 1 from profils p where p.id = auth.uid() and p.role in ('directeur','agent_commercial'))
);

-- Acheteurs : agents+ peuvent lire; clients voient leur propre fiche
create policy "acheteurs_interne" on acheteurs for all using (
  exists (select 1 from profils p where p.id = auth.uid() and p.role in ('directeur','agent_commercial','comptable'))
);
create policy "acheteurs_client" on acheteurs for select using (
  profil_id = auth.uid()
);

-- Contrats : agents+ et client (son propre contrat)
create policy "contrats_interne" on contrats for all using (
  exists (select 1 from profils p where p.id = auth.uid() and p.role in ('directeur','agent_commercial','comptable'))
);
create policy "contrats_client" on contrats for select using (
  exists (select 1 from acheteurs a where a.profil_id = auth.uid() and a.id = acheteur_id)
);

-- Appels paiement
create policy "paiements_interne" on appels_paiement for all using (
  exists (select 1 from profils p where p.id = auth.uid() and p.role in ('directeur','comptable','agent_commercial'))
);
create policy "paiements_client" on appels_paiement for select using (
  exists (
    select 1 from contrats c join acheteurs a on a.id = c.acheteur_id
    where c.id = contrat_id and a.profil_id = auth.uid()
  )
);

-- Phases construction : lecture tous internes, écriture directeur/chantier
create policy "chantier_lecture" on phases_construction for select using (
  exists (select 1 from profils p where p.id = auth.uid() and p.role != 'client')
);
create policy "chantier_ecriture" on phases_construction for update using (
  exists (select 1 from profils p where p.id = auth.uid() and p.role in ('directeur','responsable_chantier'))
);

-- ============================================================
-- FONCTION : générer automatiquement les 5 appels de paiement
-- quand un contrat est créé
-- ============================================================
create or replace function creer_appels_paiement()
returns trigger language plpgsql as $$
declare
  phases_config jsonb := '[
    {"num":1,"phase":"phase_1","pct":10,"libelle":"Acompte réservation"},
    {"num":2,"phase":"phase_2","pct":20,"libelle":"Fondations terminées"},
    {"num":3,"phase":"phase_3","pct":20,"libelle":"Murs & toiture terminés"},
    {"num":4,"phase":"phase_4","pct":25,"libelle":"Finitions intérieures"},
    {"num":5,"phase":"phase_5","pct":25,"libelle":"Livraison des clés"}
  ]';
  p jsonb;
begin
  for p in select * from jsonb_array_elements(phases_config)
  loop
    insert into appels_paiement (contrat_id, phase, numero_phase, pourcentage, montant, statut)
    values (
      new.id,
      (p->>'phase')::phase_paiement,
      (p->>'num')::int,
      (p->>'pct')::numeric,
      new.prix_total * (p->>'pct')::numeric / 100,
      case when (p->>'num')::int = 1 then 'appele' else 'a_venir' end
    );
  end loop;
  return new;
end;
$$;

create trigger trigger_appels_paiement
after insert on contrats
for each row execute function creer_appels_paiement();

-- ============================================================
-- VUE : tableau de bord directeur
-- ============================================================
create or replace view vue_dashboard as
select
  (select count(*) from unites) as total_unites,
  (select count(*) from unites where statut = 'vendu') as unites_vendues,
  (select count(*) from unites where statut = 'reserve') as unites_reservees,
  (select count(*) from unites where statut = 'disponible') as unites_disponibles,
  (select coalesce(sum(montant),0) from appels_paiement where statut = 'paye') as total_encaisse,
  (select coalesce(sum(montant),0) from appels_paiement where statut in ('appele','en_attente','en_retard')) as total_en_attente,
  (select coalesce(sum(prix_total),0) from contrats where statut != 'annule') as valeur_contrats_total;
