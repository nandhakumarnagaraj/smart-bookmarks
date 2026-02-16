
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Successful login, redirect to the home page or intended destination
      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    } else {
      console.error('Auth error:', error)
    }
  }

  // If we reach here, something went wrong
  return NextResponse.redirect(`${requestUrl.origin}/auth/auth-code-error`)
}
