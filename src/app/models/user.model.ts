export interface User {
  id: number
  username: string
  email: string
  password?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  password?: string
}
