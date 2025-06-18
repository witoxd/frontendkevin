import { Injectable } from "@angular/core"
import {  HttpClient, HttpHeaders, type HttpErrorResponse } from "@angular/common/http"
import {  Observable, throwError } from "rxjs"
import { catchError, map } from "rxjs/operators"
import  { Cliente, CreateClienteRequest, UpdateClienteRequest } from "../models/cliente.model"
import  { ApiResponse } from "../models/api-response.model"

@Injectable({
  providedIn: "root",
})
export class ClienteService {
  private readonly apiUrl = "http://localhost:3000/api/clientes"

  constructor(private http: HttpClient) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''

  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem("authToken")
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    })
  }

  getClientes(): Observable<Cliente[]> {
    return this.http
      .get<ApiResponse<Cliente[]>>(this.apiUrl, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((response) => response.data || []),
        catchError(this.handleError),
      )
  }

  getClienteById(id: number): Observable<Cliente> {
    return this.http
      .get<ApiResponse<Cliente>>(`${this.apiUrl}/${id}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((response) => response.data!),
        catchError(this.handleError),
      )
  }

  getClienteByCedula(cedula: string): Observable<Cliente> {
    return this.http
      .get<ApiResponse<Cliente>>(`${this.apiUrl}/cedula/${cedula}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((response) => response.data!),
        catchError(this.handleError),
      )
  }

  createCliente(clienteData: CreateClienteRequest): Observable<Cliente> {
    return this.http
      .post<ApiResponse<Cliente>>(this.apiUrl, clienteData, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((response) => response.data!),
        catchError(this.handleError),
      )
  }

  updateCliente(id: number, clienteData: UpdateClienteRequest): Observable<Cliente> {
    return this.http
      .put<ApiResponse<Cliente>>(`${this.apiUrl}/${id}`, clienteData, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((response) => response.data!),
        catchError(this.handleError),
      )
  }

  deleteCliente(id: number): Observable<any> {
    return this.http
      .delete<ApiResponse<any>>(`${this.apiUrl}/${id}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError(this.handleError))
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = "Ha ocurrido un error desconocido"

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`
    } else {
      if (error.status === 401) {
        errorMessage = "No autorizado. Por favor, inicia sesión nuevamente."
        localStorage.removeItem("authToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("userData")
      } else if (error.status === 403) {
        errorMessage = "No tienes permisos para realizar esta acción."
      } else if (error.status === 404) {
        errorMessage = "Cliente no encontrado."
      } else {
        errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`
      }
    }

    return throwError(() => new Error(errorMessage))
  }
}
