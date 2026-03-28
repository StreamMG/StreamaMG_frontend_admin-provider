// src/components/HLSPlayer.jsx
import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import { hlsAPI, historyAPI } from '../services/api'
import { useAccessGateStore } from '../stores/accessGateStore'
import styles from './HLSPlayer.module.css'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'

export default function HLSPlayer({ contentId, content }) {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [playing, setPlaying] = useState(false)
  const { show } = useAccessGateStore()

  useEffect(() => {
    let hls = null
    let progressInterval = null

    const initPlayer = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await hlsAPI.getToken(contentId)
        const hlsUrl = `${API_BASE}${data.hlsUrl}`

        const video = videoRef.current
        if (!video) return

        if (Hls.isSupported()) {
          hls = new Hls()
          hlsRef.current = hls
          hls.loadSource(hlsUrl)
          hls.attachMedia(video)

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setLoading(false)
          })

          hls.on(Hls.Events.ERROR, async (event, data) => {
            if (data.response?.code === 403) {
              // Token expiré → renouveller
              try {
                const { data: newData } = await hlsAPI.getToken(contentId)
                const newUrl = `${API_BASE}${newData.hlsUrl}`
                hls.loadSource(newUrl)
              } catch {
                setError('Session expirée, veuillez recharger.')
              }
            }
          })
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari natif HLS
          video.src = hlsUrl
          setLoading(false)
        } else {
          setError('Votre navigateur ne supporte pas la lecture HLS.')
          setLoading(false)
        }

        // Enregistrer la progression toutes les 30s
        progressInterval = setInterval(() => {
          if (!video.paused && video.currentTime > 0) {
            const completed = video.duration && video.currentTime / video.duration > 0.9
            historyAPI.save(contentId, {
              progress: Math.floor(video.currentTime),
              completed
            }).catch(() => {})
          }
        }, 30000)

      } catch (err) {
        const reason = err.response?.data?.reason
        if (reason) {
          show({
            reason,
            price: err.response?.data?.price,
            contentId
          })
        } else {
          setError(err.response?.data?.message || 'Erreur de lecture')
        }
        setLoading(false)
      }
    }

    initPlayer()

    return () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null }
      if (progressInterval) clearInterval(progressInterval)
    }
  }, [contentId])

  return (
    <div className={styles.player}>
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
          <span>Chargement du lecteur...</span>
        </div>
      )}
      {error && (
        <div className={styles.errorOverlay}>
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}
      <video
        ref={videoRef}
        controls
        className={styles.video}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        style={{ display: loading || error ? 'none' : 'block' }}
      />
    </div>
  )
}
