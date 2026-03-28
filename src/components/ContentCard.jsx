// src/components/ContentCard.jsx
import { useNavigate } from 'react-router-dom'
import styles from './ContentCard.module.css'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'

export default function ContentCard({ content }) {
  const navigate = useNavigate()

  const thumbnailUrl = content.thumbnail
    ? `${API_BASE}${content.thumbnail}`
    : null

  const accessBadge = {
    free: { label: 'Gratuit', cls: 'badge-free' },
    premium: { label: 'Premium', cls: 'badge-premium' },
    paid: { label: `${(content.price / 100).toLocaleString()} Ar`, cls: 'badge-paid' },
  }[content.accessType] || { label: content.accessType, cls: '' }

  const formatDuration = (secs) => {
    if (!secs) return ''
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return m > 60 ? `${Math.floor(m/60)}h${m%60}m` : `${m}:${String(s).padStart(2,'0')}`
  }

  return (
    <div className={styles.card} onClick={() => navigate(`/content/${content._id}`)}>
      <div className={styles.thumb}>
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={content.title} loading="lazy" />
        ) : (
          <div className={styles.noThumb}>
            <span>{content.type === 'video' ? '🎬' : '🎵'}</span>
          </div>
        )}
        <div className={styles.overlay}>
          <div className={styles.playBtn}>▶</div>
        </div>
        {content.duration && (
          <span className={styles.duration}>{formatDuration(content.duration)}</span>
        )}
        {content.isTutorial && (
          <span className={styles.tutorialTag}>Tutoriel</span>
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.meta}>
          <span className={`badge ${content.type === 'video' ? 'badge-video' : 'badge-audio'}`}>
            {content.type === 'video' ? '▶ Vidéo' : '♪ Audio'}
          </span>
          <span className={`badge ${accessBadge.cls}`}>
            {accessBadge.label}
          </span>
        </div>
        <h3 className={styles.title}>{content.title}</h3>
        {content.artist && <p className={styles.artist}>{content.artist}</p>}
        {content.category && <p className={styles.cat}>{content.category}</p>}
        <div className={styles.views}>
          {content.viewCount?.toLocaleString()} vues
        </div>
      </div>
    </div>
  )
}
