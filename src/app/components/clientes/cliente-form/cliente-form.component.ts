import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule,  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import {  Router,  ActivatedRoute, RouterLink } from "@angular/router"
import  { ClienteService } from "../../../services/cliente.service"
import  { CreateClienteRequest, UpdateClienteRequest } from "../../../models/cliente.model"
import { isPlatformBrowser } from '@angular/common';
import {  Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: "app-cliente-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./cliente-form.component.html",
  styleUrl: "./cliente-form.component.css",
})

export class ClienteFormComponent implements OnInit {
  clienteForm: FormGroup
  isEditMode = false
  clienteId: number | null = null
  loading = false
  submitted = false
  errorMessage: string | null = null
  successMessage: string | null = null
  currentUser: any = null;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private route: ActivatedRoute,
    private router: Router,
     @Inject(PLATFORM_ID) private platformId: Object
  ) {
    
          if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        this.currentUser = JSON.parse(userData);
      }
    }
    this.clienteForm = this.fb.group({
      nombre: ["", [Validators.required, Validators.minLength(2)]],
      documento: ["", [Validators.pattern(/^[0-9]{7,12}$/)]],
      correo: ["", [Validators.required, Validators.email]],
      telefono: ["", [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]],
      direccion: ["", [Validators.required, Validators.minLength(5)]],
    })
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id")
    if (id) {
      this.isEditMode = true
      this.clienteId = +id
      this.loadClienteData(this.clienteId)
    }
  }

  loadClienteData(id: number): void {
    this.loading = true
    this.clienteService.getClienteById(id).subscribe({
      next: (cliente) => {
        this.clienteForm.patchValue({
          nombre: cliente.nombre,
          documento: cliente.documento || "",
          correo: cliente.correo,
          telefono: cliente.telefono,
          direccion: cliente.direccion,
        })
        this.loading = false
      },
      error: (error) => {
        this.errorMessage = `Error al cargar los datos del cliente: ${error.message}`
        this.loading = false
      },
    })
  }

  onSubmit(): void {
    this.submitted = true

    if (this.clienteForm.invalid) {
      return
    }

    this.loading = true
    this.errorMessage = null
    this.successMessage = null

    const clienteData = this.clienteForm.value

    if (this.isEditMode && this.clienteId) {
      console.log("Actualizando cliente con ID:", this.clienteId, clienteData)
      this.clienteService.updateCliente(this.clienteId, clienteData).subscribe({
        next: () => {
          this.successMessage = "Cliente actualizado correctamente"
          this.loading = false
          setTimeout(() => {
            this.router.navigate(["/clientes", this.clienteId])
          }, 1500)
        },
        error: (error) => {
          this.errorMessage = `Error al actualizar el cliente: ${error.message}`
          this.loading = false
        },
      })
    } else {
      this.clienteService.createCliente(clienteData).subscribe({
     

        next: (newCliente) => {
        
          this.successMessage = "Cliente creado correctamente"
          this.loading = false
          setTimeout(() => {
            this.router.navigate(["/clientes", newCliente.id])
          }, 1500)
        },
        error: (error) => {
          this.errorMessage = `Error al crear el cliente: ${error.message}`
          this.loading = false
        },
      })
    }
  }

  get f() {
    return this.clienteForm.controls
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.clienteForm.get(controlName)
    return !!(control && control.hasError(errorName) && (control.dirty || control.touched || this.submitted))
  }

  cancel(): void {
    if (this.isEditMode && this.clienteId) {
      this.router.navigate(["/clientes", this.clienteId])
    } else {
      this.router.navigate(["/clientes"])
    }
  }
}
