"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Copy, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface BorrowRecord {
  id: string
  bookId: string
  username: string
  status: string
  bookTitle?: string
  borrowDate?: string
  returnDate?: string
}

export default function ReturnBook() {
  const [loading, setLoading] = useState(true)
  const [returnLoading, setReturnLoading] = useState(false)
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([])
  const [error, setError] = useState("")
  const [copiedField, setCopiedField] = useState<{type: string, id: string} | null>(null)
  
  // Form state
  const [id, setId] = useState("")
  const [bookId, setBookId] = useState("")
  const [username, setUsername] = useState("")

  useEffect(() => {
    const fetchBorrowRecords = async () => {
      try {
        const response = await fetch(
          "https://frntz8g5yg.execute-api.us-east-1.amazonaws.com/dev/borrow",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch records: ${response.status}`)
        }

        const data = await response.json()
        setBorrowRecords(data)
      } catch (err) {
        console.log("Fetch error:", err)
        setError(err instanceof Error ? err.message : "Failed to load records")
      } finally {
        setLoading(false)
      }
    }

    fetchBorrowRecords()
  }, [])

  const copyToForm = (record: BorrowRecord, field: 'id' | 'bookId' | 'username') => {
    switch(field) {
      case 'id':
        setId(record.id)
        break
      case 'bookId':
        setBookId(record.bookId)
        break
      case 'username':
        setUsername(record.username)
        break
    }
    setCopiedField({type: field, id: record.id})
    setTimeout(() => setCopiedField(null), 2000)
    toast({
      title: "Copied",
      description: `${field} copied to form`,
    })
  }

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!id || !bookId || !username) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      })
      return
    }

    setReturnLoading(true)
    
    try {
      const response = await fetch(
        "https://frntz8g5yg.execute-api.us-east-1.amazonaws.com/dev/return",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            bookId,
            username
          }),
        }
      )

      if (response.ok) {
        try {
          const responseData = await response.json()
          
          try {
            const updatedResponse = await fetch(
              "https://frntz8g5yg.execute-api.us-east-1.amazonaws.com/dev/borrow"
            )
            if (updatedResponse.ok) {
              const updatedData = await updatedResponse.json()
              setBorrowRecords(updatedData)
            }
          } catch {
            console.log("Refresh failed")
          }

          setId("")
          setBookId("")
          setUsername("")

          toast({
            title: "Success",
            description: `Book ${bookId} returned successfully`,
          })
        } catch {
          console.log("Success response parse failed")
        }
      } else {
        let errorMessage = `Return failed (Status: ${response.status})`
        try {
          const errorData = await response.json()
          if (errorData.message || errorData.error) {
            errorMessage = errorData.message || errorData.error
          }
        } catch {
          console.log("Error response parse failed")
        }
        toast({
          title: "Return Failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Network Error",
        description: "Could not connect to the server",
        variant: "destructive",
      })
    } finally {
      setReturnLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return "Invalid date"
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Borrow List Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Borrowed Books</CardTitle>
          <CardDescription>Click on ID, Book ID or Username to copy to return form</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Book ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Borrow Date</TableHead>
                    <TableHead>Return Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {borrowRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell 
                        className="font-medium cursor-pointer hover:bg-gray-100"
                        onClick={() => copyToForm(record, 'id')}
                      >
                        <div className="flex items-center gap-2">
                          {record.id}
                          {copiedField?.type === 'id' && copiedField.id === record.id ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell 
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => copyToForm(record, 'bookId')}
                      >
                        <div className="flex items-center gap-2">
                          {record.bookId}
                          {copiedField?.type === 'bookId' && copiedField.id === record.id ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{record.bookTitle || "N/A"}</TableCell>
                      <TableCell 
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => copyToForm(record, 'username')}
                      >
                        <div className="flex items-center gap-2">
                          {record.username}
                          {copiedField?.type === 'username' && copiedField.id === record.id ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            record.status === "borrowed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(record.borrowDate)}</TableCell>
                      <TableCell>{formatDate(record.returnDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Return Book Form Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Return a Book</CardTitle>
          <CardDescription>Fill the details or click on fields above to copy</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReturnSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id">Borrow Record ID</Label>
                <Input
                  id="id"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="Click on ID from table above"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bookId">Book ID</Label>
                <Input
                  id="bookId"
                  value={bookId}
                  onChange={(e) => setBookId(e.target.value)}
                  placeholder="Click on Book ID from table above"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Click on Username from table above"
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={returnLoading}>
              {returnLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Return Book
            </Button>
          </form>
        </CardContent>
      </Card>

      <Toaster />
    </div>
  )
}