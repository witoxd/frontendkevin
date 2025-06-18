export interface Prenda {
  id: number
  descripcion: string
  peso?: number // Cambiado de peso_gramos a peso
  kilates?: number
  valor_estimado: number
  estado: "disponible" | "empenada" | "vendida" | "perdida"
  cliente_id?: number
  empeno_id?: number
  imagen_url?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CreatePrendaRequest {
  descripcion: string
  peso_gramos?: number
  kilates?: number
  valor_estimado: number
  estado?: "disponible" | "empenada" | "vendida" | "perdida"
  cliente_id?: number
  empeno_id?: number
  imagen_url?: string
}

export interface UpdatePrendaRequest {
  descripcion?: string
  peso_gramos?: number
  kilates?: number
  valor_estimado?: number
  estado?: "disponible" | "empenada" | "vendida" | "perdida"
  cliente_id?: number
  empeno_id?: number
  imagen_url?: string
}

// Interface para manejar la respuesta de Sequelize
export interface SequelizePrenda {
  dataValues: Prenda
  _previousDataValues: Prenda
  uniqno: number
  _changed: Set<any>
  _options: any
  isNewRecord: boolean
}
