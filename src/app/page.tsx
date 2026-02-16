
import { createClient } from '@/lib/supabase/server'
import BookmarkManager from '@/components/BookmarkManager'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-black">
      <BookmarkManager
        initialBookmarks={bookmarks || []}
        userId={user.id}
        userName={user.user_metadata?.full_name || user.email}
      />
    </main>
  )
}
