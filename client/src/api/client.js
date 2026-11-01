// Tiny fetch wrapper: adds the JWT, parses JSON and throws readable errors.
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function api(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(body && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail = data.details?.map((d) => d.message).join(', ');
    throw new Error(detail || data.message || `Request failed (${res.status})`);
  }
  return data;
}

export const formatPrice = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
