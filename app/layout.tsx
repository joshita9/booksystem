import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import Navbar from "@/components/navbar"
import { cookies } from "next/headers"

export const metadata: Metadata = {
  title: "Book Management System",
  description: "Manage your book collection",
  generator: "v0.dev",
}

// ✅ Make it async
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // ✅ Await cookies()
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.has("auth_token")

  return (
    <html lang="en">
      <body>
        {isAuthenticated && <Navbar />}
        {children}
      </body>
    </html>
  )
}
