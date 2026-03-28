// src/components/AccessGateModal.jsx
import { useNavigate } from 'react-router-dom'
import { useAccessGateStore } from '../stores/accessGateStore'
import { useAuthStore } from '../stores/authStore'
import { paymentAPI } from '../services/api'
import { useState } from 'react'
import styles from './AccessGateModal.module.css'

export default function AccessGateModal() {
  const { visible, reason, price, contentId, hide } = useAccessGateStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  if (!visible) return null

  const handleSubscribe = () => {
    hide()
    navigate('/payments')
  }

  const handlePurchase = async () => {
    if (!contentId) return
    setLoading(true)
    try {
      const { data } = await paymentAPI.purchase(contentId)
      alert(`✅ Paiement initié. ClientSecret: ${data.clientSecret?.slice(0, 20)}... (intégrez Stripe Elements ici)`)
      hide()
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur paiement')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = () => {
    hide()
    navigate('/login')
  }

  return (
    <div className={styles.overlay} onClick={hide}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.close} onClick={hide}>✕</button>

        {reason === 'login_required' && (
          <>
            <div className={styles.icon}>🔒</div>
            <h2>Connexion requise</h2>
            <p>Vous devez être connecté pour accéder à ce contenu.</p>
            <button className={styles.btnPrimary} onClick={handleLogin}>
              Se connecter
            </button>
          </>
        )}

        {reason === 'subscription_required' && (
          <>
            <div className={styles.icon}>⭐</div>
            <h2>Contenu Premium</h2>
            <p>Ce contenu est réservé aux abonnés Premium.</p>
            <div className={styles.plans}>
              <div className={styles.plan}>
                <div className={styles.planName}>Mensuel</div>
                <div className={styles.planPrice}>5 000 Ar <span>/mois</span></div>
              </div>
              <div className={`${styles.plan} ${styles.planBest}`}>
                <div className={styles.planBadge}>Meilleure offre</div>
                <div className={styles.planName}>Annuel</div>
                <div className={styles.planPrice}>50 000 Ar <span>/an</span></div>
              </div>
            </div>
            <button className={styles.btnPrimary} onClick={handleSubscribe}>
              {user ? "S'abonner Premium" : "Se connecter"}
            </button>
          </>
        )}

        {reason === 'purchase_required' && (
          <>
            <div className={styles.icon}>🛒</div>
            <h2>Contenu Payant</h2>
            <p>
              Ce contenu est disponible à l'achat unitaire.
              {user?.isPremium && (
                <span className={styles.premiumNote}>
                  {' '}⚠️ L'abonnement Premium ne couvre pas les contenus payants.
                </span>
              )}
            </p>
            {price && (
              <div className={styles.priceTag}>
                {(price / 100).toLocaleString()} Ar
              </div>
            )}
            <button
              className={styles.btnPrimary}
              onClick={user ? handlePurchase : handleLogin}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : user ? 'Acheter ce contenu' : 'Se connecter pour acheter'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
