import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { themeId, widgetType, size, isPremium, styleData } = await req.json()
    
    if (!themeId || !widgetType || !size) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // 1. Create Widget Record
    const { error: dbError } = await supabase.from('widgets').insert({
      theme_id: themeId,
      widget_type: widgetType,
      size,
      is_premium: isPremium,
      style_data: styleData
    })

    if (dbError) throw dbError

    // 2. Increment widget count in theme
    const { data: themeData } = await supabase.from('themes').select('widget_count').eq('id', themeId).single()
    if (themeData) {
      await supabase.from('themes').update({ widget_count: (themeData.widget_count || 0) + 1 }).eq('id', themeId)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Widget Upload Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
