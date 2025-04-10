"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, BookMarked, BookUp } from "lucide-react"
import AddBookButton from "@/components/add-book-button"

export default function HomeButtons() {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
      <AddBookButton />

      <Link href="/get-book">
        <Button className="w-48 h-16 text-lg gap-2" variant="outline">
          <BookOpen size={20} />
          Get Book
        </Button>
      </Link>

      <Link href="/borrow-book">
        <Button className="w-48 h-16 text-lg gap-2" variant="outline">
          <BookMarked size={20} />
          Borrow Book
        </Button>
      </Link>

      <Link href="/return-book">
        <Button className="w-48 h-16 text-lg gap-2" variant="outline">
          <BookUp size={20} />
          Return Book
        </Button>
      </Link>
    </div>
  )
}
