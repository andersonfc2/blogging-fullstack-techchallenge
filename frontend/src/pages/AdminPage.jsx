import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { deletePost as deletePostById, getPosts } from '../services/api'

function AdminPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadPosts() {
    try {
      setLoading(true)
      setError('')

      const data = await getPosts()
      setPosts(data)  
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function deletePost(id) {
    const confirmed = window.confirm('Tem certeza que deseja excluir esta postagem?')

    if (!confirmed) {
      return
    }

    try {
      setError('')

      await deletePostById(id)
      loadPosts()
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  return (
    <section className="admin-page">
      <Link className="back-link" to="/">
        Voltar para posts
      </Link>

      <header className="app-header">
        <p className="eyebrow">Administração</p>
        <h1>Gerenciar postagens</h1>
        <p className="subtitle">
          Edite ou remova conteúdos publicados na plataforma educacional.
        </p>
      </header>

      {loading && <p className="status-message">Carregando posts...</p>}

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && posts.length === 0 && (
        <p className="status-message">Nenhuma postagem cadastrada.</p>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="admin-list">
          {posts.map((post) => (
            <article className="admin-item" key={post.id}>
              <div>
                <h2>{post.title}</h2>
                <p>Autor: {post.author}</p>
              </div>

              <div className="admin-actions">
                <Link className="small-link" to={`/posts/${post.id}`}>
                  Ver
                </Link>

                <Link className="small-link" to={`/posts/${post.id}/edit`}>
                  Editar
                </Link>

                <button type="button" onClick={() => deletePost(post.id)}>
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default AdminPage