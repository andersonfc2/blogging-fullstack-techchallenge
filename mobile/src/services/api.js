const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function loginTeacher({ email, password }) {
  if (!API_URL) {
    throw new Error('Configure EXPO_PUBLIC_API_URL no arquivo mobile/.env.');
  }

  let response;

  try {
    response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error('Não foi possível conectar à API. Confira sua conexão.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Não foi possível realizar o login.');
  }

  return data;
}

/**
 * @param {string} path
 * @param {{ signal?: AbortSignal }} options
 */
async function get(path, { signal } = {}) {
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
    let response;
    try {
      response = await fetch(`${API_URL.replace(/\/$/, '')}${path}`, {
        signal: controller.signal,
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      throw new Error(timedOut
        ? 'A API demorou para responder. Tente novamente.'
        : 'Não foi possível conectar à API. Confira sua conexão.');
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Não foi possível carregar os posts.');
    }
    return data;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancel);
  }
}

export function getPosts(options) {
  return get('/posts', options);
}

export function searchPostsByTerm(term, options) {
  const normalizedTerm = term.trim();
  if (!normalizedTerm) return getPosts(options);
  return get(`/posts/search?term=${encodeURIComponent(normalizedTerm)}`, options);
}

export function getPostById(id, options) {
  return get(`/posts/${encodeURIComponent(String(id))}`, options);
}
