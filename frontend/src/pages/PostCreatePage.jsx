import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { createPost } from '../services/api'

function PostCreatePage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
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

      const createdPost = await createPost(formData)
      navigate(`/posts/${createdPost.id}`)
    } catch (err) {
      setError(err.message)
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
        <p className="eyebrow">Docentes</p>
        <h1>Criar postagem</h1>
        <p className="subtitle">
          Preencha os dados abaixo para publicar um novo conteúdo educacional.
        </p>

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

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Criando...' : 'Criar post'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default PostCreatePage