import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase.from('themes').select('*').eq('id', id).single()
    if (error) throw error

    return NextResponse.json({ success: true, theme: data })
  } catch (error: any) {
    console.error('Get Theme Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const formData = await req.formData()

    const name = (formData.get('name') as string | null) ?? undefined
    const category = (formData.get('category') as string | null) ?? undefined
    const isPremiumRaw = formData.get('isPremium') as string | null
    const accentColor = (formData.get('accentColor') as string | null) ?? undefined
    const previewFile = formData.get('preview') as File | null
    const wallpaperFile = formData.get('wallpaper') as File | null

    const supabase = getSupabaseAdmin()

    const updates: Record<string, any> = {}
    if (typeof name === 'string' && name.trim()) updates.name = name.trim()
    if (typeof category === 'string' && category.trim()) updates.category = category.trim()
    if (typeof accentColor === 'string' && accentColor.trim()) updates.accent_color = accentColor.trim()
    if (isPremiumRaw !== null) updates.is_premium = isPremiumRaw === 'true'

    if (previewFile && previewFile.size > 0) {
      const { data: previewData, error: previewError } = await supabase.storage
        .from('themes')
        .upload(`${id}/preview.jpg`, previewFile, {
          contentType: previewFile.type || 'image/jpeg',
          upsert: true,
        })
      if (previewError) throw previewError
      updates.preview_image = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/themes/${previewData.path}`
    }

    if (wallpaperFile && wallpaperFile.size > 0) {
      const { data: wallpaperData, error: wallpaperError } = await supabase.storage
        .from('themes')
        .upload(`${id}/wallpaper.jpg`, wallpaperFile, {
          contentType: wallpaperFile.type || 'image/jpeg',
          upsert: true,
        })
      if (wallpaperError) throw wallpaperError
      updates.wallpaper_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/themes/${wallpaperData.path}`
    }

    const { data: updated, error: updateError } = await supabase
      .from('themes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ success: true, theme: updated })
  } catch (error: any) {
    console.error('Update Theme Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getSupabaseAdmin()

    // 1. Get theme data to potentially clean up storage
    const { data: theme } = await supabase.from('themes').select('preview_image, wallpaper_url').eq('id', id).single()

    // 2. Delete the theme record (Cascades should handle icons/widgets if set up, but let's be explicit if not)
    // Actually, in our schema, we should check if CASCADE is on. 
    // For now, let's assume we need to clean up icons and widgets associated.
    
    // Explicitly delete associated icons and widgets to be safe
    await supabase.from('icons').delete().eq('theme_id', id)
    await supabase.from('widgets').delete().eq('theme_id', id)
    
    const { error: deleteError } = await supabase.from('themes').delete().eq('id', id)
    if (deleteError) throw deleteError

    // 3. Optional: Cleanup Storage (Bucket cleanup can be complex, skipping for now to prioritize db integrity)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete Theme Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
