import { NextResponse } from 'next/server'
import { getSupabaseConfigStatus } from '@/lib/supabase/admin'
import { getCompanies } from '@/lib/db'

export async function GET() {
  const config = getSupabaseConfigStatus()

  if (!config.hasUrl || (!config.hasServiceRole && !config.hasAnon)) {
    return NextResponse.json(
      {
        ok: false,
        config,
        error: 'Supabase environment variables are missing on this deployment',
      },
      { status: 503 },
    )
  }

  try {
    const companies = await getCompanies()
    return NextResponse.json({
      ok: true,
      config,
      companies: companies.length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database connection failed'
    return NextResponse.json(
      { ok: false, config, error: message },
      { status: 503 },
    )
  }
}
