export interface Asistente {
  id: number
  nombre: string
  telefono: string
  edad: number
  invitado_id: number
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateAsistenteRequest {
  nombre: string
  telefono: string
  edad: number
  invitado_id: number
}

export interface UpdateAsistenteRequest {
  nombre?: string
  telefono?: string
  edad?: number
  invitado_id?: number
}
