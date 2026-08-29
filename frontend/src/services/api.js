const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request(path, options = {}) {
  const savedAuth = localStorage.getItem('authData')
  const authData = savedAuth ? JSON.parse(savedAuth) : null

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (authData?.token) {
    headers.Authorization = `Bearer ${authData.token}`
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error('Erro ao se comunicar com a API.')
  }

  return response.json()
}

export function getPosts() {
  return request('/posts')
}

export function searchPostsByTerm(term) {
  return request(`/posts/search?term=${encodeURIComponent(term)}`)
}

export function getPostById(id) {
  return request(`/posts/${id}`)
}

export function createPost(postData) {
  return request('/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  })
}

export function updatePost(id, postData) {
  return request(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(postData),
  })
}

export function deletePost(id) {
  return request(`/posts/${id}`, {
    method: 'DELETE',
  })
}

export function loginTeacher(credentials) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}