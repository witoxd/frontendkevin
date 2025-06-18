import { Injectable } from "@angular/core"
import  { HttpClient, HttpErrorResponse } from "@angular/common/http"
import {  Observable, throwError } from "rxjs"
import { catchError, map } from "rxjs/operators"
import  { Asistente, CreateAsistenteRequest, UpdateAsistenteRequest } from "../models/asistente.model"
import  { ApiResponse } from "../models/api-response.model"

@Injectable({
  providedIn: "root",
})
export class AsistenteService {
  private readonly apiUrl = "http://localhost:3000/api/asistentes"

  constructor(private http: HttpClient) {}

  getAsistentes(): Observable<Asistente[]> {
    return this.http.get<ApiResponse<Asistente[]>>(this.apiUrl).pipe(
      map((response) => response.data || []),
      catchError(this.handleError),
    )
  }

  getAsistenteById(id: number): Observable<Asistente> {
    return this.http.get<ApiResponse<Asistente>>(`${this.apiUrl}/${id}`).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  createAsistente(asistenteData: CreateAsistenteRequest): Observable<Asistente> {
    return this.http.post<ApiResponse<Asistente>>(this.apiUrl, asistenteData).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  updateAsistente(id: number, asistenteData: UpdateAsistenteRequest): Observable<Asistente> {
    return this.http.put<ApiResponse<Asistente>>(`${this.apiUrl}/${id}`, asistenteData).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  deleteAsistente(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError))
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = "Ha ocurrido un error desconocido"

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`
    } else {
      if (error.status === 404) {
        errorMessage = "Asistente no encontrado."
      } else {
        errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`
      }
    }

    return throwError(() => new Error(errorMessage))
  }
}
