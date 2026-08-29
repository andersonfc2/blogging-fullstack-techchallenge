import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginTeacher } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setLoading(true)
      setError('')

      const data = await loginTeacher(formData)
      login(data)
      navigate('/admin')
    } catch (err) {
      setError('Email ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="form-page">
      <Link className="back-link" to="/">
        Voltar para posts
      </Link>

      <div className="form-panel">
        <p className="eyebrow">Área docente</p>
        <h1>Login de professor</h1>
        <p className="subtitle">
          Acesse para criar, editar e administrar postagens.
        </p>

        <form className="post-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default LoginPage