'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ThemesPage() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Minimal')
  const [isPremium, setIsPremium] = useState(false)
  const [accentColor, setAccentColor] = useState('#7C3AED')
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [wallpaperFile, setWallpaperFile] = useState<File | null>(null)
  
  const [isUploading, setIsUploading] = useState(false)
  const [status, setStatus] = useState('')

  const categories = ['Minimal', 'Dark', 'Neon', 'Anime', 'Pastel', 'Gradient', 'Nature', 'Cyberpunk']

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !previewFile || !wallpaperFile) {
      alert('Please fill all required fields')
      return
    }

    setIsUploading(true)
    setStatus('Uploading theme via API...')

    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('category', category)
      formData.append('isPremium', String(isPremium))
      formData.append('accentColor', accentColor)
      formData.append('preview', previewFile)
      formData.append('wallpaper', wallpaperFile)

      const response = await fetch('/api/themes', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      setStatus('Success!')
      setName('')
      setPreviewFile(null)
      setWallpaperFile(null)
      alert('Theme uploaded successfully!')
    } catch (error: any) {
      console.error(error)
      alert(`Error: ${error.message}`)
    } finally {
      setIsUploading(false)
      setStatus('')
    }
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h2 className="title-gradient">Create New Theme</h2>
        <p className="subtitle">Configure theme metadata and upload high-resolution assets.</p>
      </header>

      <form onSubmit={handleUpload} className="glass-card upload-form">
        <div className="form-group">
          <label>Theme Name</label>
          <input 
            type="text" 
            placeholder="e.g. Neon Nights" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Accent Color</label>
            <div className="color-picker-wrapper">
              <input 
                type="color" 
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
              />
              <input 
                type="text" 
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                style={{ width: '100px' }}
              />
            </div>
          </div>
        </div>

        <div className="form-group premium-toggle">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
            />
            Premium Theme
          </label>
        </div>

        <div className="assets-grid">
          <div className="form-group">
            <label>Preview Image (Vertical)</label>
            <div className="file-dropzone">
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setPreviewFile(e.target.files?.[0] || null)}
              />
              {previewFile && <p className="file-name">{previewFile.name}</p>}
            </div>
          </div>

          <div className="form-group">
            <label>Wallpaper (High Res)</label>
            <div className="file-dropzone">
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setWallpaperFile(e.target.files?.[0] || null)}
              />
              {wallpaperFile && <p className="file-name">{wallpaperFile.name}</p>}
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={isUploading}>
          {isUploading ? status : 'Upload Theme'}
        </button>
      </form>
    </div>
  )
}
