# 🍔 Big Man Fast Food — Application Web & Mobile

Application de commande en ligne pour Big Man Fast Food, Brazzaville, Congo.

---

## 🚀 Démarrage rapide

### Prérequis
- Node.js version 18 ou plus ([télécharger ici](https://nodejs.org))
- Un compte Supabase gratuit ([créer ici](https://supabase.com))
- Un compte Vercel gratuit ([créer ici](https://vercel.com))

---

## 📦 Installation

### Étape 1 — Cloner et installer

```bash
# Ouvre ton terminal dans le dossier bigman-app
cd bigman-app

# Installe toutes les dépendances (packages)
npm install
```

### Étape 2 — Configurer les variables d'environnement

```bash
# Copie le fichier exemple
cp .env.example .env
```

Ouvre le fichier `.env` et remplace les valeurs :

```env
VITE_SUPABASE_URL=https://ton-projet.supabase.co
VITE_SUPABASE_ANON_KEY=ta-cle-anon
VITE_WHATSAPP_NUMERO=242XXXXXXXXX
```

### Étape 3 — Configurer Supabase

1. Va sur [app.supabase.com](https://app.supabase.com)
2. Crée un nouveau projet
3. Va dans **SQL Editor** > **New query**
4. Colle le contenu de `supabase/schema.sql`
5. Clique **Run** pour créer les tables

### Étape 4 — Lancer en développement

```bash
npm run dev
```

L'app sera accessible sur `http://localhost:5173`

---

## 🌐 Déploiement sur Vercel

### Méthode simple (recommandée)

1. **Crée un dépôt GitHub** avec ton code
2. Va sur [vercel.com](https://vercel.com) et clique **New Project**
3. Importe ton dépôt GitHub
4. Dans **Environment Variables**, ajoute :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_WHATSAPP_NUMERO`
5. Clique **Deploy** — ton app sera en ligne en 2 minutes !

### Méthode terminal

```bash
# Installe Vercel CLI
npm install -g vercel

# Déploie
vercel --prod
```

---

## 📱 Build mobile avec Capacitor

### Prérequis Android
- [Android Studio](https://developer.android.com/studio) installé
- Java 11 ou plus

### Étapes

```bash
# 1. Build de l'app web
npm run build

# 2. Synchronise avec Capacitor
npm run cap:sync

# 3. Ouvre dans Android Studio
npm run cap:android

# Dans Android Studio :
# Build > Generate Signed Bundle/APK > APK
# Suis les étapes pour créer l'APK
```

---

## 🗂️ Structure du projet

```
bigman-app/
├── src/
│   ├── components/
│   │   ├── ui/          # Boutons, modales, loaders réutilisables
│   │   ├── layout/      # Navbar, BottomNav
│   │   ├── menu/        # Cartes produit, filtres, modal détail
│   │   ├── order/       # Timeline statut de commande
│   │   └── payment/     # Sélection du mode de paiement
│   ├── pages/           # Pages client (Home, Menu, Panier, etc.)
│   ├── admin/           # Dashboard administrateur
│   ├── hooks/           # Logique réutilisable (menu, commandes)
│   ├── lib/             # Supabase, WhatsApp
│   └── context/         # Panier et authentification globaux
├── supabase/
│   └── schema.sql       # Schéma de la base de données
└── public/              # Fichiers statiques (icônes, manifest PWA)
```

---

## 🔐 Accès admin

URL : `/admin`
Mot de passe par défaut : `bigman2024`

**IMPORTANT** : Change ce mot de passe dans `src/admin/AdminLogin.jsx` avant la mise en production !

---

## 🎨 Couleurs et thème

| Couleur | Code | Usage |
|---------|------|-------|
| Rouge | `#E63946` | Boutons principaux, logo |
| Noir | `#1A1A1A` | Fond général |
| Noir clair | `#2D2D2D` | Cartes, éléments |
| Jaune | `#FFD60A` | Prix, badges spéciaux |

---

## 📞 Support

Pour toute question technique, contactez le développeur.

WhatsApp Restaurant : +242 XX XXX XXXX
