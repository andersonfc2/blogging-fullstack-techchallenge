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