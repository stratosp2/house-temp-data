const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchOutsideData(days = 7) {
  const res = await fetch(`${API_URL}/api/outside?days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export async function fetchLatest() {
  const res = await fetch(`${API_URL}/api/outside/latest`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export async function fetchStats(days = 7) {
  const res = await fetch(`${API_URL}/api/outside/stats?days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export async function fetchForecast() {
  const res = await fetch(`${API_URL}/api/forecast`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export async function fetchDashboard() {
  const res = await fetch(`${API_URL}/api/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export async function fetchIndoorData(days = 7) {
  const res = await fetch(`${API_URL}/api/indoor?days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export async function fetchIndoorStats(days = 7) {
  const res = await fetch(`${API_URL}/api/indoor/stats?days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}
