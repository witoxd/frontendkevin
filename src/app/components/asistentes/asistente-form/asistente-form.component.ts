import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule,  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import  { Router, ActivatedRoute } from "@angular/router"
import  { AsistenteService } from "../../../services/asistente.service"

@Component({
  selector: "app-asistente-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./asistente-form.component.html",
  styleUrls: ["./asistente-form.component.css"],
})
export class AsistenteFormComponent implements OnInit {
  asistenteForm: FormGroup
  isEditMode = false
  asistenteId: number | null = null
  loading = false
  submitted = false
  errorMessage: string | null = null
  successMessage: string | null = null

  constructor(
    private fb: FormBuilder,
    private asistenteService: AsistenteService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.asistenteForm = this.fb.group({
      nombre: ["", [Validators.required, Validators.minLength(2)]],
      telefono: ["", [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]],
      edad: ["", [Validators.required, Validators.min(1), Validators.max(120)]],
      invitado_id: ["", [Validators.required, Validators.min(1)]],
    })
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id")
    if (id) {
      this.isEditMode = true
      this.asistenteId = +id
      this.loadAsistenteData(this.asistenteId)
    }
  }

  loadAsistenteData(id: number): void {
    this.loading = true
    this.asistenteService.getAsistenteById(id).subscribe({
      next: (asistente) => {
        this.asistenteForm.patchValue({
          nombre: asistente.nombre,
          telefono: asistente.telefono,
          edad: asistente.edad,
          invitado_id: asistente.invitado_id,
        })
        this.loading = false
      },
      error: (error) => {
        this.errorMessage = `Error al cargar los datos del asistente: ${error.message}`
        this.loading = false
      },
    })
  }

  onSubmit(): void {
    this.submitted = true

    if (this.asistenteForm.invalid) {
      return
    }

    this.loading = true
    this.errorMessage = null
    this.successMessage = null

    const asistenteData = this.asistenteForm.value

    if (this.isEditMode && this.asistenteId) {
      this.asistenteService.updateAsistente(this.asistenteId, asistenteData).subscribe({
        next: () => {
          this.successMessage = "Asistente actualizado correctamente"
          this.loading = false
          setTimeout(() => {
            this.router.navigate(["/asistentes", this.asistenteId])
          }, 1500)
        },
        error: (error) => {
          this.errorMessage = `Error al actualizar el asistente: ${error.message}`
          this.loading = false
        },
      })
    } else {
      this.asistenteService.createAsistente(asistenteData).subscribe({
        next: (newAsistente) => {
          this.successMessage = "Asistente creado correctamente"
          this.loading = false
          setTimeout(() => {
            this.router.navigate(["/asistentes", newAsistente.id])
          }, 1500)
        },
        error: (error) => {
          this.errorMessage = `Error al crear el asistente: ${error.message}`
          this.loading = false
        },
      })
    }
  }

  get f() {
    return this.asistenteForm.controls
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.asistenteForm.get(controlName)
    return !!(control && control.hasError(errorName) && (control.dirty || control.touched || this.submitted))
  }

  cancel(): void {
    if (this.isEditMode && this.asistenteId) {
      this.router.navigate(["/asistentes", this.asistenteId])
    } else {
      this.router.navigate(["/asistentes"])
    }
  }
}
