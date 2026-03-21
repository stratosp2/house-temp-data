const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

const API_URL = getApiUrl();

export async function fetchOutsideData(days = 7) {
  const res = await fetch(`${API_URL}/api/outside?days=${days}`);
  return res.json();
}

export async function fetchLatest() {
  const res = await fetch(`${API_URL}/api/outside/latest`);
  return res.json();
}

export async function fetchStats(days = 7) {
  const res = await fetch(`${API_URL}/api/outside/stats?days=${days}`);
  return res.json();
}

export async function fetchForecast() {
  const res = await fetch(`${API_URL}/api/forecast`);
  return res.json();
}

export async function fetchDashboard() {
  const res = await fetch(`${API_URL}/api/dashboard`);
  return res.json();
}

export async function fetchIndoorData(days = 7) {
  const res = await fetch(`${API_URL}/api/indoor?days=${days}`);
  return res.json();
}

export async function fetchIndoorStats(days = 7) {
  const res = await fetch(`${API_URL}/api/indoor/stats?days=${days}`);
  return res.json();
}
