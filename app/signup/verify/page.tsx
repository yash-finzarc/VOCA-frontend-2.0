"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Phone, Mail, CheckCircle2, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/supabase/client"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, supabaseUser, isLoading: authLoading } = useAuth()
  const email = searchParams.get("email") || ""
  const [isVerifying, setIsVerifying] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Check if user is already verified and has a session
    const checkVerification = async () => {
      try {
        // First check current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (session && session.user) {
          // User has a session, check if email is confirmed
          if (session.user.email_confirmed_at) {
            setIsVerified(true)
            setIsVerifying(false)
            // Wait a moment then redirect
            setTimeout(() => {
              router.push("/dashboard")
            }, 1500)
            return
          }
        }

        // Also check URL hash for auth tokens (in case user just clicked email link)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        if (hashParams.get('access_token')) {
          // User just verified via email link, session should be set soon
          setIsVerifying(true)
        }

        // Set up auth state listener to detect when email is verified
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state changed:", event, session?.user?.email_confirmed_at ? "verified" : "not verified")
          
          if (session?.user?.email_confirmed_at) {
            setIsVerified(true)
            setIsVerifying(false)
            // Wait a moment for session to be fully established, then redirect
            setTimeout(() => {
              router.push("/dashboard")
            }, 2000)
          }
        })

        // Also poll for verification status every 3 seconds
        const pollInterval = setInterval(async () => {
          try {
            const { data: { session: currentSession } } = await supabase.auth.getSession()
            if (currentSession?.user?.email_confirmed_at) {
              setIsVerified(true)
              setIsVerifying(false)
              clearInterval(pollInterval)
              setTimeout(() => {
                router.push("/dashboard")
              }, 1500)
            }
          } catch (err) {
            console.error("Error checking verification:", err)
          }
        }, 3000)

        return () => {
          subscription.unsubscribe()
          clearInterval(pollInterval)
        }
      } catch (err) {
        console.error("Error setting up verification check:", err)
        setError("An error occurred while checking verification status")
        setIsVerifying(false)
      }
    }

    checkVerification()
  }, [router])

  // If user is already logged in and verified, redirect immediately
  useEffect(() => {
    if (!authLoading && user && supabaseUser?.email_confirmed_at) {
      router.push("/dashboard")
    }
  }, [user, supabaseUser, authLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <Phone className="w-6 h-6 text-accent-foreground" />
            </div>
            <span className="text-2xl font-bold">VOCA</span>
          </div>
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>
            {isVerified
              ? "Email verified! Redirecting you to your dashboard..."
              : "We've sent a verification link to your email"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isVerified ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">Email verified!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your account has been verified. Redirecting you now...
                </p>
              </div>
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                  <Mail className="w-8 h-8 text-accent-foreground" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium">
                    Check your inbox at
                  </p>
                  <p className="text-sm font-semibold text-accent break-all">
                    {email || "your email"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Click the verification link in the email to activate your account.
                  </p>
                </div>
              </div>

              {isVerifying && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Waiting for verification...</span>
                </div>
              )}

              {error && (
                <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-3 pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  Didn't receive the email? Check your spam folder or
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    if (email) {
                      try {
                        const { error } = await supabase.auth.resend({
                          type: "signup",
                          email: email,
                        })
                        if (error) {
                          setError(error.message)
                        } else {
                          setError("")
                          // Show success message
                          alert("Verification email resent! Please check your inbox.")
                        }
                      } catch (err) {
                        setError("Failed to resend email. Please try again later.")
                      }
                    }
                  }}
                >
                  Resend verification email
                </Button>
              </div>
            </>
          )}
        </CardContent>
        <CardContent className="pt-0">
          <div className="text-sm text-center text-muted-foreground">
            <Link href="/login" className="text-accent hover:underline">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

