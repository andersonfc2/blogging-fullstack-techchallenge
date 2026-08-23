import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API_URL = 'http://localhost:3000'

function PostsListPage() {
  const [posts, setPosts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadPosts() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`${API_URL}/posts`)

      if (!response.ok) {
        throw new Error('Não foi possível carregar os posts.')
      }

      const data = await response.json()
      setPosts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function searchPosts(event) {
    event.preventDefault()

    if (!searchTerm.trim()) {
      loadPosts()
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        `${API_URL}/posts/search?term=${encodeURIComponent(searchTerm)}`
      )

      if (!response.ok) {
        throw new Error('Não foi possível buscar os posts.')
      }

      const data = await response.json()
      setPosts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  return (
    <>
      <header className="app-header">
        <p className="eyebrow">Tech Challenge - Fase 3</p>
        <h1>Blogging Educacional</h1>
        <p className="subtitle">
          Consulte postagens criadas por docentes e encontre conteúdos por palavra-chave.
        </p>
      </header>

      <section className="toolbar" aria-label="Busca de postagens">
        <form onSubmit={searchPosts} className="search-form">
          <input
            type="search"
            placeholder="Buscar por título ou conteúdo"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Buscar posts"
          />

          <button type="submit">Buscar</button>

          <button type="button" onClick={loadPosts} className="secondary-button">
            Limpar
          </button>
        </form>
      </section>

      <section className="posts-section" aria-label="Lista de postagens">
        {loading && <p className="status-message">Carregando posts...</p>}

        {error && <p className="error-message">{error}</p>}

        {!loading && !error && posts.length === 0 && (
          <p className="status-message">Nenhum post encontrado.</p>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="post-list">
            {posts.map((post) => (
              <article className="post-card" key={post.id}>
                <h2>{post.title}</h2>
                <p className="post-author">Autor: {post.author}</p>
                <p>{post.content}</p>
                <Link className="read-link" to={`/posts/${post.id}`}>
                  Ler post completo
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export default PostsListPage