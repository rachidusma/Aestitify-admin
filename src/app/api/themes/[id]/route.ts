import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

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
