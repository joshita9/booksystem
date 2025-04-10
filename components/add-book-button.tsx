"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getCookie } from "@/lib/auth"

// Cognito configuration for Add Book feature
const COGNITO_DOMAIN = "us-east-10bh2ricil.auth.us-east-1.amazoncognito.com"
const CLIENT_ID = "5f9uq8bi165es9rjpffnevjdcp"
const REDIRECT_URI = "http://localhost:3000/add-book"

export default function AddBookButton() {
  const handleAddBook = () => {
    // Check if user is already authenticated for add-book
    const token = getCookie("add_book_token")

    if (token) {
      // If already authenticated, go directly to add-book page
      window.location.href = "/add-book"
    } else {
      // Otherwise, redirect to Cognito login
      const loginUrl = `https://${COGNITO_DOMAIN}/login?client_id=${CLIENT_ID}&response_type=code&scope=email+openid+phone&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
      console.log("Redirecting to Cognito for Add Book:", loginUrl)
      window.location.href = loginUrl
    }
  }

  return (
    <Button className="w-48 h-16 text-lg gap-2" onClick={handleAddBook} variant="outline">
      <Plus size={20} />
      Add Book
    </Button>
  )
}
