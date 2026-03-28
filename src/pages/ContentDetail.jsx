// src/pages/ContentDetail.jsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { contentsAPI, tutorialAPI } from '../services/api'
import HLSPlayer from '../components/HLSPlayer'
import { useAuthStore } from '../stores/authStore'
import styles from './ContentDetail.module.css'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'

export default function ContentDetail() {
  const { id } = useParams()
  const [content, setContent] = useState(null)
  const [lessons, setLessons] = useState([])
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeLesson, setActiveLesson] = useState(null)
  const { user } = useAuthStore()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await contentsAPI.get(id)
        setContent(data)
        contentsAPI.view(id).catch(() => {})

        if (data.isTutorial) {
          try {
            const { data: ldata } = await contentsAPI.lessons(id)
            setLessons(ldata.lessons || [])
          } catch {}
          if (user) {
            try {
              const { data: pdata } = await tutorialAPI.getProgress()
              const myProgress = pdata.inProgress?.find(p => p.contentId._id === id)
              setProgress(myProgress)
            } catch {}
          }
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [id, user])

  const markLesson = async (lessonIndex) => {
    if (!user) return
    try {
      const { data } = await tutorialAPI.updateProgress(id, { lessonIndex, completed: true })
      setProgress(p => ({
        ...p,
        completedLessons: data.completedLessons,
        percentComplete: data.percentComplete,
      }))
    } catch {}
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  )

  if (!content) return (
    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>
      Contenu introuvable ou API hors ligne.
    </div>
  )

  const thumbnailUrl = content.thumbnail ? `${API_BASE}${content.thumbnail}` : null
  const accessLabel = { free: 'Gratuit', premium: 'Premium ⭐', paid: 'Payant' }[content.accessType]

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        {/* Player */}
        {content.type === 'video' && (
          <HLSPlayer contentId={id} content={content} />
        )}

        {content.type === 'audio' && (
          <div className={styles.audioCard}>
            {thumbnailUrl && <img src={thumbnailUrl} alt={content.title} className={styles.audioCover} />}
            <HLSPlayer contentId={id} content={content} />
          </div>
        )}

        <div className={styles.info}>
          <div className={styles.infoTop}>
            <div className={styles.badges}>
              <span className={`badge ${content.type === 'video' ? 'badge-video' : 'badge-audio'}`}>
                {content.type === 'video' ? '▶ Vidéo' : '♪ Audio'}
              </span>
              <span className={`badge ${content.accessType === 'free' ? 'badge-free' : content.accessType === 'premium' ? 'badge-premium' : 'badge-paid'}`}>
                {accessLabel}
              </span>
              {content.isTutorial && (
                <span className="badge" style={{ background: 'rgba(124,106,247,0.15)', color: 'var(--accent2)' }}>
                  Tutoriel
                </span>
              )}
            </div>
            <div className={styles.views}>{content.viewCount?.toLocaleString()} vues</div>
          </div>

          <h1 className={styles.title}>{content.title}</h1>
          {content.artist && <p className={styles.artist}>par {content.artist}</p>}
          {content.album && <p className={styles.sub}>{content.album}</p>}
          {content.category && (
            <span className={styles.category}>{content.category}</span>
          )}
          {content.description && (
            <p className={styles.desc}>{content.description}</p>
          )}
          {content.accessType === 'paid' && content.price && (
            <p className={styles.price}>Prix : {(content.price / 100).toLocaleString()} Ar</p>
          )}
        </div>
      </div>

      {/* Tutorial lessons */}
      {content.isTutorial && lessons.length > 0 && (
        <div className={styles.lessons}>
          <div className={styles.lessonsHeader}>
            <h2>Leçons du tutoriel</h2>
            {progress && (
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress.percentComplete}%` }} />
                <span>{Math.round(progress.percentComplete)}%</span>
              </div>
            )}
          </div>
          <div className={styles.lessonList}>
            {lessons.map((lesson, i) => {
              const done = progress?.completedLessons?.includes(i)
              return (
                <div
                  key={i}
                  className={`${styles.lesson} ${activeLesson === i ? styles.lessonActive : ''} ${done ? styles.lessonDone : ''}`}
                  onClick={() => setActiveLesson(i)}
                >
                  <div className={styles.lessonNum}>{done ? '✓' : i + 1}</div>
                  <div className={styles.lessonInfo}>
                    <div className={styles.lessonTitle}>{lesson.title}</div>
                    {lesson.duration && <div className={styles.lessonDur}>{Math.floor(lesson.duration / 60)} min</div>}
                  </div>
                  {user && !done && (
                    <button
                      className={styles.markDone}
                      onClick={e => { e.stopPropagation(); markLesson(i) }}
                    >Marquer ✓</button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
