'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Theme {
  id: string
  name: string
  category: string
  is_premium: boolean
  preview_image: string
  icon_count: number
  widget_count: number
}

export default function ThemesListPage() {
  const [themes, setThemes] = useState<Theme[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchThemes()
  }, [])

  const fetchThemes = async () => {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setThemes(data)
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this theme? All associated icons and widgets will also be removed.')) return

    try {
      const response = await fetch(`/api/themes/${id}`, { method: 'DELETE' })
      const result = await response.json()
      
      if (!response.ok) throw new Error(result.error)
      
      setThemes(themes.filter(t => t.id !== id))
      alert('Theme deleted successfully')
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="title-gradient">Theme Library</h2>
          <p className="subtitle">Manage and monitor all published themes.</p>
        </div>
        <Link href="/themes/new" className="btn-primary">
          Create New Theme
        </Link>
      </header>

      {isLoading ? (
        <div className="loading">Loading themes...</div>
      ) : (
        <div className="themes-grid">
          {themes.map(theme => (
            <div key={theme.id} className="glass-card theme-card">
              <div className="theme-preview-wrapper">
                <img src={theme.preview_image} alt={theme.name} className="theme-preview-img" />
                {theme.is_premium && <span className="premium-badge">PREMIUM</span>}
              </div>
              <div className="theme-details">
                <div className="theme-info-header">
                  <h3>{theme.name}</h3>
                  <span className="category-tag">{theme.category}</span>
                </div>
                <div className="theme-stats-row">
                  <div className="mini-stat">
                    <span className="mini-stat-label">Icons</span>
                    <span className="mini-stat-value">{theme.icon_count || 0}</span>
                  </div>
                  <div className="mini-stat">
                    <span className="mini-stat-label">Widgets</span>
                    <span className="mini-stat-value">{theme.widget_count || 0}</span>
                  </div>
                </div>
                <div className="theme-actions">
                  <Link href={`/themes/${theme.id}/edit`} className="btn-secondary btn-sm">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(theme.id)} className="btn-danger btn-sm">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
