// src/pages/Payments.jsx
import { useEffect, useState } from 'react'
import { paymentAPI } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import styles from './Payments.module.css'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'

export default function Payments() {
  const [status, setStatus] = useState(null)
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(false)
  const [subLoading, setSubLoading] = useState(null)
  const { user } = useAuthStore()

  useEffect(() => {
    paymentAPI.status().then(r => setStatus(r.data)).catch(() => {})
    paymentAPI.purchases().then(r => setPurchases(r.data.purchases || [])).catch(() => {})
  }, [])

  const handleSubscribe = async (plan) => {
    setSubLoading(plan)
    try {
      const { data } = await paymentAPI.subscribe(plan)
      alert(`✅ PaymentIntent créé !\nClientSecret: ${data.clientSecret?.slice(0, 30)}...\n\n(Intégrez Stripe Elements pour le paiement complet)\n\nCarte test: 4242 4242 4242 4242`)
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur')
    }
    setSubLoading(null)
  }

  return (
    <div className={styles.page}>
      <h1>Abonnements & Achats</h1>

      {/* Statut actuel */}
      <div className={styles.statusCard}>
        <div className={styles.statusLeft}>
          <div className={styles.statusLabel}>Statut actuel</div>
          <div className={styles.statusValue}>
            {user?.isPremium ? (
              <span className={styles.premiumBadge}>⭐ Premium</span>
            ) : (
              <span className={styles.freeBadge}>Standard</span>
            )}
          </div>
          {status?.premiumExpiry && (
            <div className={styles.expiry}>
              Expire le {new Date(status.premiumExpiry).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>
        <div className={styles.statusNote}>
          <strong>⚠️ Note importante :</strong> L'abonnement Premium ne couvre pas les contenus payants (type "paid").
          Ces contenus nécessitent un achat unitaire, même pour les membres Premium.
        </div>
      </div>

      {/* Plans d'abonnement */}
      {!user?.isPremium && (
        <section className={styles.section}>
          <h2>Passer Premium</h2>
          <div className={styles.plans}>
            <div className={styles.planCard}>
              <div className={styles.planName}>Mensuel</div>
              <div className={styles.planPrice}>5 000 <span>Ar/mois</span></div>
              <ul className={styles.planFeatures}>
                <li>✅ Contenus premium illimités</li>
                <li>✅ Streaming HD</li>
                <li>✅ Sans publicité</li>
                <li>⚠️ Contenus payants non inclus</li>
              </ul>
              <button
                className={styles.planBtn}
                onClick={() => handleSubscribe('monthly')}
                disabled={subLoading === 'monthly'}
              >
                {subLoading === 'monthly' ? <span className="spinner" /> : 'Choisir Mensuel'}
              </button>
            </div>

            <div className={`${styles.planCard} ${styles.planBest}`}>
              <div className={styles.bestBadge}>Meilleure offre</div>
              <div className={styles.planName}>Annuel</div>
              <div className={styles.planPrice}>50 000 <span>Ar/an</span></div>
              <div className={styles.saving}>Économisez 2 mois !</div>
              <ul className={styles.planFeatures}>
                <li>✅ Contenus premium illimités</li>
                <li>✅ Streaming HD</li>
                <li>✅ Sans publicité</li>
                <li>⚠️ Contenus payants non inclus</li>
              </ul>
              <button
                className={`${styles.planBtn} ${styles.planBtnAccent}`}
                onClick={() => handleSubscribe('yearly')}
                disabled={subLoading === 'yearly'}
              >
                {subLoading === 'yearly' ? <span className="spinner" /> : 'Choisir Annuel'}
              </button>
            </div>
          </div>

          <div className={styles.testInfo}>
            Cartes test Stripe : <code>4242 4242 4242 4242</code> (succès) · <code>4000 0000 0000 9995</code> (refus)
          </div>
        </section>
      )}

      {/* Achats unitaires */}
      <section className={styles.section}>
        <h2>Mes achats ({purchases.length})</h2>
        {purchases.length === 0 ? (
          <p className={styles.empty}>Aucun achat unitaire</p>
        ) : (
          <div className={styles.purchaseList}>
            {purchases.map(p => {
              const thumb = p.contentId?.thumbnail ? `${API_BASE}${p.contentId.thumbnail}` : null
              return (
                <div key={p._id} className={styles.purchaseItem}>
                  <div className={styles.purchaseThumb}>
                    {thumb ? <img src={thumb} alt={p.contentId?.title} /> : <span>🎬</span>}
                  </div>
                  <div className={styles.purchaseInfo}>
                    <div className={styles.purchaseTitle}>{p.contentId?.title || 'Contenu'}</div>
                    <div className={styles.purchaseMeta}>
                      {(p.amount / 100).toLocaleString()} Ar · {new Date(p.purchasedAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <span className="badge badge-free">Acheté ✓</span>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
