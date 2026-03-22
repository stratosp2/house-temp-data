import './globals.css';
import Dashboard from './Dashboard';
import { fetchOutsideData, fetchStats, fetchIndoorData, fetchIndoorStats } from '@/lib/api';

export const revalidate = 60;

async function getData(days: number = 7) {
  const [dataRes, statsRes, indoorRes, indoorStatsRes] = await Promise.all([
    fetchOutsideData(days),
    fetchStats(days),
    fetchIndoorData(days),
    fetchIndoorStats(days)
  ]);

  return {
    data: dataRes.data || [],
    dateRange: dataRes.date_range,
    stats: statsRes.temperature ? statsRes : null,
    indoorData: indoorRes.data || [],
    indoorStats: indoorStatsRes || null
  };
}

export default async function Home({ searchParams }: { searchParams: { days?: string } }) {
  const days = parseInt(searchParams.days || '7');
  const initialData = await getData(days);

  return (
    <main>
      <Dashboard initialData={initialData} />
    </main>
  );
}
