export interface Permission {
  id: number
  name: string
  description?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CreatePermissionRequest {
  name: string
  description?: string
}

export interface UpdatePermissionRequest {
  name?: string
  description?: string
}
