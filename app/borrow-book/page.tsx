"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BookOpen, Loader2, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Book {
  id: string
  title: string
  author: string
  genre?: string
  available?: boolean
}

export default function BorrowBook() {
  const router = useRouter()
  const [bookId, setBookId] = useState("")
  const [username, setUsername] = useState("")
  const [borrowDays, setBorrowDays] = useState("7")
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [book, setBook] = useState<Book | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [allBooks, setAllBooks] = useState<Book[]>([])

  // Enhanced fetch with error handling
  const fetchBooks = async () => {
    try {
      const res = await fetch("https://frntz8g5yg.execute-api.us-east-1.amazonaws.com/dev/books")
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      
      // Validate response structure
      if (!Array.isArray(data)) {
        throw new Error("Invalid response format: expected array of books")
      }
      
      setAllBooks(data)
    } catch (err) {
      console.error("Dashboard load error:", err)
      toast({
        title: "Failed to load books",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearchLoading(true)
    setBook(null)
    setNotFound(false)
    setErrorMessage("")

    try {
      if (!bookId.trim()) {
        throw new Error("Please enter a book ID")
      }

      const response = await fetch(
        `https://frntz8g5yg.execute-api.us-east-1.amazonaws.com/dev/books/${bookId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 404) {
          setNotFound(true)
          return
        }
        throw new Error(data.message || `Failed to fetch book (status: ${response.status})`)
      }

      // Validate book data structure
      if (!data.id || !data.title || !data.author) {
        throw new Error("Invalid book data received from server")
      }

      setBook(data)
    } catch (error) {
      console.error("Search Error:", error)
      const message = error instanceof Error ? error.message : "An unknown error occurred"
      setErrorMessage(message)
      toast({
        title: "Search Failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setSearchLoading(false)
    }
  }

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate inputs
      if (!bookId.trim()) throw new Error("Please select a book first")
      if (!username.trim()) throw new Error("Please enter your username")
      if (!book) throw new Error("No book selected")

      const borrowData = {
        bookId,
        username,
        borrowDays: Number(borrowDays),
        borrowDate: new Date().toISOString(),
      }

      const response = await fetch(
        "https://frntz8g5yg.execute-api.us-east-1.amazonaws.com/dev/borrow",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(borrowData),
        }
      )

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(
          responseData.message || 
          `Borrow failed with status ${response.status}`
        )
      }

      // Success handling
      toast({
        title: "Success!",
        description: `"${book.title}" borrowed for ${borrowDays} days`,
      })

      // Reset form
      setBookId("")
      setUsername("")
      setBook(null)
      setBorrowDays("7")
      
      // Refresh books list
      await fetchBooks()

    } catch (error) {
      console.error("Borrow Error:", error)
      toast({
        title: "Borrow Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyId = (id: string) => {
    setBookId(id)
    toast({
      title: "Book ID Copied",
      description: `Ready to search for book ${id}`,
    })
  }

  return (
    <div className="container mx-auto py-10 space-y-10">
      {/* Dashboard section to view books and copy their IDs */}
      <Card>
        <CardHeader>
          <CardTitle>Books Dashboard</CardTitle>
          <CardDescription>Click a Book ID to auto-fill the search</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allBooks.map((book) => (
            <div
              key={book.id}
              className="border p-4 rounded-md shadow hover:bg-gray-100 transition cursor-pointer"
              onClick={() => handleCopyId(book.id)}
            >
              <p><strong>ID:</strong> {book.id}</p>
              <p><strong>Title:</strong> {book.title}</p>
              <p><strong>Author:</strong> {book.author}</p>
            </div>
          ))}
        </CardContent>
      </Card>
  
      {/* Search form */}
      <Card>
        <CardHeader>
          <CardTitle>Search Book by ID</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Enter Book ID"
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
            />
            <Button type="submit" disabled={searchLoading}>
              {searchLoading ? <Loader2 className="animate-spin" /> : <Search />}
            </Button>
          </form>
          {notFound && <Alert variant="destructive" className="mt-4">
            <AlertTitle>Book Not Found</AlertTitle>
            <AlertDescription>No book found with ID {bookId}</AlertDescription>
          </Alert>}
          {book && (
            <div className="mt-4 space-y-1">
              <p><strong>Title:</strong> {book.title}</p>
              <p><strong>Author:</strong> {book.author}</p>
              <p><strong>Genre:</strong> {book.genre || "N/A"}</p>
            </div>
          )}
        </CardContent>
      </Card>
  
      {/* Borrow form */}
      {book && (
        <Card>
          <CardHeader>
            <CardTitle>Borrow This Book</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBorrow} className="space-y-4">
              <div>
                <Label>Username</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <Label>Borrow Duration (days)</Label>
                <Select
                  defaultValue={borrowDays}
                  onValueChange={(val) => setBorrowDays(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7</SelectItem>
                    <SelectItem value="14">14</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "Borrow"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
  
      <Toaster />
    </div>
  )
}  