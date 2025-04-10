import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/login" ||
    path.startsWith("/auth/") ||
    path === "/api/auth/token" ||
    path.includes("_next") ||
    path.includes("favicon.ico")

  // Check if the user is authenticated
  const token = request.cookies.get("auth_token")?.value
  const isAuthenticated = !!token

  // Special case for add-book path
  const isAddBookPath = path === "/add-book"
  const addBookToken = request.cookies.get("add_book_token")?.value
  const isAddBookAuthenticated = !!addBookToken

  // Allow access to add-book if they have the specific token for it
  if (isAddBookPath && isAddBookAuthenticated) {
    return NextResponse.next()
  }

  // Redirect logic
  if (!isAuthenticated && !isPublicPath && !isAddBookPath) {
    // Redirect unauthenticated users to login page
    console.log("Redirecting unauthenticated user to login:", path)
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAuthenticated && path === "/login") {
    // Redirect authenticated users to home page if they try to access login
    console.log("Redirecting authenticated user to home")
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

// Match all paths except static assets
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
