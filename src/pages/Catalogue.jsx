// src/pages/Catalogue.jsx
import { useEffect, useState, useCallback } from 'react'
import { contentsAPI } from '../services/api'
import ContentCard from '../components/ContentCard'
import styles from './Catalogue.module.css'

const CATEGORIES = ['', 'film', 'salegy', 'hira_gasy', 'tsapiky', 'beko', 'documentaire', 'podcast', 'tutoriel']
const TYPES = ['', 'video', 'audio']
const ACCESS_TYPES = ['', 'free', 'premium', 'paid']

export default function Catalogue() {
  const [contents, setContents] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(false)

  const [filters, setFilters] = useState({
    type: '', category: '', accessType: '', search: '', isTutorial: '',
  })

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const params = { page: p, limit: 12 }
      if (filters.type) params.type = filters.type
      if (filters.category) params.category = filters.category
      if (filters.accessType) params.accessType = filters.accessType
      if (filters.search) params.search = filters.search
      if (filters.isTutorial) params.isTutorial = filters.isTutorial

      const { data } = await contentsAPI.list(params)
      setContents(data.contents || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
      setPage(p)
    } catch {
      setContents([])
    }
    setLoading(false)
  }, [filters])

  useEffect(() => { load(1) }, [filters])

  const setFilter = (k) => (e) => {
    setFilters(f => ({ ...f, [k]: e.target.value }))
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Catalogue</h1>
        <span className={styles.count}>{total} contenus</span>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="text" placeholder="🔍 Rechercher..."
          value={filters.search}
          onChange={setFilter('search')}
          className={styles.search}
        />
        <select value={filters.type} onChange={setFilter('type')}>
          <option value="">Tous les types</option>
          <option value="video">Vidéo</option>
          <option value="audio">Audio</option>
        </select>
        <select value={filters.category} onChange={setFilter('category')}>
          <option value="">Toutes les catégories</option>
          {CATEGORIES.filter(Boolean).map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={filters.accessType} onChange={setFilter('accessType')}>
          <option value="">Tous les accès</option>
          <option value="free">Gratuit</option>
          <option value="premium">Premium</option>
          <option value="paid">Payant</option>
        </select>
        <select value={filters.isTutorial} onChange={setFilter('isTutorial')}>
          <option value="">Tout</option>
          <option value="true">Tutoriels seulement</option>
          <option value="false">Hors tutoriels</option>
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <div className={styles.loading}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      ) : contents.length === 0 ? (
        <div className={styles.empty}>
          <p>Aucun contenu trouvé</p>
          <small>Vérifiez que le backend est démarré ou modifiez les filtres</small>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {contents.map(c => <ContentCard key={c._id} content={c} />)}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={page <= 1}
                onClick={() => load(page - 1)}
              >← Précédent</button>
              <span className={styles.pageInfo}>{page} / {pages}</span>
              <button
                className={styles.pageBtn}
                disabled={page >= pages}
                onClick={() => load(page + 1)}
              >Suivant →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
