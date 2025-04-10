"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpen, LogOut, BookPlus, BookCheck, BookMarked, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteCookie } from "@/lib/auth"

export default function Navbar() {
  const router = useRouter()

  const handleLogout = () => {
    deleteCookie("auth_token")
    router.push("/login")
  }

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          <span className="font-semibold text-lg">Book Management</span>
        </Link>

        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="flex items-center gap-2">
            <Link href="/borrow-book">
              <BookPlus className="h-4 w-4" />
              <span>Borrow</span>
            </Link>
          </Button>
          
          <Button asChild variant="ghost" size="sm" className="flex items-center gap-2">
            <Link href="/return-book">
              <BookCheck className="h-4 w-4" />
              <span>Return</span>
            </Link>
          </Button>
          
          <Button asChild variant="ghost" size="sm" className="flex items-center gap-2">
            <Link href="/get-book">
              <BookMarked className="h-4 w-4" />
              <span>Get Info</span>
            </Link>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}