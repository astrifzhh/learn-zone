import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Profile } from '../types/planner'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  isDemoMode: boolean
  isAdmin: boolean
  signIn: (identifier: string, password: string) => Promise<{ error: Error | null }>
  signUp: (params: { email: string; password: string; nickname: string; className: string }) => Promise<{ error: Error | null; needsEmailConfirmation?: boolean }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
  loginDemoUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEMO_USER_ID = 'demo-user-learner'
const DEMO_PROFILE: Profile = {
  id: DEMO_USER_ID,
  email: 'budi.santoso@global.student',
  nickname: 'Budi',
  class_name: 'Kelas 7B',
  avatar_key: 'avatar_1',
  role: 'student',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
} as Profile

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false)
  const isAdmin = profile?.role === 'admin'

  const fetchProfile = async (userId: string, userMeta?: Record<string, unknown>, userEmail?: string) => {
    if (!isSupabaseConfigured) {
      const savedProfile = localStorage.getItem('lz_demo_profile')
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile))
      } else {
        setProfile(DEMO_PROFILE)
        localStorage.setItem('lz_demo_profile', JSON.stringify(DEMO_PROFILE))
      }
      return
    }

    try {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error.message)
      }

      if (data) {
        setProfile(data as Profile)
      } else {
        const nickname = (userMeta?.nickname as string) || 'Pelajar'
        const className = (userMeta?.class_name as string) || 'Kelas 7'
        const { data: newProfile } = await (supabase as any)
          .from('profiles')
          .insert({
            id: userId,
            email: userEmail || (userMeta?.email as string) || '',
            nickname,
            class_name: className,
            role: 'student',
          })
          .select()
          .single()

        if (newProfile) setProfile(newProfile as Profile)
      }
    } catch (err) {
      console.error('Profile fetch failed:', err)
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const demoActive = localStorage.getItem('lz_demo_active') === 'true'
      if (demoActive) {
        setIsDemoMode(true)
        setUser({ id: DEMO_USER_ID, email: 'budi.santoso@global.student' } as User)
        const saved = localStorage.getItem('lz_demo_profile')
        setProfile(saved ? JSON.parse(saved) : DEMO_PROFILE)
      }
      setIsLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id, currentSession.user.user_metadata, currentSession.user.email || undefined)
      }
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      if (newSession?.user) {
        await fetchProfile(newSession.user.id, newSession.user.user_metadata, newSession.user.email || undefined)
      } else {
        setProfile(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loginDemoUser = () => {
    setIsDemoMode(true)
    const demoUser = { id: DEMO_USER_ID, email: 'budi.santoso@global.student' } as User
    setUser(demoUser)
    const saved = localStorage.getItem('lz_demo_profile')
    const savedProfile = saved ? JSON.parse(saved) as Profile & { role?: string } : null
    const prof = savedProfile?.role === 'admin' ? DEMO_PROFILE : (savedProfile || DEMO_PROFILE)
    setProfile(prof)
    localStorage.setItem('lz_demo_active', 'true')
    localStorage.setItem('lz_demo_profile', JSON.stringify(prof))
  }

  const signIn = async (email: string, password: string) => {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      return { error: new Error('Email wajib diisi.') }
    }

    if (!isValidEmail(trimmedEmail)) {
      return { error: new Error('Format email tidak valid.') }
    }

    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase belum dikonfigurasi. Gunakan mode demo untuk login.') }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    })
    return { error: error ? new Error(error.message) : null }
  }

  const signUp = async ({
    email,
    password,
    nickname,
    className,
  }: {
    email: string
    password: string
    nickname: string
    className: string
  }) => {
    const trimmedNickname = nickname.trim() || 'Pelajar'
    const trimmedClassName = className.trim() || 'Kelas 7'
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      return { error: new Error('Email wajib diisi untuk mendaftar.') }
    }

    if (!isValidEmail(trimmedEmail)) {
      return { error: new Error('Format email tidak valid.') }
    }

    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase belum dikonfigurasi. Tidak bisa mendaftar saat ini.') }
    }

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          nickname: trimmedNickname,
          class_name: trimmedClassName,
          role: 'student',
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    const needsEmailConfirmation = Boolean(data.user && !data.session)
    return {
      error: error
        ? new Error(error.message)
        : needsEmailConfirmation
          ? new Error('Email confirmation masih aktif di Supabase. Matikan Authentication > Providers > Email > Confirm email agar akun langsung masuk.')
          : null,
      needsEmailConfirmation,
    }
  }

  const signOut = async () => {
    if (isDemoMode || !isSupabaseConfigured) {
      setIsDemoMode(false)
      setUser(null)
      setProfile(null)
      localStorage.removeItem('lz_demo_active')
      return
    }
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured || isDemoMode) {
      return { error: null }
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })
    return { error: error ? new Error(error.message) : null }
  }

  const updatePassword = async (newPassword: string) => {
    if (!isSupabaseConfigured || isDemoMode) {
      return { error: null }
    }
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { error: error ? new Error(error.message) : null }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('User belum terautentikasi') }

    const updated = {
      ...(profile || DEMO_PROFILE),
      ...updates,
      updated_at: new Date().toISOString(),
    } as Profile

    setProfile(updated)

    if (isDemoMode || !isSupabaseConfigured) {
      localStorage.setItem('lz_demo_profile', JSON.stringify(updated))
      return { error: null }
    }

    const { error } = await (supabase as any)
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (error) {
      localStorage.setItem(`lz_profile_${user.id}`, JSON.stringify(updated))
    }

    return { error: error ? new Error(error.message) : null }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isDemoMode,
        isAdmin,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        loginDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
