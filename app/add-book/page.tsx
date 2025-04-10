"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { setCookie, getCookie } from "@/lib/auth"
import { Loader2 } from "lucide-react"

export default function AddBook() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [authenticating, setAuthenticating] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    published_year: "",
    rating: "",
  })

  // Handle authentication callback
  useEffect(() => {
    const code = searchParams.get("code")
    const errorParam = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")

    if (code) {
      setAuthenticating(true)
      setCookie("add_book_token", code, 1) // 1 day expiration
      window.history.replaceState({}, document.title, "/add-book")
      setAuthenticating(false)
    }

    if (errorParam) {
      setAuthError(errorDescription || "Authentication failed")
      setAuthenticating(false)
    }

    const token = getCookie("add_book_token")
    if (!token && !code) {
      router.push("/")
    }
  }, [searchParams, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.title.trim() || !formData.author.trim()) {
        throw new Error("Title and Author are required fields")
      }

      const bookData = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        genre: formData.genre.trim(),
        published_year: formData.published_year ? Number(formData.published_year) : 0,
        rating: formData.rating ? Number(formData.rating) : 0,
      }

      const response = await fetch("https://frntz8g5yg.execute-api.us-east-1.amazonaws.com/dev/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      })

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error("Failed to parse response:", parseError)
      }

      // Special handling for successful DB writes with 500 status
      if (data?.message?.toLowerCase().includes("success") || data?.book) {
        toast({
          title: "✅ Book Added Successfully",
          description: "The book has been stored in the database.",
          duration: 5000,
        })

        setFormData({
          title: "",
          author: "",
          genre: "",
          published_year: "",
          rating: "",
        })

        setTimeout(() => router.push("/"), 2000)
        return
      }

      if(response.ok){
        // Handle successful response
        toast({
          title: "✅ Book Added Successfully",
          description: "The book has been stored in the database.",
          duration: 5000,
        })
      }

      // Standard success case
      

      setFormData({
        title: "",
        author: "",
        genre: "",
        published_year: "",
        rating: "",
      })

      setTimeout(() => router.push("/"), 2000)

    } catch (error) {
      console.error("Submission error:", error)
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  if (authenticating) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-10">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Error</CardTitle>
            <CardDescription>Unable to verify your credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-destructive">{authError}</p>
            <Button onClick={() => router.push("/")} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Add New Book</CardTitle>
          <CardDescription>Enter the book details below</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Book title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="Author name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                placeholder="Book genre"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="published_year">Published Year</Label>
              <Input
                id="published_year"
                name="published_year"
                type="number"
                value={formData.published_year}
                onChange={handleChange}
                placeholder="Publication year"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (0-5)</Label>
              <Input
                id="rating"
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={handleChange}
                placeholder="Book rating"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Uploading..." : "Add Book"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <Toaster />
    </div>
  )
}