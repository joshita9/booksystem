"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BookOpen } from "lucide-react"

interface Book {
  id: string
  title: string
  author: string
  genre?: string
  published_year?: number
  rating?: number
}

export default function GetBook() {
  const router = useRouter()
  const [bookId, setBookId] = useState("")
  const [loading, setLoading] = useState(false)
  const [book, setBook] = useState<Book | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [allBooks, setAllBooks] = useState<Book[]>([])

  // Fetch all books for dashboard
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("https://frntz8g5yg.execute-api.us-east-1.amazonaws.com/dev/books")
        if (!res.ok) throw new Error("Failed to fetch books")
        const data = await res.json()
        setAllBooks(data)
      } catch (err) {
        console.error("Dashboard load error:", err)
      }
    }

    fetchBooks()
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setBook(null)
    setNotFound(false)
    setErrorMessage("")

    try {
      if (!bookId.trim()) {
        throw new Error("Please enter a book ID")
      }

      const response = await fetch(`https://frntz8g5yg.execute-api.us-east-1.amazonaws.com/dev/books/${bookId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          setNotFound(true)
          return
        }
        throw new Error("Failed to fetch book")
      }

      const data = await response.json()
      setBook(data)
    } catch (error) {
      console.error("Error fetching book:", error)

      const message =
        error instanceof Error
          ? error.message.includes("NetworkError") || error.message.includes("fetch")
            ? "Network issue or CORS error. Please try again later."
            : error.message
          : "An unknown error occurred. Please check the console for details."

      setErrorMessage(message)

      toast({
        title: "Failed to Fetch Book",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id)
    setBookId(id)
    toast({
      title: "Book ID Copied",
      description: `ID "${id}" copied and filled into the search box.`,
    })
  }

  return (
    <div className="container mx-auto py-10 space-y-10">
      {/* Dashboard Section */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Book Dashboard</CardTitle>
          <CardDescription>All Books Overview</CardDescription>
        </CardHeader>
        <CardContent>
          {allBooks.length === 0 ? (
            <p className="text-gray-500">No books available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 font-medium">ID</th>
                    <th className="px-4 py-2 font-medium">Title</th>
                    <th className="px-4 py-2 font-medium">Author</th>
                  </tr>
                </thead>
                <tbody>
                  {allBooks.map((b) => (
                    <tr key={b.id} className="border-b hover:bg-gray-100 transition">
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleCopyId(b.id)}
                          className="text-blue-600 hover:underline hover:text-blue-800"
                        >
                          {b.id}
                        </button>
                      </td>
                      <td className="px-4 py-2">{b.title}</td>
                      <td className="px-4 py-2">{b.author}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Get Book by ID Form */}
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Find a Book</CardTitle>
          <CardDescription>Enter the ID of the book you want to find</CardDescription>
        </CardHeader>
        <form onSubmit={handleSearch}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bookId">Book ID</Label>
              <Input
                id="bookId"
                value={bookId}
                onChange={(e) => setBookId(e.target.value)}
                placeholder="Enter book ID"
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/")}>
              Back
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Book Display */}
      {book && (
        <Card className="max-w-md mx-auto mt-6">
          <CardHeader>
            <CardTitle>{book.title}</CardTitle>
            <CardDescription>Book Details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">ID:</span>
              <span className="col-span-2">{book.id}</span>

              <span className="font-semibold">Author:</span>
              <span className="col-span-2">{book.author}</span>

              <span className="font-semibold">Genre:</span>
              <span className="col-span-2">{book.genre || "N/A"}</span>

              <span className="font-semibold">Published Year:</span>
              <span className="col-span-2">{book.published_year || "N/A"}</span>

              <span className="font-semibold">Rating:</span>
              <span className="col-span-2">{book.rating || "N/A"}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {notFound && (
        <Alert className="max-w-md mx-auto mt-6" variant="destructive">
          <BookOpen className="h-4 w-4" />
          <AlertTitle>Book Not Found</AlertTitle>
          <AlertDescription>No book with ID "{bookId}" was found in the database.</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert className="max-w-md mx-auto mt-6" variant="destructive">
          <BookOpen className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Toaster />
    </div>
  )
}
