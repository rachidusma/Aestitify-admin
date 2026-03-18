import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { themeId, appName, bundleId, iconUrl } = await req.json()
    
    if (!themeId || !appName || !bundleId || !iconUrl) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // 1. Create Icon Record
    const { error: dbError } = await supabase.from('icons').insert({
      theme_id: themeId,
      app_name: appName,
      bundle_id: bundleId,
      icon_url: iconUrl
    })

    if (dbError) throw dbError

    // 2. Update Theme's icon_count
    const { data: themeData } = await supabase.from('themes').select('icon_count').eq('id', themeId).single()
    if (themeData) {
      await supabase.from('themes').update({ icon_count: (themeData.icon_count || 0) + 1 }).eq('id', themeId)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Icon Upload Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
