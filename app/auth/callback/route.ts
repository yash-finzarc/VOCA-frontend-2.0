import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") || "/dashboard"

  if (code) {
    try {
      // Create a Supabase client for server-side
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        // Redirect to dashboard after successful verification
        return NextResponse.redirect(new URL(next, request.url))
      }
    } catch (err) {
      console.error("Error exchanging code for session:", err)
    }
  }

  // If there's an error or no code, redirect to login
  return NextResponse.redirect(new URL("/login", request.url))
}

