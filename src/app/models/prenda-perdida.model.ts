export interface PrendaPerdida {
  id: number
  fecha_perdida: Date
  motivo?: string
  prendaId: number
  empenoId: number
  userId: number
  createdAt?: Date
  updatedAt?: Date
}

export interface CreatePrendaPerdidaRequest {
  fecha_perdida: Date
  motivo?: string
  prendaId: number
  empenoId: number
  userId: number
}

export interface UpdatePrendaPerdidaRequest {
  fecha_perdida?: Date
  motivo?: string
  prendaId?: number
  empenoId?: number
  userId?: number
}
