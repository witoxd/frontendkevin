export interface Role {
  id: number
  name: string
  description?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateRoleRequest {
  name: string
  description?: string
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
}
