
import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-white">
      <h1 className="text-4xl font-bold text-red-500 mb-4">Authentication Error</h1>
      <p className="mb-8 text-gray-400">Something went wrong while signing you in.</p>
      <Link href="/login" className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors">
        Try Again
      </Link>
    </div>
  )
}
