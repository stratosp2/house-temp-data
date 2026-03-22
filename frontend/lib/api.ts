const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const CACHE_REVALIDATE = 60;

export async function fetchOutsideData(days = 7) {
  const res = await fetch(`${API_URL}/api/outside?days=${days}`, { next: { revalidate: CACHE_REVALIDATE } });
  return res.json();
}

export async function fetchLatest() {
  const res = await fetch(`${API_URL}/api/outside/latest`, { next: { revalidate: CACHE_REVALIDATE } });
  return res.json();
}

export async function fetchStats(days = 7) {
  const res = await fetch(`${API_URL}/api/outside/stats?days=${days}`, { next: { revalidate: CACHE_REVALIDATE } });
  return res.json();
}

export async function fetchForecast() {
  const res = await fetch(`${API_URL}/api/forecast`, { next: { revalidate: CACHE_REVALIDATE } });
  return res.json();
}

export async function fetchDashboard() {
  const res = await fetch(`${API_URL}/api/dashboard`, { next: { revalidate: CACHE_REVALIDATE } });
  return res.json();
}

export async function fetchIndoorData(days = 7) {
  const res = await fetch(`${API_URL}/api/indoor?days=${days}`, { next: { revalidate: CACHE_REVALIDATE } });
  return res.json();
}

export async function fetchIndoorStats(days = 7) {
  const res = await fetch(`${API_URL}/api/indoor/stats?days=${days}`, { next: { revalidate: CACHE_REVALIDATE } });
  return res.json();
}
