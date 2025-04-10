"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import { getCookie } from "@/lib/auth"

// AWS Cognito configuration with your provided details
const COGNITO_DOMAIN = "us-east-10niwxuec0.auth.us-east-1.amazoncognito.com"
const CLIENT_ID = "3ejtntva2t08gh0a8kucibqdit"
const REDIRECT_URI = "http://localhost:3000/auth/callback"

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    const token = getCookie("auth_token")
    if (token) {
      router.push("/")
    }
  }, [router])

  const handleLogin = () => {
    // Use the exact URL format from your example
    const loginUrl = `https://${COGNITO_DOMAIN}/login?client_id=${CLIENT_ID}&response_type=code&scope=email+openid&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
    console.log("Redirecting to:", loginUrl)
    window.location.href = loginUrl
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl">Book Management System</CardTitle>
          <CardDescription>Sign in to access your book collection</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button size="lg" onClick={handleLogin} className="w-full max-w-xs">
            Sign in with AWS Cognito
          </Button>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          Secure authentication powered by AWS Cognito
        </CardFooter>
      </Card>
    </div>
  )
}
