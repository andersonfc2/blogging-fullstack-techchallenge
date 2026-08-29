import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { getPostById, updatePost } from '../services/api'

function PostEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPost() {
      try {
        setLoading(true)
        setError('')

        const data = await getPostById(id)

        setFormData({
          title: data.title,
          content: data.content,
          author: data.author,
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadPost()
  }, [id])

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
      setSaving(true)
      setError('')

      await updatePost(id, formData)
      navigate(`/posts/${id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="form-page">
      <Link className="back-link" to={`/posts/${id}`}>
        Voltar para leitura
      </Link>

      <div className="form-panel">
        <p className="eyebrow">Docentes</p>
        <h1>Editar postagem</h1>
        <p className="subtitle">
          Atualize os dados abaixo para manter o conteúdo educacional correto.
        </p>

        {loading && <p className="status-message">Carregando post...</p>}

        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <form className="post-form" onSubmit={handleSubmit}>
            <label>
              Título
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Conteúdo
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows="8"
              />
            </label>

            <label>
              Autor
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
              />
            </label>

            <button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

export default PostEditPage
