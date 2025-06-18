import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule,  FormBuilder, FormGroup, FormArray, Validators } from "@angular/forms"
import {  ActivatedRoute,  Router, RouterModule } from "@angular/router"
import  { EmpenoService } from "../../../services/empeno.service"
import  { ClienteService } from "../../../services/cliente.service"
import  { Cliente } from "../../../models/cliente.model"
import { isPlatformBrowser } from "@angular/common"
import { Inject, PLATFORM_ID } from "@angular/core"

interface CreateEmpenoWithPrendasRequest {
  cliente_id: number
  monto_prestado: number
  interes_mensual: number
  fecha_vencimiento: string
  estado?: string
  prendas: {
    descripcion: string
    peso_gramos: number
    valor_estimado: number
  }[]
}

@Component({
  selector: "app-empeno-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./empeno-form.component.html",
  styleUrls: ["./empeno-form.component.css"],
})
export class EmpenoFormComponent implements OnInit {
  empenoForm: FormGroup
  isEditMode = false
  empenoId: number | null = null
  clienteIdFromRoute: number | null = null
  

  clientes: Cliente[] = []
  selectedCliente: Cliente | null = null
  currentUser: any = null
  minDate = ""

  loading = false
  error: string | null = null

  estados = [
    { value: "activo", label: "Activo" },
    { value: "recuperado", label: "Recuperado" },
    { value: "perdido", label: "Perdido" },
  ];


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private empenoService: EmpenoService,
    private clienteService: ClienteService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.empenoForm = this.createForm()
    this.setMinDate()

    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem('currentUser')
      if (userData) {
        this.currentUser = JSON.parse(userData)
      }
    }
  }

  ngOnInit(): void {
    this.checkRouteParams()
    this.loadClientes()
  }

  createForm(): FormGroup {
    return this.fb.group({
      cliente_id: ["", [Validators.required]],
      monto_prestado: ["", [Validators.required, Validators.min(1)]],
      interes_mensual: ["", [Validators.required, Validators.min(0), Validators.max(100)]],
      fecha_vencimiento: ["", [Validators.required]],
      estado: ["activo"],
      prendas: this.fb.array([this.createPrendaFormGroup()]),
    })
  }

  createPrendaFormGroup(): FormGroup {
    return this.fb.group({
      descripcion: ["", [Validators.required]],
      peso_gramos: ["", [Validators.required, Validators.min(0.1)]],
      kilates: [""],
      valor_estimado: ["", [Validators.required, Validators.min(1)]],
    })
  }

  get prendasFormArray(): FormArray {
    return this.empenoForm.get("prendas") as FormArray
  }

  setMinDate(): void {
    const today = new Date()
    this.minDate = today.toISOString().split("T")[0]
  }

  checkRouteParams(): void {
    const id = this.route.snapshot.paramMap.get("id")
    const clienteIdParam = this.route.snapshot.paramMap.get("clienteId")

    if (id && id !== "nuevo") {
      this.isEditMode = true
      this.empenoId = +id
      this.loadEmpenoForEdit()
    }

    if (clienteIdParam) {
      this.clienteIdFromRoute = +clienteIdParam
    }
  }

  loadClientes(): void {
    this.clienteService.getClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes

        // Si viene un clienteId en la ruta, seleccionarlo automáticamente
        if (this.clienteIdFromRoute) {
          this.empenoForm.patchValue({ cliente_id: this.clienteIdFromRoute })
          this.onClienteChange()
        }
      },
      error: (err) => {
        console.error("Error al cargar clientes:", err)
        this.error = "Error al cargar la lista de clientes"
      },
    })
  }

  loadEmpenoForEdit(): void {
    if (!this.empenoId) return

    this.loading = true
    this.empenoService.getEmpenoById(this.empenoId).subscribe({
      next: (empeno) => {
        // Cargar datos básicos del empeño
        this.empenoForm.patchValue({
          cliente_id: empeno.cliente_id,
          monto_prestado: empeno.monto_prestado,
          interes_mensual: empeno.interes_mensual,
          fecha_vencimiento: this.formatDateForInput(empeno.fecha_vencimiento),
          estado: empeno.estado,
        })

        // Cargar prendas asociadas (esto requeriría un endpoint específico)
        // Por ahora, mantenemos una prenda vacía para edición
        this.onClienteChange()
        this.loading = false
      },
      error: (err) => {
        console.error("Error al cargar empeño:", err)
        this.error = "Error al cargar los datos del empeño"
        this.loading = false
      },
    })
  }

  onClienteChange(): void {
    const clienteId = this.empenoForm.get("cliente_id")?.value
    if (clienteId) {
      this.selectedCliente = this.clientes.find((c) => c.id === +clienteId) || null
    } else {
      this.selectedCliente = null
    }
  }

  addPrenda(): void {
    this.prendasFormArray.push(this.createPrendaFormGroup())
  }

  removePrenda(index: number): void {
    if (this.prendasFormArray.length > 1) {
      this.prendasFormArray.removeAt(index)
      this.calculateTotals()
    }
  }

  onPrendaValueChange(): void {
    setTimeout(() => {
      this.calculateTotals()
      this.suggestLoanAmount()
    }, 100)
  }

  suggestLoanAmount(): void {
    const totalPrendasValue = this.getTotalPrendasValue()
    if (totalPrendasValue > 0 && !this.empenoForm.get("monto_prestado")?.value) {
      // Sugerir el 70% del valor total de las prendas
      const suggestedAmount = Math.floor(totalPrendasValue * 0.7)
      this.empenoForm.patchValue({ monto_prestado: suggestedAmount })
      this.calculateTotals()
    }
  }

  calculateTotals(): void {
    // Los cálculos se realizan en los getters para mantener la reactividad
  }

  getTotalPrendasValue(): number {
    return this.prendasFormArray.controls.reduce((total, prenda) => {
      const valor = prenda.get("valor_estimado")?.value || 0
      return total + +valor
    }, 0)
  }

  getInteresAmount(): number {
    const monto = this.empenoForm.get("monto_prestado")?.value || 0
    const interes = this.empenoForm.get("interes_mensual")?.value || 0
    return (monto * interes) / 100
  }

  getTotalAmount(): number {
    const monto = this.empenoForm.get("monto_prestado")?.value || 0
    return monto + this.getInteresAmount()
  }

  onSubmit(): void {
    if (this.empenoForm.valid) {
      this.loading = true
      this.error = null

      const formData = this.prepareFormData()

      if (this.isEditMode && this.empenoId) {
        this.updateEmpeno(formData)
      } else {
        this.createEmpeno(formData)
      }
    } else {
      this.markFormGroupTouched()
      this.error = "Por favor, completa todos los campos requeridos"
    }
  }

  prepareFormData(): CreateEmpenoWithPrendasRequest {
    const formValue = this.empenoForm.value

    return {
      cliente_id: +formValue.cliente_id,
      monto_prestado: +formValue.monto_prestado,
      interes_mensual: +formValue.interes_mensual,
      fecha_vencimiento: formValue.fecha_vencimiento,
      estado: formValue.estado || "activo",
      prendas: formValue.prendas.map((prenda: any) => ({
        descripcion: prenda.descripcion,
        peso_gramos: +prenda.peso_gramos,
        kilates: prenda.kilates ? +prenda.kilates : undefined,
        valor_estimado: +prenda.valor_estimado,
      })),
    }
  }

  createEmpeno(data: CreateEmpenoWithPrendasRequest): void {
    // Usar el endpoint específico para crear empeño con prendas
    this.empenoService.createEmpeno(data).subscribe({
      next: (empeno) => {
        this.loading = false
        alert("Empeño creado exitosamente")
        this.router.navigate(["/empenos", empeno.id])
      },
      error: (err) => {
        console.error("Error al crear empeño:", err)
        this.error = err.message || "Error al crear el empeño"
        this.loading = false
      },
    })
  }

  updateEmpeno(data: CreateEmpenoWithPrendasRequest): void {
    if (!this.empenoId) return

    // Para actualización, usar el endpoint de actualización
    const updateData = {
      cliente_id: data.cliente_id,
      monto_prestado: data.monto_prestado,
      interes_mensual: data.interes_mensual,
      fecha_vencimiento: new Date(data.fecha_vencimiento),
      estado: data.estado as "activo" | "recuperado" | "perdido",
    }

    this.empenoService.updateEmpeno(this.empenoId, updateData).subscribe({
      next: (empeno) => {
        this.loading = false
        alert("Empeño actualizado exitosamente")
        this.router.navigate(["/empenos", empeno.id])
      },
      error: (err) => {
        console.error("Error al actualizar empeño:", err)
        this.error = err.message || "Error al actualizar el empeño"
        this.loading = false
      },
    })
  }

  markFormGroupTouched(): void {
    Object.keys(this.empenoForm.controls).forEach((key) => {
      const control = this.empenoForm.get(key)
      control?.markAsTouched()

      if (control instanceof FormArray) {
        control.controls.forEach((group) => {
          if (group instanceof FormGroup) {
            Object.keys(group.controls).forEach((subKey) => {
              group.get(subKey)?.markAsTouched()
            })
          }
        })
      }
    })
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.empenoForm.get(fieldName)
    return !!(field && field.invalid && (field.dirty || field.touched))
  }

  isPrendaFieldInvalid(index: number, fieldName: string): boolean {
    const prendaGroup = this.prendasFormArray.at(index) as FormGroup
    const field = prendaGroup.get(fieldName)
    return !!(field && field.invalid && (field.dirty || field.touched))
  }

  formatDateForInput(date: Date): string {
    const d = new Date(date)
    return d.toISOString().split("T")[0]
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(amount)
  }

  goBack(): void {
    this.router.navigate(["/empenos"])
  }
}
