'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function IconsPage() {
  const [themeId, setThemeId] = useState('')
  const [appName, setAppName] = useState('')
  const [bundleId, setBundleId] = useState('')
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [themes, setThemes] = useState<{id: string, name: string}[]>([])

  // Fetch themes on mount to populate select
  useState(() => {
    const fetchThemes = async () => {
      const { data } = await supabase.from('themes').select('id, name')
      if (data) setThemes(data)
    }
    fetchThemes()
  })

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!themeId || !appName || !bundleId || !iconFile) {
      alert('Missing fields')
      return
    }

    setIsUploading(true)
    try {
      // 1. Upload Icon Image to Storage (still client side for better progress, or do all in API)
      // Actually, storage might also have RLS. Let's do it all in API for simplicity and to bypass RLS.
      const formData = new FormData()
      formData.append('themeId', themeId)
      formData.append('appName', appName)
      formData.append('bundleId', bundleId)
      formData.append('icon', iconFile)

      // I need to update the icons/route.ts to handle FormData if I do this.
      // Let's stick to JSON for icons/route.ts but upload image first.
      
      const filename = `${appName.replace(/\s+/g, '_').toLowerCase()}.jpg`
      const { data, error } = await supabase.storage
        .from('icons')
        .upload(`${themeId}/${filename}`, iconFile, { contentType: 'image/jpeg', upsert: true })

      if (error) throw error

      const iconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/icons/${data.path}`

      // 2. Call API to create record and update count
      const response = await fetch('/api/icons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId, appName, bundleId, iconUrl }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      alert('Icon uploaded!')
      setAppName('')
      setBundleId('')
      setIconFile(null)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h2 className="title-gradient">Upload App Icons</h2>
        <p className="subtitle">Add icons to an existing theme. Icons will be automatically associated with the selected theme.</p>
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
            <label>App Name</label>
            <input type="text" value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="e.g. WhatsApp" required />
          </div>
          <div className="form-group">
            <label>Bundle ID</label>
            <input type="text" value={bundleId} onChange={(e) => setBundleId(e.target.value)} placeholder="e.g. net.whatsapp.WhatsApp" required />
          </div>
        </div>

        <div className="form-group">
          <label>Icon Asset (1024x1024 recommended)</label>
          <input type="file" accept="image/*" onChange={(e) => setIconFile(e.target.files?.[0] || null)} required />
        </div>

        <button type="submit" className="btn-primary" disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Add Icon to Theme'}
        </button>
      </form>
    </div>
  )
}
