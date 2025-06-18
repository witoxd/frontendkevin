export interface RoleUser {
  id: number
  userId: number
  roleId: number
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateRoleUserRequest {
  userId: number
  roleId: number
}

export interface UpdateRoleUserRequest {
  userId?: number
  roleId?: number
}
