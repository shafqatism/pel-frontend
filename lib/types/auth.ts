export interface User {
  id: string
  email: string
  fullName: string
  role: string
}

export interface AuthResponse {
  user: User
  access_token: string
}
