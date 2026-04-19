'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: insertError } = await supabase
        .from('users')
        .upsert({ id: data.user.id, username })

      if (insertError && insertError.code !== '23505') {
        setError('Account created but profile setup failed. Please try logging in.')
        setLoading(false)
        return
      }
    }

    router.push('/')
    router.refresh()
  }

  const handleGoogleSignup = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/Beatdle_Logo.png" alt="Beatdle" width={56} height={56} className="mx-auto mb-3 object-contain" />
          </Link>
          <Link href="/" className="text-2xl font-bold text-dark" style={{ fontFamily: 'Georgia, Times, serif' }}>Beatdle</Link>
          <p className="text-gray-400 text-sm mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-3 mb-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm focus:outline-none focus:border-[#1C1C1E] transition-colors"
            required
            minLength={3}
            maxLength={20}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm focus:outline-none focus:border-[#1C1C1E] transition-colors"
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm focus:outline-none focus:border-[#1C1C1E] transition-colors"
            required
            minLength={6}
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#1C1C1E] hover:bg-[#0A0A0A] text-white rounded-full text-sm font-bold transition-colors cursor-pointer disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <button
          onClick={handleGoogleSignup}
          className="w-full h-11 bg-white text-dark border border-gray-200 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <GoogleIcon className="w-4 h-4" /> Continue with Google
        </button>

        <p className="text-center text-xs text-gray-400 mt-8">
          Already have an account?{' '}
          <Link href="/login" className="text-dark font-semibold hover:underline">Log in</Link>
        </p>
        <p className="text-center mt-3">
          <Link href="/" className="text-xs text-gray-400 hover:text-dark transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  )
}
