export interface Book {
  id: string
  title: string
  author: string
  genre: string
  published_year: number
  rating: number
}

export interface BookFormData {
  id: string
  title: string
  author: string
  genre: string
  published_year: string
  rating: string
}

export interface BorrowRecord {
  id: string
  bookId: string
  username: string
  borrowDate: string
  borrowDays: number
  status: string
  returnDate?: string
}
