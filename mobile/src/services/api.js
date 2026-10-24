const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function loginTeacher({ email, password }) {
  return request('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

/**
 * @param {string} path
 * @param {{ signal?: AbortSignal, method?: string, token?: string, body?: object }} options
 */
async function request(path, { signal, method = 'GET', token, body } = {}) {
  if (!API_URL) {
    throw new Error('Configure EXPO_PUBLIC_API_URL no arquivo mobile/.env.');
  }

  const controller = new AbortController();
  let timedOut = false;
  const cancel = () => controller.abort();
  signal?.addEventListener('abort', cancel);
  if (signal?.aborted) controller.abort();

  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 15000);

  try {
    const response = await fetch(`${API_URL.replace(/\/$/, '')}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (response.status === 204) return null;
    const data = await response.json();
    if (!response.ok) {
      throw Object.assign(
        new Error(data.error || 'Não foi possível realizar a operação.'),
        { status: response.status }
      );
    }
    return data;
  } catch (error) {
    if (signal?.aborted) throw error;
    if (timedOut || error instanceof TypeError) {
      const message = timedOut
        ? 'A API demorou para responder.'
        : 'Não foi possível conectar à API.';
      const guidance = method === 'GET' || path === '/auth/login'
        ? ' Confira sua conexão e tente novamente.'
        : ' Confira a lista antes de repetir a operação.';
      throw new Error(message + guidance);
    }
    if (error instanceof SyntaxError) {
      throw new Error('A API retornou uma resposta inválida. Tente novamente.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancel);
  }
}

export function getPosts(options) {
  return request('/posts', options);
}

export function searchPostsByTerm(term, options) {
  const normalizedTerm = term.trim();
  if (!normalizedTerm) return getPosts(options);
  return request(`/posts/search?term=${encodeURIComponent(normalizedTerm)}`, options);
}

export function getPostById(id, options) {
  return request(`/posts/${encodeURIComponent(String(id))}`, options);
}

function requireToken(token) {
  if (!token) {
    throw Object.assign(new Error('Faça login novamente para continuar.'), { status: 401 });
  }
}

export async function createPost(data, token) {
  requireToken(token);
  return request('/posts', { method: 'POST', token, body: data });
}

export async function updatePost(id, data, token) {
  requireToken(token);
  return request(`/posts/${encodeURIComponent(String(id))}`, {
    method: 'PUT', token, body: data,
  });
}

export async function deletePost(id, token) {
  requireToken(token);
  return request(`/posts/${encodeURIComponent(String(id))}`, { method: 'DELETE', token });
}

/**
 * @param {string} token
 * @param {{ page?: number, limit?: number, signal?: AbortSignal }} options
 */
export async function getTeachers(token, { page = 1, limit = 5, signal } = {}) {
  requireToken(token);
  return request(`/teachers?page=${encodeURIComponent(String(page))}&limit=${encodeURIComponent(String(limit))}`, {
    token, signal,
  });
}

/**
 * @param {number | string} id
 * @param {string} token
 * @param {{ signal?: AbortSignal }} options
 */
export async function getTeacherById(id, token, { signal } = {}) {
  requireToken(token);
  return request(`/teachers/${encodeURIComponent(String(id))}`, { token, signal });
}

export async function createTeacher(data, token) {
  requireToken(token);
  return request('/teachers', { method: 'POST', token, body: data });
}

export async function updateTeacher(id, data, token) {
  requireToken(token);
  return request(`/teachers/${encodeURIComponent(String(id))}`, {
    method: 'PUT', token, body: data,
  });
}

export async function deleteTeacher(id, token) {
  requireToken(token);
  return request(`/teachers/${encodeURIComponent(String(id))}`, { method: 'DELETE', token });
}
