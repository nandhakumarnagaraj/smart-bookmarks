
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  console.log('--- Auth Callback Start ---')
  console.log('URL:', request.url)
  console.log('Code present:', !!code)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      console.log('Auth Success! Redirecting to:', next)
      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    } else {
      console.error('--- Supabase Auth Error ---')
      console.error('Status:', error.status)
      console.error('Message:', error.message)
      console.error('Full Error:', JSON.stringify(error, null, 2))
    }
  } else {
    console.warn('Auth Warning: No code found in URL params.')
  }

  console.log('--- Auth Callback Failed ---')
  return NextResponse.redirect(`${requestUrl.origin}/auth/auth-code-error`)
}
