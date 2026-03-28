// src/pages/Login.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import styles from './Auth.module.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(email, password)
    if (result.success) navigate('/')
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>▶</span>
          <span>StreamMG</span>
        </div>
        <h1 className={styles.title}>Connexion</h1>
        <p className={styles.sub}>Accédez à votre espace streaming</p>

        {error && (
          <div className={styles.error} onClick={clearError}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Email</label>
            <input
              type="email" value={email} required
              placeholder="rabe@exemple.mg"
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label>Mot de passe</label>
            <input
              type="password" value={password} required
              placeholder="••••••••"
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.btnSubmit} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Se connecter'}
          </button>
        </form>

        <p className={styles.switch}>
          Pas encore de compte ?{' '}
          <Link to="/register">S'inscrire</Link>
        </p>

        <div className={styles.testCards}>
          <p>Cartes test Stripe :</p>
          <code>4242 4242 4242 4242</code> → ✅ Succès
          <br />
          <code>4000 0000 0000 9995</code> → ❌ Refus
        </div>
      </div>
    </div>
  )
}
