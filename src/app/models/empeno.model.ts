export interface Empeno {
  id: number
  monto_prestado: number
  interes_mensual: number
  fecha_vencimiento: Date
  estado: "activo" | "recuperado" | "perdido"
  cliente_id: number
  prenda_id: number
  user_id: number
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateEmpenoWithPrendasRequest {
  cliente_id: number
  monto_prestado: number
  interes_mensual: number
  fecha_vencimiento?: string
  estado?: string
  prendas: {
    descripcion: string
    peso_gramos: number
    valor_estimado: number
  }[]
}

export interface UpdateEmpenoRequest {
  monto_prestado?: number
  interes_mensual?: number
  fecha_vencimiento?: Date
  estado: "activo" | "recuperado" | "perdido"
  cliente_id?: number
  prenda_id?: number
  user_id?: number
}

