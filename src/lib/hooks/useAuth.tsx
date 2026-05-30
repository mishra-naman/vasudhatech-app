import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/types/database'
import type { UserRole } from '@/lib/types/enums'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

type JwtClaims = {
  org_id?: string
  user_role?: string
  dept_id?: string
  [key: string]: unknown
}

type AuthContextValue = {
  user: User | null
  session: Session | null
  profile: ProfileRow | null
  orgId: string | null
  userRole: UserRole | null
  deptId: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function decodeJwtClaims(token: string): JwtClaims {
  try {
    const payload = token.split('.')[1]
    if (!payload) return {}
    // base64url → base64, then restore the padding atob needs
    let b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    if (b64.length % 4) b64 += '='.repeat(4 - (b64.length % 4))
    // Decode as UTF-8 so non-ASCII claim values survive
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
    const json = new TextDecoder().decode(bytes)
    return JSON.parse(json) as JwtClaims
  } catch {
    return {}
  }
}

async function fetchProfile(userId: string, retries = 2): Promise<ProfileRow | null> {
  for (let i = 0; i <= retries; i++) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) return data
    // Signup trigger may not have fired yet — wait briefly then retry
    if (i < retries) await new Promise(r => setTimeout(r, 600))
  }
  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [deptId, setDeptId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // Prevent concurrent profile fetches on rapid session changes
  const fetchingRef = useRef(false)
  // Ensures the self-heal refresh below runs at most once per session,
  // so a disabled access-token hook can't trigger an infinite refresh loop.
  const healedRef = useRef(false)

  const handleSession = useCallback(async (newSession: Session | null) => {
    setSession(newSession)
    setUser(newSession?.user ?? null)

    if (!newSession) {
      setProfile(null)
      setOrgId(null)
      setUserRole(null)
      setDeptId(null)
      healedRef.current = false
      return
    }

    // Decode JWT claims (injected by custom_access_token_hook)
    const claims = decodeJwtClaims(newSession.access_token)
    setOrgId(claims.org_id ?? null)
    setUserRole((claims.user_role as UserRole) ?? null)
    setDeptId(claims.dept_id ?? null)

    // Fetch full profile row (skip if already fetching)
    if (fetchingRef.current) return
    fetchingRef.current = true
    const p = await fetchProfile(newSession.user.id)
    fetchingRef.current = false
    setProfile(p)

    // Self-heal a stale token: the profile is linked to an org but the JWT
    // carries no org_id claim. This happens when the token was issued before
    // onboarding finished, or right after the access-token hook is enabled.
    // Refresh once to re-run the hook and pick up the claim — onAuthStateChange
    // fires again with the fresh token. Guarded so a disabled hook (which will
    // never inject the claim) can't loop forever.
    if (!claims.org_id && p?.org_id && !healedRef.current) {
      healedRef.current = true
      await supabase.auth.refreshSession()
    }
  }, [])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      handleSession(s).finally(() => setIsLoading(false))
    })

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      handleSession(s)
    })

    return () => subscription.unsubscribe()
  }, [handleSession])

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signup = useCallback(async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
  }, [])

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  const refreshSession = useCallback(async () => {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) throw error
    if (data.session) await handleSession(data.session)
  }, [handleSession])

  const value: AuthContextValue = {
    user,
    session,
    profile,
    // Prefer the JWT claims (needed for RLS), but fall back to the profile row
    // so the UI (routing, role-gated nav) works even when the access-token hook
    // hasn't injected claims yet — or at all. The profile is the source of truth
    // for "which org / what role"; the JWT claim is an optimisation for RLS.
    orgId: orgId ?? profile?.org_id ?? null,
    userRole: userRole ?? ((profile?.role as UserRole | null) ?? null),
    deptId: deptId ?? profile?.department_id ?? null,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refreshSession,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
