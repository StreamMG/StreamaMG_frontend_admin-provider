// src/pages/Register.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import styles from './Auth.module.css'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const { register, loading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await register(form.username, form.email, form.password)
    if (result.success) navigate('/')
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>▶</span>
          <span>StreamMG</span>
        </div>
        <h1 className={styles.title}>Créer un compte</h1>
        <p className={styles.sub}>Rejoignez la plateforme streaming malagasy</p>

        {error && (
          <div className={styles.error} onClick={clearError}>⚠️ {error}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Nom d'utilisateur</label>
            <input
              type="text" value={form.username} required minLength={3}
              placeholder="Rabe"
              onChange={set('username')}
            />
          </div>
          <div className={styles.field}>
            <label>Email</label>
            <input
              type="email" value={form.email} required
              placeholder="rabe@exemple.mg"
              onChange={set('email')}
            />
          </div>
          <div className={styles.field}>
            <label>Mot de passe</label>
            <input
              type="password" value={form.password} required minLength={6}
              placeholder="••••••••"
              onChange={set('password')}
            />
          </div>

          <button type="submit" className={styles.btnSubmit} disabled={loading}>
            {loading ? <span className="spinner" /> : "S'inscrire"}
          </button>
        </form>

        <p className={styles.switch}>
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
