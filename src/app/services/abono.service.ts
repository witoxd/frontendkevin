import { Injectable } from "@angular/core"
import  { HttpClient, HttpErrorResponse } from "@angular/common/http"
import {  Observable, throwError } from "rxjs"
import { catchError, map } from "rxjs/operators"
import  { Abono, CreateAbonoRequest, UpdateAbonoRequest } from "../models/abono.model"
import  { ApiResponse } from "../models/api-response.model"
import {   HttpHeaders } from "@angular/common/http"

@Injectable({
  providedIn: "root",
})
export class AbonoService {
  private readonly apiUrl = "http://localhost:3000/api/abonos"

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

  getAbonos(): Observable<Abono[]> {
    return this.http.get<ApiResponse<Abono[]>>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  getAbonoById(id: number): Observable<Abono> {
    return this.http.get<ApiResponse<Abono>>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  getAbonosByEmpeno(empenoId: number): Observable<Abono[]> {
    return this.http.get<ApiResponse<Abono[]>>(`${this.apiUrl}/empeno/${empenoId}`, { headers: this.getAuthHeaders() }).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  createAbono(abonoData: CreateAbonoRequest): Observable<Abono> {
    return this.http.post<ApiResponse<Abono>>(this.apiUrl, abonoData, { headers: this.getAuthHeaders() }).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  updateAbono(id: number, abonoData: UpdateAbonoRequest): Observable<Abono> {
    return this.http.put<ApiResponse<Abono>>(`${this.apiUrl}/${id}`, abonoData, { headers: this.getAuthHeaders() }).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  deleteAbono(id: number): Observable<any> {
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
