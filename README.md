# Riviera Cherchell — Application de gestion immobilière

Application web complète pour la gestion des ventes et du suivi de construction de la résidence Riviera Cherchell (103 logements).

---

## Stack technique

| Couche | Technologie | Usage |
|--------|-------------|-------|
| Frontend | Next.js 14 + React | Interface utilisateur |
| Styling | Tailwind CSS | Design système |
| Base de données | Supabase (PostgreSQL) | Données & authentification |
| Emails | Resend | Rappels de paiement |
| Hébergement | Vercel | Déploiement |

---

## Fonctionnalités

### Rôles utilisateurs
- **Directeur** — accès complet à toutes les données et fonctionnalités
- **Agent commercial** — gestion des ventes, contrats et clients
- **Responsable chantier** — mise à jour de l'avancement des travaux
- **Comptable** — suivi des paiements, marquage des encaissements
- **Client acheteur** — espace personnel avec son échéancier et l'avancement du chantier

### Modules
1. **Tableau de bord** — KPIs, graphiques, alertes paiements en retard
2. **Ventes & unités** — grille interactive des 103 logements
3. **Paiements** — 5 phases liées au chantier, rappels email automatiques
4. **Suivi chantier** — avancement par phase, déclenchement automatique des appels de fonds
5. **Espace client** — vue personnalisée pour chaque acheteur

### Automatisations
- À la création d'un contrat → génération automatique des 5 appels de fonds
- Quand une phase chantier est marquée "Terminée" → activation des appels de fonds correspondants
- Bouton "Rappel email" → envoi d'un email HTML personnalisé via Resend

---

## Installation locale

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Supabase (gratuit)
- Compte Resend (gratuit)

### Étapes

#### 1. Cloner et installer

```bash
git clone <votre-repo>
cd riviera-cherchell
npm install
```

#### 2. Configurer Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Aller dans **SQL Editor** > **New Query**
3. Coller et exécuter le contenu de `supabase/schema.sql`
4. Dans **Authentication > Settings**, configurer l'URL de redirection : `http://localhost:3000/auth/callback`

#### 3. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Remplir dans `.env.local` :
```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service
RESEND_API_KEY=re_votre_clé
```

#### 4. Lancer en développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

#### 5. Créer le premier utilisateur (Directeur)

Dans Supabase **Authentication > Users** :
1. Cliquer "Invite user" avec l'email du directeur
2. Après création, dans **SQL Editor** :

```sql
INSERT INTO profils (id, nom, prenom, email, role)
VALUES (
  'UUID_DE_LUTIL_DANS_AUTH',
  'Votre Nom',
  'Votre Prénom',
  'email@exemple.com',
  'directeur'
);
```

---

## Déploiement sur Vercel

### 1. Pousser sur GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/votre-user/riviera-cherchell
git push -u origin main
```

### 2. Déployer sur Vercel

1. Aller sur [vercel.com](https://vercel.com) > "New Project"
2. Importer depuis GitHub
3. Dans "Environment Variables", ajouter les 4 variables de `.env.example`
4. Cliquer "Deploy"

### 3. Configurer Supabase pour la production

Dans Supabase **Authentication > URL Configuration** :
- Site URL : `https://votre-app.vercel.app`
- Redirect URLs : `https://votre-app.vercel.app/auth/callback`

---

## Ajouter des logements (unités)

Dans Supabase **Table Editor > unites** ou via SQL :

```sql
INSERT INTO unites (reference, type, zone, etage, superficie_m2, nb_chambres, nb_salles_bain, prix, statut)
VALUES
  ('RC-001', 'Villa',       'Zone A', 0, 180, 4, 2, 380000, 'disponible'),
  ('RC-002', 'Duplex',      'Zone A', 1, 140, 3, 2, 290000, 'disponible'),
  ('RC-003', 'Appartement', 'Zone B', 2, 95,  2, 1, 210000, 'disponible');
  -- Répéter pour les 103 unités
```

---

## Structure du projet

```
src/
├── app/
│   ├── auth/login/          # Page de connexion
│   ├── dashboard/           # Tableau de bord directeur/agent/comptable
│   ├── ventes/              # Grille des 103 unités
│   ├── paiements/           # Suivi des 5 phases de paiement
│   ├── chantier/            # Avancement construction
│   ├── client/              # Espace personnel acheteur
│   └── api/                 # Routes API (rappels, paiements, chantier)
├── components/
│   └── layout/              # Sidebar, AppLayout
├── lib/
│   ├── supabase/            # Clients Supabase (client + serveur)
│   ├── email.ts             # Service Resend
│   └── utils.ts             # Formatage, couleurs, utilitaires
└── types/
    └── index.ts             # Types TypeScript + labels français
supabase/
└── schema.sql               # Schéma PostgreSQL complet avec RLS
```

---

## Support

Pour toute question technique sur cette application, contactez votre développeur.
