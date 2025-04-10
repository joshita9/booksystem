"use client"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { setCookie } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get the authorization code from URL query parameters
    const code = searchParams.get("code")
    const errorParam = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")

    // Handle error from Cognito
    if (errorParam) {
      console.error("Auth error:", errorParam, errorDescription)
      setError(errorDescription || "Authentication failed")
      setLoading(false)
      return
    }

    // Check if code exists
    if (!code) {
      console.error("No code in callback URL")
      setError("No authorization code received")
      setLoading(false)
      return
    }

    console.log("Auth code received, setting cookie")
    setCookie("auth_token", code, {
      maxAge: 3600, // 1 hour
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    // Redirect to home page
    console.log("Redirecting to home page")
    router.push("/")
  }, [router, searchParams])

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      {error ? (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Error</CardTitle>
            <CardDescription>There was a problem signing you in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => router.push("/login")} className="w-full">
              Return to Login
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Completing authentication...</p>
        </div>
      )}
    </div>
  )
}
