import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getPostById } from '../services/api'

function PostReadPage() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPost() {
      try {
        setLoading(true)
        setError('')

        const data = await getPostById(id)
        setPost(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadPost()
  }, [id])

  return (
    <section className="read-page">
      <Link className="back-link" to="/">
        Voltar para posts
      </Link>

      {loading && <p className="status-message">Carregando post...</p>}

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && post && (
        <article className="post-full">
          <p className="eyebrow">Leitura</p>
          <h1>{post.title}</h1>
          <p className="post-author">Autor: {post.author}</p>
          <p className="post-content">{post.content}</p>

          <Link className="primary-link" to={`/posts/${post.id}/edit`}>
            Editar postagem
          </Link>
        </article>
      )}
    </section>
  )
}

export default PostReadPage