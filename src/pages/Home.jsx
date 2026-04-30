// src/pages/Home.jsx
import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { contentsAPI } from '../services/api'
import ContentCard from '../components/ContentCard'
import { useAuthStore } from '../stores/authStore'
import styles from './Home.module.css'

export default function Home() {
  const { user, isPremium, isProvider, isAdmin } = useAuthStore()
  const [featured, setFeatured] = useState([])
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)

  const role = user?.role || 'guest'

  // Redirection pour provider et admin
  if (role === 'provider') {
    return <Navigate to="/provider" replace />
  }
  
  if (role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  useEffect(() => {
    const load = async () => {
      try {
        const [f, t] = await Promise.all([
          contentsAPI.featured(),
          contentsAPI.trending(),
        ])
        setFeatured(f.data.contents || f.data || [])
        setTrending(t.data.contents || t.data || [])
      } catch {
        // API non connectée
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.heroLabel}>🇲🇬 Plateforme Streaming Malagasy</p>
          <h1 className={styles.heroTitle}>
            La culture malagasy<br />
            <span className={styles.heroAccent}>en streaming</span>
          </h1>
          <p className={styles.heroSub}>
            Films, musiques, podcasts et tutoriels. Contenu gratuit, Premium et unitaire.
          </p>
          <div className={styles.heroCtas}>
            <Link to="/catalogue" className={styles.ctaPrimary}>Explorer le catalogue</Link>
            
            {!user && (
              <Link to="/register" className={styles.ctaSecondary}>
                Créer un compte gratuit
              </Link>
            )}
            
            {user && !isPremium() && (
              <Link to="/payments" className={styles.ctaSecondary}>
                Passer Premium ⭐
              </Link>
            )}
          </div>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.stat}><span>~35</span><small>Endpoints API</small></div>
          <div className={styles.stat}><span>8</span><small>Collections MongoDB</small></div>
          <div className={styles.stat}><span>AES-256</span><small>Chiffrement</small></div>
          <div className={styles.stat}><span>HLS</span><small>Streaming sécurisé</small></div>
        </div>
      </section>

      {/* Status API */}
      <div className={styles.apiStatus}>
        <span className={loading ? styles.statusPending : featured.length > 0 ? styles.statusOk : styles.statusOff} />
        <span>
          {loading ? 'Connexion API...' :
           featured.length > 0 ? `API connectée — ${import.meta.env.VITE_API_URL}` :
           `API hors ligne — Configurez VITE_API_URL dans .env`}
        </span>
      </div>

      {/* Featured */}
      {!loading && featured.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Mis en avant</h2>
            <Link to="/catalogue" className={styles.seeAll}>Tout voir →</Link>
          </div>
          <div className={styles.grid}>
            {featured.slice(0, 4).map(c => <ContentCard key={c._id} content={c} />)}
          </div>
        </section>
      )}

      {/* Trending */}
      {!loading && trending.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>🔥 Tendances</h2>
            <Link to="/catalogue" className={styles.seeAll}>Tout voir →</Link>
          </div>
          <div className={styles.grid}>
            {trending.slice(0, 8).map(c => <ContentCard key={c._id} content={c} />)}
          </div>
        </section>
      )}

      {/* Empty state */}
      {!loading && featured.length === 0 && trending.length === 0 && (
        <section className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔌</div>
          <h2>Backend non connecté</h2>
          <p>Démarrez le serveur backend et configurez <code>VITE_API_URL</code> dans <code>.env</code></p>
          <div className={styles.envHint}>
            <pre>{`# .env\nVITE_API_URL=http://localhost:3001/api`}</pre>
          </div>
        </section>
      )}
    </div>
  )
}