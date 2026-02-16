
'use client'

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState, useRef } from "react"
import { Trash2, Link as LinkIcon, Plus, Loader2, LogOut } from "lucide-react"
import { addBookmark, deleteBookmark } from "@/actions/bookmarks"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

interface Bookmark {
  id: string
  title: string
  url: string
  created_at: string
  user_id: string
}

export default function BookmarkManager({ initialBookmarks, userId, userName }: { initialBookmarks: Bookmark[], userId: string, userName?: string }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  // Sync with server state when it updates
  useEffect(() => {
    setBookmarks(initialBookmarks)
  }, [initialBookmarks])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('realtime bookmarks')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookmarks',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newBookmark = payload.new as Bookmark
          setBookmarks((prev) => {
            if (prev.some(b => b.id === newBookmark.id)) return prev
            return [newBookmark, ...prev]
          })
        } else if (payload.eventType === 'DELETE') {
          setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  async function handleAdd(formData: FormData) {
    setLoading(true)
    // Optimistic update?
    // We can wait for server action.
    const result = await addBookmark(formData)
    if (result?.error) {
      alert(result.error)
    } else {
      if (formRef.current) formRef.current.reset()
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    // Optimistic delete
    const original = bookmarks
    setBookmarks(prev => prev.filter(b => b.id !== id))

    const result = await deleteBookmark(id)
    if (result?.error) {
      setBookmarks(original) // Revert
      alert(result.error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
              Smart Bookmarks
            </h1>
            <p className="text-gray-400">Welcome back{userName ? `, ${userName}` : ''}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            title="Sign out"
          >
            <LogOut size={20} />
          </button>
        </header>

        <div className="grid gap-8 md:grid-cols-[350px,1fr]">
          {/* Add Bookmark Form */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Plus className="text-blue-400" /> Add New
              </h2>
              <form ref={formRef} action={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                  <input
                    name="title"
                    required
                    placeholder="My Favorite Site"
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">URL</label>
                  <input
                    name="url"
                    required
                    type="url"
                    placeholder="https://example.com"
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  />
                </div>
                <button
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium py-3 rounded-lg shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : "Add Bookmark"}
                </button>
              </form>
            </div>
          </div>

          {/* Bookmarks List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-300">Your Collection ({bookmarks.length})</h2>

            <motion.div layout className="grid gap-3">
              <AnimatePresence mode="popLayout">
                {bookmarks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12 text-gray-500 bg-white/5 rounded-2xl border border-dashed border-white/10"
                  >
                    <p>No bookmarks yet. Add one to get started!</p>
                  </motion.div>
                ) : (
                  bookmarks.map((bookmark) => (
                    <motion.div
                      layout
                      key={bookmark.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ scale: 1.01 }}
                      className="group bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center justify-between transition-all shadow-sm hover:shadow-md"
                    >
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-0 flex items-center gap-4 group-hover:text-blue-300 transition-colors"
                      >
                        <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                          <LinkIcon size={20} />
                        </div>
                        <div className="truncate">
                          <h3 className="font-medium text-white truncate">{bookmark.title}</h3>
                          <p className="text-xs text-gray-500 truncate">{bookmark.url}</p>
                        </div>
                      </a>

                      <button
                        onClick={() => handleDelete(bookmark.id)}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
