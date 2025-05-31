"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { getSupabaseBrowserClient } from "@/lib/supabase"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signUp: (
    email: string,
    password: string,
  ) => Promise<{
    error: any | null
    data: any | null
  }>
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    error: any | null
    data: any | null
  }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{
    error: any | null
    data: any | null
  }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authInitialized, setAuthInitialized] = useState(false)
  const supabase = getSupabaseBrowserClient()

  console.log("[AUTH CONTEXT] AuthProvider rendering, initialized:", authInitialized)

  // Initialize auth state
  useEffect(() => {
    console.log("[AUTH CONTEXT] Auth initialization effect running, initialized:", authInitialized)

    const initializeAuth = async () => {
      try {
        console.log("[AUTH CONTEXT] Starting auth initialization")
        setIsLoading(true)

        // Get the current session
        console.log("[AUTH CONTEXT] Getting session")
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        console.log("[AUTH CONTEXT] Session result:", !!sessionData?.session, "error:", !!sessionError)

        if (sessionError) {
          console.error("[AUTH CONTEXT] Error getting session:", sessionError)
          setIsLoading(false)
          setAuthInitialized(true)
          return
        }

        if (sessionData?.session) {
          console.log("[AUTH CONTEXT] Session found, setting user and session", sessionData.session)
          setSession(sessionData.session)
          setUser(sessionData.session.user)
        } else {
          console.log("[AUTH CONTEXT] No session found, sessionData:", sessionData)
        }

        setIsLoading(false)
        setAuthInitialized(true)
        console.log("[AUTH CONTEXT] Auth initialization complete")
      } catch (error) {
        console.error("[AUTH CONTEXT] Error initializing auth:", error)
        setIsLoading(false)
        setAuthInitialized(true)
      }
    }

    if (!authInitialized) {
      console.log("[AUTH CONTEXT] Starting auth initialization")
      initializeAuth()
    }
  }, [authInitialized, supabase.auth])

  // Set up auth state change listener
  useEffect(() => {
    if (!authInitialized) {
      console.log("[AUTH CONTEXT] Skipping auth state change listener (not initialized)")
      return
    }

    console.log("[AUTH CONTEXT] Setting up auth state change listener")
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[AUTH CONTEXT] Auth state changed:", event, "session:", !!session)
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Cleanup subscription on unmount
    return () => {
      console.log("[AUTH CONTEXT] Cleaning up auth state change listener")
      subscription.unsubscribe()
    }
  }, [authInitialized, supabase.auth])

  const signUp = async (email: string, password: string, name: string) => {
    console.log("[AUTH CONTEXT] Sign up called for email:", email)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          }
        }
      })
      console.log("[AUTH CONTEXT] Sign up result:", !!data, "error:", !!error)
      return { data, error }
    } catch (err) {
      console.error("[AUTH CONTEXT] Error during sign up:", err)
      return { data: null, error: err }
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log("[AUTH CONTEXT] Sign in called for email:", email)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      console.log("[AUTH CONTEXT] Sign in result:", !!data, "error:", !!error)
      return { data, error }
    } catch (err) {
      console.error("[AUTH CONTEXT] Error during sign in:", err)
      return { data: null, error: err }
    }
  }

  const signOut = async () => {
    console.log("[AUTH CONTEXT] Sign out called")
    try {
      await supabase.auth.signOut()
      console.log("[AUTH CONTEXT] Sign out successful")
    } catch (err) {
      console.error("[AUTH CONTEXT] Error during sign out:", err)
    }
  }

  const resetPassword = async (email: string) => {
    console.log("[AUTH CONTEXT] Reset password called for email:", email)
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      console.log("[AUTH CONTEXT] Reset password result:", !!data, "error:", !!error)
      return { data, error }
    } catch (err) {
      console.error("[AUTH CONTEXT] Error during password reset:", err)
      return { data: null, error: err }
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
