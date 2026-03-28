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

  return (
    <div className={styles.root}>
      <nav className={styles.nav}>
        <NavLink to="/" className={styles.logo}>
          <span className={styles.logoIcon}>▶</span>
          StreamMG
        </NavLink>

        <div className={styles.navLinks}>
          <NavLink to="/" end className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
            Accueil
          </NavLink>
          <NavLink to="/catalogue" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
            Catalogue
          </NavLink>
          <NavLink to="/tutorials" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
            Tutoriels
          </NavLink>
          {user && (
            <NavLink to="/history" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
              Historique
            </NavLink>
          )}
          {isProvider() && (
            <NavLink to="/provider" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
              Provider
            </NavLink>
          )}
          {isAdmin() && (
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
