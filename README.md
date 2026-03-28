# StreamMG — Frontend Prototype

Prototype frontend React pour l'API StreamMG.

## 🚀 Installation

```bash
npm install
```

## ⚙️ Configuration

Copiez `.env.example` en `.env` et renseignez les valeurs :

```bash
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=StreamMG
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx
```

## 🏃 Démarrage

```bash
npm run dev
```

Ouvre `http://localhost:5173`

## 📦 Structure

```
src/
├── services/
│   └── api.js          ← Axios + intercepteurs JWT auto-refresh
├── stores/
│   ├── authStore.js    ← Zustand auth (JWT en mémoire)
│   └── accessGateStore.js ← Modal accès freemium
├── components/
│   ├── Layout.jsx      ← Navigation principale
│   ├── ContentCard.jsx ← Carte contenu
│   ├── HLSPlayer.jsx   ← Lecteur HLS.js avec auto-renouvellement token
│   └── AccessGateModal.jsx ← Modal free/premium/paid
└── pages/
    ├── Home.jsx
    ├── Catalogue.jsx      ← Filtres + pagination
    ├── ContentDetail.jsx  ← Lecteur + leçons tutoriel
    ├── History.jsx
    ├── Tutorials.jsx
    ├── Payments.jsx       ← Abonnement + achats unitaires
    ├── ProviderDashboard.jsx ← Upload multipart (vignette obligatoire)
    └── AdminDashboard.jsx ← Stats + gestion contenus/users
```

## 🔒 Sécurité

- JWT stocké en mémoire (Zustand) — jamais localStorage
- Refresh token via cookie httpOnly
- Auto-refresh transparent sur 401
- Modal AccessGate sur 403 avec reason (subscription_required / purchase_required / login_required)
- Renouvellement token HLS sur expiration (403 → GET /hls/:id/token)

## 🎭 Comptes test

Créez un compte via `/register` ou connectez-vous via `/login`.

Pour tester les rôles, modifiez directement en MongoDB :
```js
db.users.updateOne({ email: "..." }, { $set: { role: "admin" } })
db.users.updateOne({ email: "..." }, { $set: { role: "provider" } })
```

## 💳 Stripe test

- `4242 4242 4242 4242` → Succès
- `4000 0000 0000 9995` → Refus
