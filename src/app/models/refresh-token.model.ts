export interface RefreshToken {
  id: number
  token: string
  userId: number
  expiresAt: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateRefreshTokenRequest {
  token: string
  userId: number
  expiresAt: Date
}
