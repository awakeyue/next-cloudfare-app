export interface User {
  id: number | string
  name: string
  created_at?: Date | string
}

export interface Message {
  id: number | string
  user: User
  content: string
  created_at?: Date | string
}
