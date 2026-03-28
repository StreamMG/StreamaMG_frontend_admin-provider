// src/pages/Tutorials.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { contentsAPI, tutorialAPI } from '../services/api'
import ContentCard from '../components/ContentCard'
import { useAuthStore } from '../stores/authStore'
import styles from './Tutorials.module.css'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'

export default function Tutorials() {
  const [tutorials, setTutorials] = useState([])
  const [inProgress, setInProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await contentsAPI.list({ isTutorial: true, limit: 20 })
        setTutorials(data.contents || [])
      } catch {}
      if (user) {
        try {
          const { data } = await tutorialAPI.getProgress()
          setInProgress(data.inProgress || [])
        } catch {}
      }
      setLoading(false)
    }
    load()
  }, [user])

  return (
    <div className={styles.page}>
      <h1>Tutoriels</h1>

      {user && inProgress.length > 0 && (
        <section className={styles.section}>
          <h2>En cours</h2>
          <div className={styles.progressList}>
            {inProgress.map(p => {
              const thumb = p.contentId?.thumbnail ? `${API_BASE}${p.contentId.thumbnail}` : null
              return (
                <Link to={`/content/${p.contentId._id}`} key={p.contentId._id} className={styles.progressItem}>
                  <div className={styles.progressThumb}>
                    {thumb ? <img src={thumb} alt={p.contentId.title} /> : <span>📚</span>}
                  </div>
                  <div className={styles.progressInfo}>
                    <div className={styles.progressTitle}>{p.contentId.title}</div>
                    <div className={styles.progressBarWrap}>
                      <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${p.percentComplete}%` }} />
                      </div>
                      <span>{Math.round(p.percentComplete)}%</span>
                    </div>
                    <div className={styles.progressMeta}>
                      Leçon {p.lastLessonIndex + 1} · Mis à jour {new Date(p.lastUpdatedAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h2>Tous les tutoriels</h2>
        {loading ? (
          <div className={styles.center}><div className="spinner" style={{ width: 36, height: 36 }} /></div>
        ) : tutorials.length === 0 ? (
          <p className={styles.empty}>Aucun tutoriel disponible</p>
        ) : (
          <div className={styles.grid}>
            {tutorials.map(c => <ContentCard key={c._id} content={c} />)}
          </div>
        )}
      </section>
    </div>
  )
}
