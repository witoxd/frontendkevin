import { Component,  OnInit } from "@angular/core"
import {  FormBuilder,  FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import  { Router } from "@angular/router"
import { CommonModule } from "@angular/common"
import  { AuthService } from "../../services/auth.service"
import  { RegisterRequest } from "../../models/auth.model"
import { RouterModule } from '@angular/router';

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"],
   providers: [AuthService], 
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup
  isLoading = false
  errorMessage = ""
  successMessage = ""

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group(
      //Validacion de datos del formulario de registro
      {
        username: ["", [Validators.required, Validators.minLength(2)]],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    )
  }

  ngOnInit(): void {}

  // Getters para acceder a los controles del formulario facilita bastante el acceso a los campos del formulario
  // y mejora la legibilidad del código en las plantillas.
  // Esto es buena practica de programacion POO ajjajaja
  // mucho de lo aprendido en java sirve pa todo

  get username() {
    return this.registerForm.get("username")
  }

  get email() {
    return this.registerForm.get("email")
  }

  get password() {
    return this.registerForm.get("password")
  }

  get confirmPassword() {
    return this.registerForm.get("confirmPassword")
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get("password")
    const confirmPassword = form.get("confirmPassword")

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true })
      return { passwordMismatch: true }
    }

    if (confirmPassword?.errors?.["passwordMismatch"]) {
      delete confirmPassword.errors["passwordMismatch"]
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null)
      }
    }

    return null
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true
      this.errorMessage = ""
      this.successMessage = ""

      const registerData: RegisterRequest = {
        username: this.registerForm.value.username,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
      }

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.isLoading = false
          this.successMessage = "Registro exitoso. Puedes iniciar sesión ahora."


          console.log("Registro exitoso:", response)
        },
        error: (error) => {
          this.isLoading = false
          this.errorMessage = error.error?.message || "Error al registrar usuario. Intente nuevamente."
          console.error("Error de registro:", error)
        },
      })
    } else {
      this.markFormGroupTouched()
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach((key) => {
      const control = this.registerForm.get(key)
      control?.markAsTouched()
    })
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName)
    if (field?.errors && field.touched) {
      if (field.errors["required"]) {
        const fieldLabels: { [key: string]: string } = {
          username: "Nombre",
          email: "Email",
          password: "Contraseña",
          confirmPassword: "Confirmación de contraseña",
        }
        return `${fieldLabels[fieldName]} es requerido`
      }
      if (field.errors["email"]) {
        return "Email no válido"
      }
      if (field.errors["minlength"]) {
        if (fieldName === "name") {
          return "El nombre debe tener al menos 2 caracteres"
        }
        if (fieldName === "password") {
          return "La contraseña debe tener al menos 6 caracteres"
        }
      }
      if (field.errors["passwordMismatch"]) {
        return "Las contraseñas no coinciden"
      }
    }
    return ""
  }
}
