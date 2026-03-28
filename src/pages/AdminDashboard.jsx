// src/pages/AdminDashboard.jsx
import { useEffect, useState } from 'react'
import { adminAPI } from '../services/api'
import styles from './AdminDashboard.module.css'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [contents, setContents] = useState([])
  const [tab, setTab] = useState('stats')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [s, u, c] = await Promise.all([
          adminAPI.stats(),
          adminAPI.users(),
          adminAPI.contents(),
        ])
        setStats(s.data)
        setUsers(u.data.users || u.data || [])
        setContents(c.data.contents || c.data || [])
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const toggleUser = async (id, isActive) => {
    try {
      await adminAPI.updateUser(id, { isActive: !isActive })
      setUsers(u => u.map(x => x._id === id ? { ...x, isActive: !isActive } : x))
    } catch (err) { alert(err.response?.data?.message || 'Erreur') }
  }

  const togglePublish = async (id, isPublished) => {
    try {
      await adminAPI.updateContent(id, { isPublished: !isPublished })
      setContents(c => c.map(x => x._id === id ? { ...x, isPublished: !isPublished } : x))
    } catch (err) { alert(err.response?.data?.message || 'Erreur') }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  )

  return (
    <div className={styles.page}>
      <h1>Dashboard Admin</h1>

      <div className={styles.tabs}>
        {['stats','contents','users'].map(t => (
          <button
            key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {{ stats: '📊 Statistiques', contents: '🎬 Contenus', users: '👥 Utilisateurs' }[t]}
          </button>
        ))}
      </div>

      {tab === 'stats' && stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}><span>{stats.totalUsers}</span><small>Utilisateurs</small></div>
          <div className={styles.statCard}><span>{stats.premiumUsers}</span><small>Premium</small></div>
          <div className={styles.statCard}><span>{stats.totalContents}</span><small>Contenus</small></div>
          <div className={styles.statCard}><span>{stats.totalViews?.toLocaleString()}</span><small>Vues totales</small></div>
          <div className={styles.statCard}><span>{stats.recentPurchases30d}</span><small>Achats (30j)</small></div>
          <div className={styles.statCard}>
            <span>{((stats.revenueSimulated30d || 0) / 100).toLocaleString()} Ar</span>
            <small>Revenus (30j)</small>
          </div>

          {stats.topPurchasedContents?.length > 0 && (
            <div className={styles.topContents}>
              <h3>Top achats</h3>
              {stats.topPurchasedContents.map((c, i) => (
                <div key={i} className={styles.topItem}>
                  <span className={styles.topRank}>#{i+1}</span>
                  <div className={styles.topInfo}>
                    <div>{c.title}</div>
                    <small>{c.totalSales} ventes · {((c.totalRevenue||0)/100).toLocaleString()} Ar</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'contents' && (
        <div className={styles.list}>
          {contents.length === 0 ? (
            <p className={styles.empty}>Aucun contenu</p>
          ) : contents.map(c => (
            <div key={c._id} className={styles.row}>
              <div className={styles.rowInfo}>
                <div className={styles.rowTitle}>{c.title}</div>
                <div className={styles.rowMeta}>
                  <span className="badge badge-video">{c.type}</span>
                  <span className={`badge ${c.accessType === 'free' ? 'badge-free' : c.accessType === 'premium' ? 'badge-premium' : 'badge-paid'}`}>{c.accessType}</span>
                  <span className="badge" style={{ background: c.isPublished ? 'rgba(52,211,153,0.15)' : 'rgba(156,163,175,0.15)', color: c.isPublished ? 'var(--green)' : '#9ca3af' }}>
                    {c.isPublished ? 'Publié' : 'En attente'}
                  </span>
                </div>
              </div>
              <button
                className={`${styles.toggleBtn} ${c.isPublished ? styles.toggleOff : styles.toggleOn}`}
                onClick={() => togglePublish(c._id, c.isPublished)}
              >
                {c.isPublished ? 'Dépublier' : 'Publier'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className={styles.list}>
          {users.length === 0 ? (
            <p className={styles.empty}>Aucun utilisateur</p>
          ) : users.map(u => (
            <div key={u._id} className={styles.row}>
              <div className={styles.rowInfo}>
                <div className={styles.rowTitle}>{u.username} <span style={{ color: 'var(--text3)', fontWeight: 400, fontSize: 13 }}>{u.email}</span></div>
                <div className={styles.rowMeta}>
                  <span className="badge" style={{ background: 'rgba(124,106,247,0.15)', color: 'var(--accent2)' }}>{u.role}</span>
                  {u.isPremium && <span className="badge badge-premium">Premium</span>}
                  <span className="badge" style={{ background: u.isActive ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)', color: u.isActive ? 'var(--green)' : 'var(--red)' }}>
                    {u.isActive ? 'Actif' : 'Suspendu'}
                  </span>
                </div>
              </div>
              {u.role !== 'admin' && (
                <button
                  className={`${styles.toggleBtn} ${u.isActive ? styles.toggleOff : styles.toggleOn}`}
                  onClick={() => toggleUser(u._id, u.isActive)}
                >
                  {u.isActive ? 'Suspendre' : 'Réactiver'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
