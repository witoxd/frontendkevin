import { Injectable } from "@angular/core"
import  { HttpClient, HttpErrorResponse } from "@angular/common/http"
import {  Observable, throwError } from "rxjs"
import { catchError, map } from "rxjs/operators"
import  { Empeno, CreateEmpenoWithPrendasRequest, UpdateEmpenoRequest } from "../models/empeno.model"
import  { ApiResponse } from "../models/api-response.model"
import {   HttpHeaders } from "@angular/common/http"

@Injectable({
  providedIn: "root",
})
export class EmpenoService {
  private readonly apiUrl = "http://localhost:3000/api/empenos"

  constructor(private http: HttpClient) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''

  }

private getAuthHeaders(): HttpHeaders {
  const token = typeof window !== 'undefined' ? localStorage.getItem("authToken") : null
  return new HttpHeaders({
    Authorization: `Bearer ${token || ''}`,
    "Content-Type": "application/json",
  })
}


  getEmpenos(): Observable<Empeno[]> {
    return this.http.get<ApiResponse<Empeno[]>>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  getEmpenoById(id: number): Observable<Empeno> {
    return this.http.get<ApiResponse<Empeno>>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

    exportClienteInfo(id: number): Observable<Empeno> {
    return this.http.get<ApiResponse<Empeno>>(`${this.apiUrl}/cliente/${id}`, { headers: this.getAuthHeaders() }).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  getEmpenosByCliente(clienteId: number): Observable<Empeno[]> {
    return this.http.get<ApiResponse<Empeno[]>>(`${this.apiUrl}/${clienteId}`, { headers: this.getAuthHeaders() }).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  getEmpenosByEstado(estado: string): Observable<Empeno[]> {
    return this.http.get<ApiResponse<Empeno[]>>(`${this.apiUrl}/${estado}`, { headers: this.getAuthHeaders() }).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  getEmpenosVencidos(): Observable<Empeno[]> {
    return this.http.get<ApiResponse<Empeno[]>>(`${this.apiUrl}/vencidos`, { headers: this.getAuthHeaders() }).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  createEmpeno(empenoData: CreateEmpenoWithPrendasRequest): Observable<Empeno> {
    return this.http.post<ApiResponse<Empeno>>(this.apiUrl, empenoData, { headers: this.getAuthHeaders() }).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  updateEmpeno(id: number, empenoData: UpdateEmpenoRequest): Observable<Empeno> {
    return this.http.put<ApiResponse<Empeno>>(`${this.apiUrl}/${id}`, empenoData, { headers: this.getAuthHeaders() }).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  deleteEmpeno(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(catchError(this.handleError))
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = "Ha ocurrido un error desconocido"

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`
    } else {
      errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`
    }

    return throwError(() => new Error(errorMessage))
  }
}
