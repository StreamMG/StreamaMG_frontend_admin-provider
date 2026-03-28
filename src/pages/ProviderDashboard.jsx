// src/pages/ProviderDashboard.jsx
import { useEffect, useState, useRef } from 'react'
import { providerAPI } from '../services/api'
import styles from './ProviderDashboard.module.css'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'

export default function ProviderDashboard() {
  const [contents, setContents] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const formRef = useRef()

  const [form, setForm] = useState({
    title: '', description: '', type: 'video',
    category: 'film', language: 'mg', accessType: 'free', price: ''
  })
  const [thumbnail, setThumbnail] = useState(null)
  const [media, setMedia] = useState(null)
  const [thumbPreview, setThumbPreview] = useState(null)

  const loadContents = async () => {
    try {
      const { data } = await providerAPI.list()
      setContents(data.contents || data || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { loadContents() }, [])

  const setField = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleThumbnail = (e) => {
    const f = e.target.files[0]
    setThumbnail(f)
    if (f) setThumbPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!thumbnail) { setUploadError('La vignette est obligatoire.'); return }
    if (!media) { setUploadError('Le fichier média est obligatoire.'); return }

    setUploading(true); setUploadError(null)
    const fd = new FormData()
    fd.append('thumbnail', thumbnail)
    fd.append('media', media)
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })

    try {
      await providerAPI.upload(fd)
      setShowForm(false)
      setForm({ title: '', description: '', type: 'video', category: 'film', language: 'mg', accessType: 'free', price: '' })
      setThumbnail(null); setMedia(null); setThumbPreview(null)
      loadContents()
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Erreur upload')
    }
    setUploading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce contenu ?')) return
    try {
      await providerAPI.delete(id)
      setContents(c => c.filter(x => x._id !== id))
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Dashboard Provider</h1>
        <button className={styles.btnNew} onClick={() => setShowForm(f => !f)}>
          {showForm ? '✕ Annuler' : '+ Nouveau contenu'}
        </button>
      </div>

      {showForm && (
        <div className={styles.uploadForm}>
          <h2>Uploader un contenu</h2>
          {uploadError && <div className={styles.error}>⚠️ {uploadError}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label>Titre *</label>
                <input value={form.title} onChange={setField('title')} required placeholder="Titre du contenu" />
              </div>
              <div className={styles.field}>
                <label>Type *</label>
                <select value={form.type} onChange={setField('type')}>
                  <option value="video">Vidéo</option>
                  <option value="audio">Audio</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Catégorie</label>
                <select value={form.category} onChange={setField('category')}>
                  {['film','salegy','hira_gasy','tsapiky','beko','documentaire','podcast','tutoriel'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>Accès</label>
                <select value={form.accessType} onChange={setField('accessType')}>
                  <option value="free">Gratuit</option>
                  <option value="premium">Premium</option>
                  <option value="paid">Payant</option>
                </select>
              </div>
              {form.accessType === 'paid' && (
                <div className={styles.field}>
                  <label>Prix (Ariary)</label>
                  <input type="number" value={form.price} onChange={setField('price')} placeholder="800000" />
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label>Description</label>
              <textarea value={form.description} onChange={setField('description')} rows={3} placeholder="Description..." />
            </div>

            <div className={styles.fileGrid}>
              <div className={styles.fileField}>
                <label>
                  🖼️ Vignette <span className={styles.required}>OBLIGATOIRE</span>
                  <div className={styles.fileInput}>
                    {thumbPreview
                      ? <img src={thumbPreview} alt="preview" className={styles.thumbPreview} />
                      : <div className={styles.filePlaceholder}>Cliquez pour choisir (JPEG/PNG ≤ 5Mo)</div>
                    }
                    <input type="file" accept="image/jpeg,image/png" onChange={handleThumbnail} hidden />
                  </div>
                </label>
              </div>
              <div className={styles.fileField}>
                <label>
                  🎬 Fichier média <span className={styles.required}>OBLIGATOIRE</span>
                  <div className={`${styles.fileInput} ${media ? styles.fileSelected : ''}`}>
                    <div className={styles.filePlaceholder}>
                      {media ? `✅ ${media.name}` : 'Cliquez pour choisir (MP4/MP3)'}
                    </div>
                    <input type="file" accept="video/mp4,audio/mpeg,audio/mp4" onChange={e => setMedia(e.target.files[0])} hidden />
                  </div>
                </label>
              </div>
            </div>

            <button type="submit" className={styles.btnSubmit} disabled={uploading || !thumbnail}>
              {uploading ? <><span className="spinner" /> Upload en cours...</> : '⬆ Uploader le contenu'}
            </button>
          </form>
        </div>
      )}

      {/* Contents list */}
      <div className={styles.contentList}>
        <h2>Mes contenus ({contents.length})</h2>
        {loading ? (
          <div className={styles.center}><div className="spinner" style={{ width: 36, height: 36 }} /></div>
        ) : contents.length === 0 ? (
          <p className={styles.empty}>Aucun contenu. Uploadez votre premier contenu !</p>
        ) : (
          <div className={styles.table}>
            {contents.map(c => {
              const thumb = c.thumbnail ? `${API_BASE}${c.thumbnail}` : null
              return (
                <div key={c._id} className={styles.row}>
                  <div className={styles.rowThumb}>
                    {thumb ? <img src={thumb} alt={c.title} /> : <span>🎬</span>}
                  </div>
                  <div className={styles.rowInfo}>
                    <div className={styles.rowTitle}>{c.title}</div>
                    <div className={styles.rowMeta}>
                      <span className={`badge ${c.type === 'video' ? 'badge-video' : 'badge-audio'}`}>{c.type}</span>
                      <span className={`badge ${c.accessType === 'free' ? 'badge-free' : c.accessType === 'premium' ? 'badge-premium' : 'badge-paid'}`}>{c.accessType}</span>
                      {!c.isPublished && <span className="badge" style={{ background: 'rgba(156,163,175,0.15)', color: '#9ca3af' }}>En attente</span>}
                    </div>
                  </div>
                  <div className={styles.rowActions}>
                    <button className={styles.btnDel} onClick={() => handleDelete(c._id)}>Supprimer</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
