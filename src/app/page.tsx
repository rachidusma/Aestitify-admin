'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [stats, setStats] = useState({ themes: 0, icons: 0, downloads: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      const { count: themesCount } = await supabase.from('themes').select('*', { count: 'exact', head: true })
      const { count: iconsCount } = await supabase.from('icons').select('*', { count: 'exact', head: true })
      const { count: downloadsCount } = await supabase.from('downloads').select('*', { count: 'exact', head: true })
      
      setStats({
        themes: themesCount || 0,
        icons: iconsCount || 0,
        downloads: downloadsCount || 0
      })
    }
    fetchStats()
  }, [])

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2 className="title-gradient">Dashboard Overview</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Welcome to the Aestitify Studio. Manage your themes, icons, and widgets here.</p>
      </header>

      <div className="stats-grid">
        <div className="glass-card stat-card">
          <span className="stat-label">Total Themes</span>
          <span className="stat-value">{stats.themes}</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-label">Total Icons</span>
          <span className="stat-value">{stats.icons}</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-label">Total Downloads</span>
          <span className="stat-value">{stats.downloads}</span>
        </div>
      </div>
    </div>
  );
}
