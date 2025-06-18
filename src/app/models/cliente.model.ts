export interface Cliente {
  id: number
  nombre: string
  documento: string
  telefono: string
  direccion: string
  correo: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateClienteRequest {
  nombre: string
  documento: string
  telefono: string
  direccion: string
  correo: string
}

export interface UpdateClienteRequest {
  nombre?: string
  documento?: string
  telefono?: string
  direccion?: string
  correo?: string
}
