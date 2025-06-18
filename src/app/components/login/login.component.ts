import { Component,  OnInit } from "@angular/core"
import {  FormBuilder,  FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import  { Router } from "@angular/router"
import { CommonModule } from "@angular/common"
import  { AuthService } from "../../services/auth.service"
import  { LoginRequest } from "../../models/auth.model"
import { RouterModule } from '@angular/router';
@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
   providers: [AuthService]

})
export class LoginComponent implements OnInit {
  loginForm: FormGroup
  isLoading = false
  errorMessage = ""

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    })
  }

  ngOnInit(): void {}

  get email() {
    return this.loginForm.get("email")
  }

  get password() {
    return this.loginForm.get("password")
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true
      this.errorMessage = ""

      const loginData: LoginRequest = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
      }

      this.authService.login(loginData).subscribe({
        next: (response) => {
          // Guardar token y datos del usuario
          // en localStorage para su uso posterior
          // Importante para usarlo en los servicios y mandar el token en las peticiones
          // y asi poder acceder a las rutas protegidas
          // Implementacion de autenticacion  y autorizacion unos de los requerimientos mas importantes 
          // Una desventaja de esto, es que cualquiera con acceso al navegador puede ver el token en localStorage.
          // Por lo tanto, es importante asegurarse de que el token sea seguro y no contenga información sensible.
          // Ademas de que el token tiene una fecha de expiracion y se debe manejar el refresh token
          // 
          if (response.token) {
            localStorage.setItem("authToken", response.token)
          }
          if (response.refreshToken) {
            localStorage.setItem("refreshToken", response.refreshToken)
          }
          if (response.user) {
            localStorage.setItem("currentUser", JSON.stringify(response.user))
          }

          this.isLoading = false
          // Redirigir al dashboard después del login exitoso
          this.router.navigate(["/dashboard"])
          console.log("Login exitoso:", response)
        },
        error: (error) => {
          this.isLoading = false
          this.errorMessage = error.error?.message || "Error al iniciar sesión. Verifique sus credenciales."
          console.error("Error de login:", error)
        },
      })
    } else {
      this.markFormGroupTouched()
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      const control = this.loginForm.get(key)
      control?.markAsTouched()
    })
  }

  //Manejo de errores de campos y validacion de informacion de los campos de login
  // Importante puede arrojar error si no se maneja bien los campos 
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName)
    if (field?.errors && field.touched) {
      if (field.errors["required"]) {
        return `${fieldName === "email" ? "Email" : "Contraseña"} es requerido`
      }
      if (field.errors["email"]) {
        return "Email no válido"
      }
      if (field.errors["minlength"]) {
        return "La contraseña debe tener al menos 6 caracteres"
      }
    }
    return ""
  }
}
