import { Injectable } from "@angular/core"
import  { HttpClient, HttpErrorResponse } from "@angular/common/http"
import {  Observable, throwError } from "rxjs"
import { catchError, map } from "rxjs/operators"
import  {
  PrendaPerdida,
  CreatePrendaPerdidaRequest,
  UpdatePrendaPerdidaRequest,
} from "../models/prenda-perdida.model"
import  { ApiResponse } from "../models/api-response.model"

@Injectable({
  providedIn: "root",
})
export class PrendaPerdidaService {
  private readonly apiUrl = "http://localhost:3000/api/prendas-perdidas"

  constructor(private http: HttpClient) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''

  }

  getPrendasPerdidas(): Observable<PrendaPerdida[]> {
    return this.http.get<ApiResponse<PrendaPerdida[]>>(this.apiUrl).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  getPrendaPerdidaById(id: number): Observable<PrendaPerdida> {
    return this.http.get<ApiResponse<PrendaPerdida>>(`${this.apiUrl}/${id}`).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  getPrendasPerdidasByPrenda(prendaId: number): Observable<PrendaPerdida[]> {
    return this.http.get<ApiResponse<PrendaPerdida[]>>(`${this.apiUrl}/prenda/${prendaId}`).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  getPrendasPerdidasByEmpeno(empenoId: number): Observable<PrendaPerdida[]> {
    return this.http.get<ApiResponse<PrendaPerdida[]>>(`${this.apiUrl}/empeno/${empenoId}`).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  createPrendaPerdida(prendaPerdidaData: CreatePrendaPerdidaRequest): Observable<PrendaPerdida> {
    return this.http.post<ApiResponse<PrendaPerdida>>(this.apiUrl, prendaPerdidaData).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  updatePrendaPerdida(id: number, prendaPerdidaData: UpdatePrendaPerdidaRequest): Observable<PrendaPerdida> {
    return this.http.put<ApiResponse<PrendaPerdida>>(`${this.apiUrl}/${id}`, prendaPerdidaData).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  deletePrendaPerdida(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError))
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
