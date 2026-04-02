'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function LogoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const run = async () => {
      try {
        await fetch('/api/auth/destroy-session', { method: 'POST' })
      } catch {
        // Best-effort: still proceed with local logout
      }

      try {
        localStorage.removeItem('customerSession')
      } catch {
        // ignore
      }

      const redirect = searchParams.get('redirect') || '/login'
      router.replace(redirect)
    }

    void run()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center text-gray-600">
        <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" />
        Logging out...
      </div>
    </div>
  )
}

