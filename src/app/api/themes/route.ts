import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const isPremium = formData.get('isPremium') === 'true'
    const accentColor = formData.get('accentColor') as string
    const previewFile = formData.get('preview') as File
    const wallpaperFile = formData.get('wallpaper') as File

    if (!name || !previewFile || !wallpaperFile) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const themeId = crypto.randomUUID()

    // 1. Upload Assets
    const { data: previewData, error: previewError } = await supabase.storage
      .from('themes')
      .upload(`${themeId}/preview.jpg`, previewFile, { contentType: 'image/jpeg', upsert: true })
    if (previewError) throw previewError

    const { data: wallpaperData, error: wallpaperError } = await supabase.storage
      .from('themes')
      .upload(`${themeId}/wallpaper.jpg`, wallpaperFile, { contentType: 'image/jpeg', upsert: true })
    if (wallpaperError) throw wallpaperError

    const previewUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/themes/${previewData.path}`
    const wallpaperUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/themes/${wallpaperData.path}`

    // 2. Insert Theme Record
    const { data: themeRecord, error: dbError } = await supabase.from('themes').insert({
      id: themeId,
      name,
      category,
      is_premium: isPremium,
      accent_color: accentColor,
      preview_image: previewUrl,
      wallpaper_url: wallpaperUrl,
      icon_count: 0,
      widget_count: 0
    }).select().single()

    if (dbError) throw dbError

    return NextResponse.json({ success: true, theme: themeRecord })
  } catch (error: any) {
    console.error('Theme Upload Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
