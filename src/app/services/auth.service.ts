import { Injectable } from "@angular/core"
import  { HttpClient, HttpErrorResponse } from "@angular/common/http"
import {  Observable, throwError } from "rxjs"
import { catchError, map } from "rxjs/operators"
import  {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from "../models/auth.model"
import  { ApiResponse } from "../models/api-response.model"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly apiUrl = "http://localhost:3000/api/auth"

  constructor(private http: HttpClient) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''

  }

login(credentials: LoginRequest): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
    catchError(this.handleError),
  )
}


  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<ApiResponse<RegisterResponse>>(`${this.apiUrl}/register`, userData).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  refreshToken(refreshTokenData: RefreshTokenRequest): Observable<RefreshTokenResponse> {
    return this.http.post<ApiResponse<RefreshTokenResponse>>(`${this.apiUrl}/refresh`, refreshTokenData).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  logout(): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/logout`, {}).pipe(catchError(this.handleError))
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
