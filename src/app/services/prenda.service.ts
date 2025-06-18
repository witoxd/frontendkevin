import { Injectable } from "@angular/core"
import  { HttpClient, HttpErrorResponse } from "@angular/common/http"
import {  Observable, throwError } from "rxjs"
import { catchError, map, tap } from "rxjs/operators"
import  { Prenda, CreatePrendaRequest, UpdatePrendaRequest } from "../models/prenda.model"
import  { ApiResponse } from "../models/api-response.model"
import { HttpHeaders } from "@angular/common/http"

@Injectable({
  providedIn: "root",
})
export class PrendaService {
  private readonly apiUrl = "http://localhost:3000/api/prendas"

  constructor(private http: HttpClient) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""
  }

  private checkAuth(): void {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    if (!token) {
      throw new Error("Usuario no autenticado")
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    if (!token) {
      throw new Error("No hay token de autenticación disponible")
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    })
  }

  // Función para normalizar los datos de Sequelize
  private normalizePrendaData(data: any): Prenda {
    console.log("🔧 Normalizando prenda:", data)

    // Si es un objeto de Sequelize, extraer dataValues
    if (data && data.dataValues) {
      console.log("📦 Extrayendo dataValues:", data.dataValues)
      const normalized = {
        id: data.dataValues.id,
        descripcion: data.dataValues.descripcion,
        peso: data.dataValues.peso_gramos ? Number.parseFloat(data.dataValues.peso_gramos) : undefined,
        kilates: data.dataValues.kilates ? Number.parseFloat(data.dataValues.kilates) : undefined,
        valor_estimado: Number.parseFloat(data.dataValues.valor_estimado),
        estado: data.dataValues.estado || "empenada",
        cliente_id: data.dataValues.cliente_id,
        empeno_id: data.dataValues.empeno_id,
        imagen_url: data.dataValues.imagen_url,
        createdAt: data.dataValues.createdAt ? new Date(data.dataValues.createdAt) : undefined,
        updatedAt: data.dataValues.updatedAt ? new Date(data.dataValues.updatedAt) : undefined,
      }
      console.log("✅ Prenda normalizada desde dataValues:", normalized)
      return normalized
    }

    // Si ya es un objeto plano, devolverlo tal como está
    console.log("📄 Objeto plano detectado")
    const normalized = {
      id: data.id,
      descripcion: data.descripcion,
      peso: data.peso_gramos ? Number.parseFloat(data.peso_gramos) : undefined,
      kilates: data.kilates ? Number.parseFloat(data.kilates) : undefined,
      valor_estimado: Number.parseFloat(data.valor_estimado),
      estado: data.estado || "empenada",
      cliente_id: data.cliente_id,
      empeno_id: data.empeno_id,
      imagen_url: data.imagen_url,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    }
    console.log("✅ Prenda normalizada desde objeto plano:", normalized)
    return normalized
  }

  getPrendas(): Observable<Prenda[]> {
    return this.http.get<ApiResponse<any[]>>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      map((response) => {
        const data = response.data || []
        return data.map((item) => this.normalizePrendaData(item))
      }),
      catchError(this.handleError),
    )
  }

  getPrendaById(id: number): Observable<Prenda> {
    return this.http
      .get<ApiResponse<any>>(`http://localhost:3000/api/empenos/${id}/prendas`, { headers: this.getAuthHeaders() })
      .pipe(
        map((response) => this.normalizePrendaData(response.data!)),
        catchError(this.handleError),
      )
  }

 getPrendasByEmpeno(empenoId: number): Observable<Prenda[]> {
  this.checkAuth();

  return this.http
    .get<{ success: boolean; data: { prendas: Prenda[] } }>(
      `http://localhost:3000/api/empenos/${empenoId}/prendas`,
      {
        headers: this.getAuthHeaders(),
      }
    )
    .pipe(
      map((response) => {
        const prendas = response?.data?.prendas ?? [];
        return prendas.map((item) => this.normalizePrendaData(item));
      }),
      catchError((error) => {
        console.error("❌ Error en getPrendasByEmpeno:", error);
        return this.handleError(error);
      })
    );
}


  getPrendasByEstado(estado: string): Observable<Prenda[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/${estado}`, { headers: this.getAuthHeaders() }).pipe(
      map((response) => {
        const data = response.data || []
        return data.map((item) => this.normalizePrendaData(item))
      }),
      catchError(this.handleError),
    )
  }

  createPrenda(prendaData: CreatePrendaRequest): Observable<Prenda> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, prendaData, { headers: this.getAuthHeaders() }).pipe(
      map((response) => this.normalizePrendaData(response.data!)),
      catchError(this.handleError),
    )
  }

  updatePrenda(id: number, prendaData: UpdatePrendaRequest): Observable<Prenda> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, prendaData, { headers: this.getAuthHeaders() }).pipe(
      map((response) => this.normalizePrendaData(response.data!)),
      catchError(this.handleError),
    )
  }

  deletePrenda(id: number): Observable<any> {
    return this.http
      .delete<ApiResponse<any>>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError))
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = "Ha ocurrido un error desconocido"

    console.error("🚨 Error HTTP completo:", error)

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`
    } else {
      if (error.status === 401) {
        errorMessage = "Sesión expirada. Por favor, inicia sesión nuevamente."
        if (typeof window !== "undefined") {
          localStorage.removeItem("authToken")
          localStorage.removeItem("refreshToken")
          localStorage.removeItem("currentUser")
          window.location.href = "/login"
        }
      } else if (error.status === 403) {
        errorMessage = "No tienes permisos para realizar esta acción."
      } else {
        errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`
      }
    }

    return throwError(() => new Error(errorMessage))
  }
}
