import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule,  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import {  ActivatedRoute,  Router, RouterModule } from "@angular/router"
import  { AbonoService } from "../../../services/abono.service"
import  { EmpenoService } from "../../../services/empeno.service"
import  { ClienteService } from "../../../services/cliente.service"
import  { CreateAbonoRequest } from "../../../models/abono.model"
import  { Empeno } from "../../../models/empeno.model"
import  { Cliente } from "../../../models/cliente.model"
import { isPlatformBrowser } from "@angular/common"
import { Inject, PLATFORM_ID } from "@angular/core"

@Component({
  selector: "app-abono-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./abono-form.component.html",
  styleUrls: ["./abono-form.component.css"],
})
export class AbonoFormComponent implements OnInit {
  abonoForm: FormGroup
  empenos: Empeno[] = []
  selectedEmpeno: Empeno | null = null
  selectedCliente: Cliente | null = null
  empenoIdFromRoute: number | null = null
  currentUser: any = null
  loading = false
  error: string | null = null
  successMessage: string | null = null;
    tiposAbono = [
    { value: "capital", label: "Capital" },
    { value: "interes", label: "Interés" },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private abonoService: AbonoService,
    private empenoService: EmpenoService,
    private clienteService: ClienteService,
    @Inject(PLATFORM_ID) private platformId: Object,
    
  ) {
    this.abonoForm = this.createForm()

    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem('currentUser')
      if (userData) {
        this.currentUser = JSON.parse(userData)
      }
    }
  }

  
  ngOnInit(): void {
    this.checkRouteParams()
    this.loadEmpenos()
  }

  createForm(): FormGroup {
    return this.fb.group({
      empeno_id: ["", [Validators.required]],
      monto: ["", [Validators.required, Validators.min(1)]],
      tipo_abono: ["capital", [Validators.required]],
      fecha_abono: [""], // Opcional
      observaciones: [""], // Opcional
    })
  }

  checkRouteParams(): void {
    const empenoIdParam = this.route.snapshot.paramMap.get("empenoId")
    if (empenoIdParam) {
      this.empenoIdFromRoute = +empenoIdParam
    }
  }

  loadEmpenos(): void {
    this.empenoService.getEmpenos().subscribe({
      next: (empenos) => {
        // Solo mostrar empeños activos
        this.empenos = empenos.filter((e) => e.estado === "activo")

        // Si viene un empenoId en la ruta, seleccionarlo automáticamente
        if (this.empenoIdFromRoute) {
          this.abonoForm.patchValue({ empeno_id: this.empenoIdFromRoute })
          this.onEmpenoChange()
        }
      },
      error: (err) => {
        console.error("Error al cargar empeños:", err)
        this.error = "Error al cargar la lista de empeños"
      },
    })
  }

  onEmpenoChange(): void {
    const empenoId = this.abonoForm.get("empeno_id")?.value
    if (empenoId) {
      this.selectedEmpeno = this.empenos.find((e) => e.id === +empenoId) || null

      if (this.selectedEmpeno) {
        this.loadCliente(this.selectedEmpeno.cliente_id)
        this.suggestAbonoAmount()
      }
    } else {
      this.selectedEmpeno = null
      this.selectedCliente = null
    }
  }

  loadCliente(clienteId: number): void {
    this.clienteService.getClienteById(clienteId).subscribe({
      next: (cliente) => {
        this.selectedCliente = cliente
      },
      error: (err) => {
        console.error("Error al cargar cliente:", err)
      },
    })
  }

  suggestAbonoAmount(): void {
    if (this.selectedEmpeno && !this.abonoForm.get("monto")?.value) {
      // Sugerir el monto total a pagar (capital + interés)
      const montoTotal = this.calculateTotalAmount()
      this.abonoForm.patchValue({ monto: montoTotal })
    }
  }

  onTipoAbonoChange(): void {
    if (this.selectedEmpeno) {
      const tipoAbono = this.abonoForm.get("tipo_abono")?.value
      let montoSugerido = 0

      if (tipoAbono === "capital") {
        montoSugerido = this.selectedEmpeno.monto_prestado
      } else if (tipoAbono === "interes") {
        montoSugerido = this.calculateInterestAmount()
      }

      this.abonoForm.patchValue({ monto: montoSugerido })
    }
  }

  calculateTotalAmount(): number {
    if (!this.selectedEmpeno) return 0
    return (
      this.selectedEmpeno.monto_prestado +
      (this.selectedEmpeno.monto_prestado * this.selectedEmpeno.interes_mensual) / 100
    )
  }

  calculateInterestAmount(): number {
    if (!this.selectedEmpeno) return 0
    return (this.selectedEmpeno.monto_prestado * this.selectedEmpeno.interes_mensual) / 100
  }

  onSubmit(): void {
    if (this.abonoForm.valid) {
      this.loading = true
      this.error = null
      this.successMessage = null

      const formValue = this.abonoForm.value

      const abonoData: CreateAbonoRequest = {
        empeno_id: +formValue.empeno_id,
        monto: +formValue.monto,
        tipo_abono: formValue.tipo_abono,
        observaciones: formValue.observaciones || undefined,
      }

      // Solo incluir fecha_abono si se proporcionó
      if (formValue.fecha_abono) {
        abonoData.fecha_abono = new Date(formValue.fecha_abono)
      }

      console.log("Datos del abono a enviar:", abonoData)

      this.abonoService.createAbono(abonoData).subscribe({
        next: (abono) => {
          this.loading = false
          this.successMessage = "Abono registrado correctamente"

          // Verificar si el abono cubre el total del empeño
          const montoTotal = this.calculateTotalAmount()
          if (abonoData.monto >= montoTotal) {
            alert("¡Empeño recuperado completamente! El estado del empeño se actualizará a 'recuperado'.")
          }

          setTimeout(() => {
            this.router.navigate(["/abonos"])
          }, 1500)
        },
        error: (err) => {
          this.loading = false
          this.error = err.message || "Error al registrar el abono"
          console.error("Error al crear abono:", err)
        },
      })
    } else {
      this.markFormGroupTouched()
      this.error = "Por favor, completa todos los campos requeridos"
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.abonoForm.controls).forEach((key) => {
      const control = this.abonoForm.get(key)
      control?.markAsTouched()
    })
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.abonoForm.get(fieldName)
    return !!(field && field.invalid && (field.dirty || field.touched))
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(amount)
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString("es-CO")
  }

  isVencido(fecha: Date): boolean {
    return new Date(fecha) < new Date()
  }

  goBack(): void {
    this.router.navigate(["/abonos"])
  }
}
