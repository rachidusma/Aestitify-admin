'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type Theme = {
  id: string
  name: string
  category: string
  is_premium: boolean
  accent_color: string | null
  preview_image: string | null
  wallpaper_url: string | null
}

export default function EditThemePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const themeId = useMemo(() => params?.id, [params])

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('Minimal')
  const [isPremium, setIsPremium] = useState(false)
  const [accentColor, setAccentColor] = useState('#7C3AED')
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [wallpaperFile, setWallpaperFile] = useState<File | null>(null)

  const categories = ['Minimal', 'Dark', 'Neon', 'Anime', 'Pastel', 'Gradient', 'Nature', 'Cyberpunk']

  useEffect(() => {
    const run = async () => {
      if (!themeId) return
      setIsLoading(true)
      try {
        const res = await fetch(`/api/themes/${themeId}`, { method: 'GET' })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Failed to load theme')

        const theme = json.theme as Theme
        setName(theme.name ?? '')
        setCategory(theme.category ?? 'Minimal')
        setIsPremium(Boolean(theme.is_premium))
        setAccentColor(theme.accent_color || '#7C3AED')
      } catch (e: any) {
        alert(e.message)
      } finally {
        setIsLoading(false)
      }
    }
    run()
  }, [themeId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!themeId) return

    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('category', category)
      formData.append('isPremium', String(isPremium))
      formData.append('accentColor', accentColor)
      if (previewFile) formData.append('preview', previewFile)
      if (wallpaperFile) formData.append('wallpaper', wallpaperFile)

      const res = await fetch(`/api/themes/${themeId}`, { method: 'PATCH', body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Update failed')

      alert('Theme updated successfully')
      router.push('/themes')
      router.refresh()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading">Loading theme...</div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h2 className="title-gradient">Edit Theme</h2>
        <p className="subtitle">Update metadata and optionally replace assets.</p>
      </header>

      <form onSubmit={handleSave} className="glass-card upload-form">
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
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Accent Color</label>
            <div className="color-picker-wrapper">
              <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
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
            <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} />
            Premium Theme
          </label>
        </div>

        <div className="assets-grid">
          <div className="form-group">
            <label>Replace Preview Image (optional)</label>
            <div className="file-dropzone">
              <input type="file" accept="image/*" onChange={(e) => setPreviewFile(e.target.files?.[0] || null)} />
              {previewFile && <p className="file-name">{previewFile.name}</p>}
            </div>
          </div>

          <div className="form-group">
            <label>Replace Wallpaper (optional)</label>
            <div className="file-dropzone">
              <input type="file" accept="image/*" onChange={(e) => setWallpaperFile(e.target.files?.[0] || null)} />
              {wallpaperFile && <p className="file-name">{wallpaperFile.name}</p>}
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

