'use client';

import React, { useState, useEffect } from 'react';
import { fetchStats, fetchOutsideData, fetchIndoorData, fetchIndoorStats } from '@/lib/api';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, Legend, AreaChart } from 'recharts';
import { format } from 'date-fns';

interface WeatherData {
  datetime: string;
  temperature: number;
  humidity: number;
  pressure: number;
  voltage?: number;
}

interface Stats {
  temperature: { min: number; max: number; mean: number; current: number };
  humidity: { min: number; max: number; mean: number; current: number };
  pressure: { min: number; max: number; mean: number; current: number };
}

interface IndoorStats {
  bedroom: {
    temp: { min: number | null; max: number | null; mean: number | null; current: number | null };
    humidity: { min: number | null; max: number | null; mean: number | null; current: number | null };
  };
  living_room?: { temp: { min: number | null; max: number | null; mean: number | null; current: number | null } };
  kitchen?: { temp: { min: number | null; max: number | null; mean: number | null; current: number | null } };
}

const StatCard = ({ title, value, unit, min, max, avg, color, icon, lastUpdate }: {
  title: string;
  value: number | null;
  unit: string;
  min: number | null;
  max: number | null;
  avg: number | null;
  color: string;
  icon: React.ReactNode;
  lastUpdate?: string | null;
}) => (
  <div className="stat-card" style={{ '--card-accent': color } as React.CSSProperties}>
    <div className="stat-header">
      <span className="stat-icon" style={{ color }}>{icon}</span>
      <span className="stat-title">{title}</span>
    </div>
    <div className="stat-value" style={{ color }}>
      {value?.toFixed(1) ?? '--'}<span className="stat-unit">{unit}</span>
    </div>
    {lastUpdate && <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>Last: {lastUpdate}</div>}
    <div className="stat-details">
      <div className="stat-detail">
        <span className="detail-label">Min</span>
        <span className="detail-value">{min?.toFixed(1) ?? '--'}{unit}</span>
      </div>
      <div className="stat-detail">
        <span className="detail-label">Max</span>
        <span className="detail-value">{max?.toFixed(1) ?? '--'}{unit}</span>
      </div>
      <div className="stat-detail">
        <span className="detail-label">Avg</span>
        <span className="detail-value">{avg?.toFixed(1) ?? '--'}{unit}</span>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState<WeatherData[]>([]);
  const [indoorData, setIndoorData] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [indoorStats, setIndoorStats] = useState<IndoorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [days]);

  async function loadData() {
    setLoading(true);
    try {
      const [dataRes, statsRes, indoorRes, indoorStatsRes] = await Promise.all([
        fetchOutsideData(days),
        fetchStats(days),
        fetchIndoorData(days),
        fetchIndoorStats(days)
      ]);
      
      if (dataRes.data) {
        setData(dataRes.data);
        setLastUpdated(dataRes.date_range?.end || null);
      }
      if (statsRes.temperature) {
        setStats(statsRes);
      }
      if (indoorStatsRes) {
        setIndoorStats(indoorStatsRes);
      }
      if (indoorRes && !indoorRes.error && indoorRes.data && indoorRes.data.length > 0) {
        setIndoorData(indoorRes.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
    setLoading(false);
  }

  function formatDateTime(value: any) {
    try {
      const d = value instanceof Date ? value : new Date(value);
      return format(d, 'MMM dd, HH:mm');
    } catch {
      return String(value);
    }
  }

  function formatShortDate(value: any) {
    try {
      const d = value instanceof Date ? value : new Date(value);
      return format(d, 'MMM dd HH:mm');
    } catch {
      return String(value);
    }
  }

  function formatTime(value: any) {
    try {
      const d = value instanceof Date ? value : new Date(value);
      return format(d, 'HH:mm');
    } catch {
      return String(value);
    }
  }

  const chartData: any = data.map(d => ({
    ...d,
    datetime: new Date(d.datetime).getTime(),
    bedroom_temp: null,
    living_room_temp: null,
    kitchen_temp: null,
    indoor_humidity: null
  }));

  indoorData.forEach((indoor: any) => {
    const ts = new Date(indoor.datetime).getTime();
    const existing = chartData.find((d: any) => d.datetime === ts);
    if (existing) {
      if (indoor.bedroom_temp) existing.bedroom_temp = indoor.bedroom_temp;
      if (indoor.living_room_temp) existing.living_room_temp = indoor.living_room_temp;
      if (indoor.kitchen_temp) existing.kitchen_temp = indoor.kitchen_temp;
      if (indoor.bedroom_humidity) existing.indoor_humidity = indoor.bedroom_humidity;
    }
  });

  chartData.sort((a: any, b: any) => a.datetime - b.datetime);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading weather data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon"></span>
            <h1>Weather Dashboard</h1>
          </div>
          <span className="status-badge">
            <span className="status-dot"></span>
            Live
          </span>
        </div>
        <div className="controls">
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="select-input">
            <option value={1}>1 Day</option>
            <option value={7}>7 Days</option>
            <option value={14}>14 Days</option>
            <option value={30}>30 Days</option>
          </select>
          <button onClick={() => loadData()} className="refresh-button">Refresh</button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ color: '#94a3b8', marginBottom: '12px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>OUTSIDE</h3>
          <div className="stats-grid">
            <StatCard
              title="Temperature"
              value={stats?.temperature.current ?? null}
              unit="°C"
              min={stats?.temperature.min ?? null}
              max={stats?.temperature.max ?? null}
              avg={stats?.temperature.mean ?? null}
              color="#3b82f6"
              lastUpdate={lastUpdated}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>}
            />
            <StatCard
              title="Humidity"
              value={stats?.humidity.current ?? null}
              unit="%"
              min={stats?.humidity.min ?? null}
              max={stats?.humidity.max ?? null}
              avg={stats?.humidity.mean ?? null}
              color="#10b981"
              lastUpdate={lastUpdated}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>}
            />
            <StatCard
              title="Pressure"
              value={stats?.pressure.current ?? null}
              unit=" hPa"
              min={stats?.pressure.min ?? null}
              max={stats?.pressure.max ?? null}
              avg={stats?.pressure.mean ?? null}
              color="#8b5cf6"
              lastUpdate={lastUpdated}
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
            />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ color: '#94a3b8', marginBottom: '12px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>INSIDE</h3>
          <div className="stats-grid">
            {indoorStats?.bedroom?.temp && (
              <StatCard
                title="Bedroom Temp"
                value={indoorStats.bedroom.temp.current}
                unit="°C"
                min={indoorStats.bedroom.temp.min}
                max={indoorStats.bedroom.temp.max}
                avg={indoorStats.bedroom.temp.mean}
                color="#f59e0b"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>}
              />
            )}
            {indoorStats?.bedroom?.humidity && (
              <StatCard
                title="Bedroom Humidity"
                value={indoorStats.bedroom.humidity.current}
                unit="%"
                min={indoorStats.bedroom.humidity.min}
                max={indoorStats.bedroom.humidity.max}
                avg={indoorStats.bedroom.humidity.mean}
                color="#06b6d4"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>}
              />
            )}
            {indoorStats?.living_room?.temp && (
              <StatCard
                title="Living Room Temp"
                value={indoorStats.living_room.temp.current}
                unit="°C"
                min={indoorStats.living_room.temp.min}
                max={indoorStats.living_room.temp.max}
                avg={indoorStats.living_room.temp.mean}
                color="#ec4899"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>}
              />
            )}
            {indoorStats?.kitchen?.temp && (
              <StatCard
                title="Kitchen Temp"
                value={indoorStats.kitchen.temp.current}
                unit="°C"
                min={indoorStats.kitchen.temp.min}
                max={indoorStats.kitchen.temp.max}
                avg={indoorStats.kitchen.temp.mean}
                color="#22c55e"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>}
              />
            )}
          </div>
        </div>
      </div>

      <div className="chart-container main-chart">
        <h2 className="chart-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
          </svg>
          Temperature (All)
        </h2>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="datetime" tickFormatter={days <= 1 ? formatTime : formatShortDate} stroke="#64748b" fontSize={11} angle={-45} textAnchor="end" height={60} />
              <YAxis stroke="#64748b" fontSize={12} unit="°C" />
              <Tooltip 
                labelFormatter={(value) => format(new Date(value), 'MMM dd, HH:mm')}
                formatter={(value: number, name: string) => value != null ? [`${value.toFixed(1)}°C`, name] : ['--', name]}
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Area type="monotone" dataKey="temperature" stroke="#3b82f6" strokeWidth={2.5} fill="url(#tempGradient)" dot={false} name="Outside" />
              <Line type="monotone" dataKey="bedroom_temp" stroke="#f59e0b" strokeWidth={2} dot={false} name="Bedroom" connectNulls={false} />
              <Line type="monotone" dataKey="living_room_temp" stroke="#ec4899" strokeWidth={2} dot={false} name="Living Room" connectNulls={false} />
              <Line type="monotone" dataKey="kitchen_temp" stroke="#22c55e" strokeWidth={2} dot={false} name="Kitchen" connectNulls={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h2 className="chart-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
            Humidity (All)
          </h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="datetime" tickFormatter={days <= 1 ? formatTime : formatShortDate} stroke="#64748b" fontSize={11} angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="#64748b" fontSize={12} unit="%" />
                <Tooltip 
                  labelFormatter={(value) => format(new Date(value), 'MMM dd, HH:mm')}
                  formatter={(value: number, name: string) => value != null ? [`${value.toFixed(0)}%`, name] : ['--', name]}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Legend />
                <Line type="monotone" dataKey="humidity" stroke="#10b981" strokeWidth={2.5} dot={false} name="Outside" connectNulls={false} />
                <Line type="monotone" dataKey="indoor_humidity" stroke="#06b6d4" strokeWidth={2.5} dot={false} name="Inside" connectNulls={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container">
          <h2 className="chart-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            Pressure
          </h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="pressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="datetime" tickFormatter={days <= 1 ? formatTime : formatShortDate} stroke="#64748b" fontSize={11} angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="#64748b" fontSize={12} unit=" hPa" />
                <Tooltip 
                  labelFormatter={(value) => format(new Date(value), 'MMM dd, HH:mm')}
                  formatter={(value: number) => value != null ? [`${value.toFixed(0)} hPa`, 'Pressure'] : ['--', 'Pressure']}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Area type="monotone" dataKey="pressure" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#pressGradient)" dot={false} name="Pressure" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container">
          <h2 className="chart-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/>
            </svg>
            Voltage
          </h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="voltGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="datetime" tickFormatter={days <= 1 ? formatTime : formatShortDate} stroke="#64748b" fontSize={11} angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="#64748b" fontSize={12} unit="V" domain={[2.5, 5]} />
                <Tooltip 
                  labelFormatter={(value) => format(new Date(value), 'MMM dd, HH:mm')}
                  formatter={(value: number) => value != null && value > 0 ? [`${value.toFixed(2)}V`, 'Voltage'] : ['--', 'Voltage']}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Area type="monotone" dataKey="voltage" stroke="#eab308" strokeWidth={2.5} fill="url(#voltGradient)" dot={false} name="Voltage" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {lastUpdated && (
        <footer className="dashboard-footer">
          Last data point: {formatDateTime(lastUpdated)}
        </footer>
      )}
    </div>
  );
}
