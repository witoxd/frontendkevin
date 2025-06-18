import { Injectable } from "@angular/core"
import  { HttpClient, HttpErrorResponse } from "@angular/common/http"
import {  Observable, throwError } from "rxjs"
import { catchError, map } from "rxjs/operators"
import  { User, CreateUserRequest, UpdateUserRequest } from "../models/user.model"
import  { ApiResponse } from "../models/api-response.model"

@Injectable({
  providedIn: "root",
})
export class UserService {
  private readonly apiUrl = "http://localhost:3000/api/users"

  constructor(private http: HttpClient) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''

  }

  getUsers(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(this.apiUrl).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${id}`).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  createUser(userData: CreateUserRequest): Observable<User> {
    return this.http.post<ApiResponse<User>>(this.apiUrl, userData).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  updateUser(id: number, userData: UpdateUserRequest): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/${id}`, userData).pipe(
      map((response) => response.data!),
      catchError(this.handleError),
    )
  }

  deleteUser(id: number): Observable<any> {
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
