export interface Permission {
  id?: string
  roleId?: string
  module: string
  action: string
}

export interface Role {
  id: string
  name: string
  description?: string
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

export interface CreateRoleDto {
  name: string
  description?: string
  permissions: {
    module: string
    action: string
  }[]
}
