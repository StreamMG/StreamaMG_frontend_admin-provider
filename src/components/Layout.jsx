// src/components/Layout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import styles from './Layout.module.css'

export default function Layout() {
  const { user, logout, isPremium, isAdmin, isProvider } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Déterminer le rôle
  const role = user?.role || 'guest'

  return (
    <div className={styles.root}>
      <nav className={styles.nav}>
        <NavLink to="/" className={styles.logo}>
          <span className={styles.logoIcon}>▶</span>
          StreamMG
        </NavLink>

        <div className={styles.navLinks}>
          {/* Non connecté + user + premium : voient Accueil */}
          {(role === 'guest' || role === 'user' || role === 'premium') && (
            <NavLink to="/" end className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
              Accueil
            </NavLink>
          )}

          {/* Non connecté + user + premium : voient Catalogue */}
          {(role === 'guest' || role === 'user' || role === 'premium') && (
            <NavLink to="/catalogue" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
              Catalogue
            </NavLink>
          )}

          {/* Non connecté + user + premium : voient Tutoriels */}
          {(role === 'guest' || role === 'user' || role === 'premium') && (
            <NavLink to="/tutorials" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
              Tutoriels
            </NavLink>
          )}

          {/* user + premium : voient Historique */}
          {(role === 'user' || role === 'premium') && (
            <NavLink to="/history" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
              Historique
            </NavLink>
          )}

          {/* provider : voit UNIQUEMENT Provider */}
          {role === 'provider' && (
            <NavLink to="/provider" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
              Provider
            </NavLink>
          )}

          {/* admin : voit UNIQUEMENT Admin */}
          {role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
              Admin
            </NavLink>
          )}
        </div>

        <div className={styles.navRight}>
          {user ? (
            <>
              <NavLink to="/payments" className={styles.userBadge}>
                {isPremium() ? (
                  <span className="badge badge-premium">★ Premium</span>
                ) : (
                  <span className={styles.userName}>{user.username}</span>
                )}
              </NavLink>
              <button className={styles.btnLogout} onClick={handleLogout}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={styles.btnLogin}>Connexion</NavLink>
              <NavLink to="/register" className={styles.btnRegister}>S'inscrire</NavLink>
            </>
          )}
        </div>
      </nav>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}