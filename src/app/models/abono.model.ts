export interface Abono {
  id: number
  monto: number
  fecha_abono: Date
  empeno_id: number
  tipo_abono: "interes" | "capital"
  observaciones?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateAbonoRequest {
  monto: number
  fecha_abono?: Date
  empeno_id: number
  tipo_abono: "interes" | "capital"
  observaciones?: string
}

export interface UpdateAbonoRequest {
  monto?: number
  fecha_abono?: Date
  empeno_id?: number
  tipo_abono?: "interes" | "capital"
  observaciones?: string
}
