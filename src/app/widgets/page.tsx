'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function WidgetsPage() {
  const [themeId, setThemeId] = useState('')
  const [widgetType, setWidgetType] = useState('clock')
  const [size, setSize] = useState('medium')
  const [isPremium, setIsPremium] = useState(false)
  const [styleData, setStyleData] = useState('{}')
  const [isUploading, setIsUploading] = useState(false)
  const [themes, setThemes] = useState<{id: string, name: string}[]>([])

  useEffect(() => {
    const fetchThemes = async () => {
      const { data } = await supabase.from('themes').select('id, name')
      if (data) setThemes(data)
    }
    fetchThemes()
  }, [])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!themeId) {
      alert('Please select a theme')
      return
    }

    setIsUploading(true)
    try {
      let parsedStyle = {}
      try {
        parsedStyle = JSON.parse(styleData)
      } catch (e) {
        alert('Invalid JSON in Style Data')
        setIsUploading(false)
        return
      }

      // Call API to create record and update count
      const response = await fetch('/api/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId, widgetType, size, isPremium, styleData: parsedStyle }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      alert('Widget added successfully!')
      setStyleData('{}')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h2 className="title-gradient">Manage Widgets</h2>
        <p className="subtitle">Configuring interactive widgets for themes.</p>
      </header>

      <form onSubmit={handleUpload} className="glass-card upload-form">
        <div className="form-group">
          <label>Target Theme</label>
          <select value={themeId} onChange={(e) => setThemeId(e.target.value)} required>
            <option value="">Select a theme...</option>
            {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Widget Type</label>
            <select value={widgetType} onChange={(e) => setWidgetType(e.target.value)}>
              <option value="clock">Clock</option>
              <option value="calendar">Calendar</option>
              <option value="quote">Quote</option>
              <option value="battery">Battery</option>
              <option value="weather">Weather</option>
            </select>
          </div>
          <div className="form-group">
            <label>Size</label>
            <select value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} />
            Premium Widget
          </label>
        </div>

        <div className="form-group">
          <label>Style Data (JSON)</label>
          <textarea 
            rows={5} 
            value={styleData} 
            onChange={(e) => setStyleData(e.target.value)}
            placeholder='{ "color": "#ffffff", "font": "System" }'
          />
        </div>

        <button type="submit" className="btn-primary" disabled={isUploading}>
          {isUploading ? 'Adding...' : 'Add Widget to Theme'}
        </button>
      </form>
    </div>
  )
}
