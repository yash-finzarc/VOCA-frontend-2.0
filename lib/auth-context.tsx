"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { signIn, signUp, signOut, getCurrentUser, onAuthStateChange } from "@/supabase/auth"
import { supabase } from "@/supabase/client"
import { getUserOrganizations } from "@/supabase/services/organizations"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface User {
  id: string
  email: string
  name: string
  company: string
  role: string
  organizationId?: string
}

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string, name: string, company: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    getCurrentUser().then(({ user: currentUser }) => {
      if (currentUser) {
        setSupabaseUser(currentUser)
        loadUserData(currentUser.id)
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user)
        await loadUserData(session.user.id)
      } else {
        setSupabaseUser(null)
        setUser(null)
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadUserData = async (userId: string) => {
    try {
      // Get user profile from users table
      // Retry logic in case user was just created
      let userData = null
      let userError = null
      let retries = 3

      while (retries > 0) {
        const result = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .maybeSingle() // Use maybeSingle instead of single to avoid errors if not found

        userData = result.data
        userError = result.error

        // If we got data or a non-404 error, break
        if (userData || (userError && userError.code !== "PGRST116" && userError.code !== "42P01")) {
          break
        }

        // If 406 error (Not Acceptable), might be RLS issue - break and use fallback
        if (userError && userError.message?.includes("406")) {
          console.warn("RLS policy may be blocking access to users table")
          break
        }

        retries--
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }

      // If user doesn't exist in users table, try to create it from auth user
        if (!userData && supabaseUser) {
          try {
            const { data: newUser, error: createError } = await supabase
              .from("users")
              .insert({
                id: supabaseUser.id,
                email: supabaseUser.email!,
                name: supabaseUser.user_metadata?.name || supabaseUser.email!.split("@")[0],
                password_hash: "", // password_hash is required but stored in auth.users
                is_active: true,
              })
              .select()
              .maybeSingle()

          if (!createError && newUser) {
            userData = newUser
          } else if (createError) {
            // If it's a unique constraint violation, user might already exist
            // Try fetching again
            if (createError.code === "23505") {
              const retryResult = await supabase
                .from("users")
                .select("*")
                .eq("id", supabaseUser.id)
                .maybeSingle()
              if (retryResult.data) {
                userData = retryResult.data
              }
            }
          }
        } catch (createErr) {
          console.warn("Could not create user record:", createErr)
        }
      }

      // If still no userData, use auth user as fallback
      if (!userData && supabaseUser) {
        const userProfile: User = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: supabaseUser.user_metadata?.name || supabaseUser.email!.split("@")[0],
          company: "My Organization",
          role: "admin",
        }
        setUser(userProfile)
        setIsLoading(false)
        return
      }

      if (!userData) {
        console.error("Error loading user data: No user data found")
        // Still set a fallback user if we have supabaseUser
        if (supabaseUser) {
          const userProfile: User = {
            id: supabaseUser.id,
            email: supabaseUser.email!,
            name: supabaseUser.user_metadata?.name || supabaseUser.email!.split("@")[0],
            company: "My Organization",
            role: "admin",
          }
          setUser(userProfile)
        }
        setIsLoading(false)
        return
      }

      // Get user's organizations
      let organization = null
      try {
        const { data: orgsData, error: orgsError } = await getUserOrganizations(userId)

        if (!orgsError && orgsData && orgsData.length > 0) {
          organization = orgsData[0]?.organization
        }
      } catch (orgErr) {
        console.warn("Could not load organizations:", orgErr)
      }

      const userProfile: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name || userData.email.split("@")[0],
        company: organization?.name || "My Organization",
        role: "admin", // TODO: Get from organization_members table
        organizationId: organization?.id,
      }

      setUser(userProfile)
    } catch (error) {
      console.error("Error loading user data:", error)
      // Fallback: use auth user data if available
      if (supabaseUser) {
        const userProfile: User = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: supabaseUser.user_metadata?.name || supabaseUser.email!.split("@")[0],
          company: "My Organization",
          role: "admin",
        }
        setUser(userProfile)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { user: authUser, error } = await signIn(email, password)

      if (error) {
        return { success: false, error: error.message }
      }

      if (authUser) {
        await loadUserData(authUser.id)
        return { success: true }
      }

      return { success: false, error: "Login failed" }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "An error occurred" }
    }
  }

  const signup = async (
    email: string,
    password: string,
    name: string,
    company: string
  ): Promise<{ success: boolean; error?: string; email?: string }> => {
    try {
      const { user: authUser, error: signUpError } = await signUp(email, password, name)

      if (signUpError) {
        return { success: false, error: signUpError.message }
      }

      if (!authUser) {
        return { success: false, error: "Signup failed - no user returned" }
      }

      // Wait a bit for the auth user to be fully created and database trigger to run
      // The trigger automatically creates the user record in public.users table
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Note: User record is created automatically by the database trigger (handle_new_user)
      // We don't need to manually create it - this avoids RLS issues
      // If email confirmation is required, the user will be fully activated after email verification

      // Create organization using database function (bypasses RLS)
      const orgSlug = company.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
      let orgId: string | null = null
      
      try {
        const { data: functionResult, error: functionError } = await supabase.rpc(
          'create_organization_for_user',
          {
            org_name: company.trim(),
            org_slug: `${orgSlug}-${Date.now()}`,
            p_user_id: authUser.id  // Use p_user_id to match function parameter
          }
        )

        if (functionError) {
          console.error("Error creating organization via function:", functionError)
          throw new Error(`Failed to create organization: ${functionError.message}`)
        } else if (!functionResult) {
          throw new Error("Organization creation returned no data")
        } else {
          orgId = functionResult
        }
      } catch (orgErr) {
        console.error("Exception creating organization:", orgErr)
        throw new Error(`Failed to create organization: ${orgErr instanceof Error ? orgErr.message : "Unknown error"}`)
      }

      if (!orgId) {
        throw new Error("Organization was not created")
      }

      // Fetch the created organization
      let org = null
      try {
        const { data: orgData, error: fetchError } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", orgId)
          .single()

        if (fetchError) {
          console.error("Error fetching created organization:", fetchError)
          // Organization was created, but we can't fetch it yet due to RLS
          // This is okay - it will be available after the user session is established
        } else {
          org = orgData
        }
      } catch (fetchErr) {
        console.warn("Could not fetch organization immediately (will be available after session refresh):", fetchErr)
        // This is okay - the organization was created, we just can't fetch it yet
      }

      // Wait a bit for all data to be saved and propagated
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Load user data - the organization should be available now
      // The function created both the organization and the membership
      await loadUserData(authUser.id)
      
      // Verify organization exists with retry logic
      let retries = 3
      let organizationFound = false
      
      while (retries > 0 && !organizationFound) {
        // Wait a moment for state to update
        await new Promise((resolve) => setTimeout(resolve, 500))
        
        // Verify organization exists
        const { data: orgsCheck, error: orgsCheckError } = await getUserOrganizations(authUser.id)
        if (orgsCheck && orgsCheck.length > 0) {
          organizationFound = true
        } else {
          retries--
          if (retries > 0) {
            console.log(`Organization not found yet, retrying... (${retries} retries left)`)
            // Reload user data in case session wasn't ready
            await loadUserData(authUser.id)
            await new Promise((resolve) => setTimeout(resolve, 1000))
          } else {
            console.warn("Organization was created but could not be loaded. User may need to refresh.")
          }
        }
      }
      
      return { success: true, email: authUser.email || email }
    } catch (error) {
      console.error("Signup error:", error)
      return { success: false, error: error instanceof Error ? error.message : "An error occurred" }
    }
  }

  const logout = async () => {
    await signOut()
    setUser(null)
    setSupabaseUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, supabaseUser, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
