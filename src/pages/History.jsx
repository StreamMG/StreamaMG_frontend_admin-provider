// src/pages/History.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { historyAPI } from '../services/api'
import styles from './History.module.css'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'

export default function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    historyAPI.list()
      .then(r => setHistory(r.data.history || r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const formatDuration = (secs) => {
    if (!secs) return '0:00'
    const m = Math.floor(secs / 60), s = secs % 60
    return `${m}:${String(s).padStart(2,'0')}`
  }

  return (
    <div className={styles.page}>
      <h1>Historique de visionnage</h1>

      {loading ? (
        <div className={styles.center}><div className="spinner" style={{ width: 36, height: 36 }} /></div>
      ) : history.length === 0 ? (
        <div className={styles.empty}>
          <p>Aucun historique</p>
          <Link to="/catalogue">Commencer à regarder →</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {history.map((h, i) => {
            const c = h.contentId
            const thumb = c?.thumbnail ? `${API_BASE}${c.thumbnail}` : null
            return (
              <Link to={`/content/${c?._id || h.contentId}`} key={i} className={styles.item}>
                <div className={styles.thumb}>
                  {thumb ? <img src={thumb} alt={c?.title} /> : <div className={styles.noThumb}>🎬</div>}
                  {h.completed && <span className={styles.completedBadge}>✓ Vu</span>}
                </div>
                <div className={styles.info}>
                  <div className={styles.title}>{c?.title || 'Contenu supprimé'}</div>
                  <div className={styles.meta}>
                    Progression : {formatDuration(h.progress)}
                    {' · '}
                    {new Date(h.watchedAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
