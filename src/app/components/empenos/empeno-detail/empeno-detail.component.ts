import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import {  ActivatedRoute,  Router, RouterModule } from "@angular/router"
import  { EmpenoService } from "../../../services/empeno.service"
import  { PrendaService } from "../../../services/prenda.service"
import  { ClienteService } from "../../../services/cliente.service"
import  { Empeno } from "../../../models/empeno.model"
import  { Prenda } from "../../../models/prenda.model"
import  { Cliente } from "../../../models/cliente.model"
import { isPlatformBrowser } from '@angular/common';
import {  Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: "app-empeno-detail",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./empeno-detail.component.html",
  styleUrls: ["./empeno-detail.component.css"],
})
export class EmpenoDetailComponent implements OnInit {
  empeno: Empeno | null = null
  prendas: Prenda[] = [] // Array de prendas
  cliente: Cliente | null = null
  loading = true
  error: string | null = null
  currentUser: any = null
  loadingPrendas = false
  clienteLoaded = false
  prendasError: string | null = null;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private empenoService: EmpenoService,
    private prendaService: PrendaService,
    private clienteService: ClienteService,
     @Inject(PLATFORM_ID) private platformId: Object
  ) {

              if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        this.currentUser = JSON.parse(userData);
      }
    }
  }

 ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id")
    if (id) {
      this.loadEmpenoDetails(+id)
    } else {
      this.error = "ID de empeño no válido"
      this.loading = false
    }
  }

  loadEmpenoDetails(id: number): void {
    this.loading = true
    this.error = null
    console.log("🔄 Cargando empeño con ID:", id)

    this.empenoService.getEmpenoById(id).subscribe({
      next: (empeno) => {
        console.log("✅ Empeño cargado:", empeno)
        this.empeno = empeno
        this.loadRelatedData()
      },
      error: (err) => {
        console.error("❌ Error al cargar empeño:", err)
        this.error = err.message || "Error al cargar el empeño"
        this.loading = false
      },
    })
  }

  loadRelatedData(): void {
    if (!this.empeno) return

    console.log("🔄 Cargando datos relacionados para empeño ID:", this.empeno.id)

    // Cargar prendas del empeño
    this.loadingPrendas = true
    this.prendasError = null

    this.prendaService.getPrendasByEmpeno(this.empeno.id).subscribe({
      next: (prendas) => {
        console.log("✅ Prendas recibidas en componente:", prendas)
        console.log("📊 Número de prendas:", prendas?.length || 0)

        // Asegurar que sea un array válido
        this.prendas = Array.isArray(prendas) ? prendas : []

        console.log("💾 Prendas asignadas al componente:", this.prendas)
        this.loadingPrendas = false
        this.checkLoadingComplete()
      },
      error: (err) => {
        console.error("❌ Error al cargar prendas:", err)
        this.prendasError = err.message || "Error al cargar las prendas"
        this.prendas = [] // Asegurar que sea un array vacío en caso de error
        this.loadingPrendas = false
        this.checkLoadingComplete()
      },
    })

    // Cargar cliente
    this.clienteService.getClienteById(this.empeno.cliente_id).subscribe({
      next: (cliente) => {
        console.log("✅ Cliente cargado:", cliente)
        this.cliente = cliente
        this.clienteLoaded = true
        this.checkLoadingComplete()
      },
      error: (err) => {
        console.error("❌ Error al cargar cliente:", err)
        this.clienteLoaded = true
        this.checkLoadingComplete()
      },
    })
  }

  checkLoadingComplete(): void {
    // Verificar si ambas cargas han terminado
    if (!this.loadingPrendas && this.clienteLoaded) {
      console.log("🎉 Carga completa!")
      console.log("📊 Resumen:")
      console.log("  - Prendas:", this.prendas?.length || 0)
      console.log("  - Cliente:", !!this.cliente)
      console.log("  - Prendas array:", this.prendas)
      this.loading = false
    }
  }

  deleteEmpeno(): void {
    if (!this.empeno) return

    const confirmMessage = `¿Estás seguro de que deseas eliminar el empeño #${this.empeno.id}?`
    if (confirm(confirmMessage)) {
      this.empenoService.deleteEmpeno(this.empeno.id).subscribe({
        next: () => {
          alert("Empeño eliminado correctamente")
          this.router.navigate(["/empenos"])
        },
        error: (err) => {
          console.error("Error al eliminar empeño:", err)
          alert("Error al eliminar el empeño: " + err.message)
        },
      })
    }
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case "activo":
        return "estado-activo"
      case "recuperado":
        return "estado-recuperado"
      case "perdido":
        return "estado-perdido"
      default:
        return ""
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case "activo":
        return "Activo"
      case "recuperado":
        return "Recuperado"
      case "perdido":
        return "Perdido"
      default:
        return estado
    }
  }

  isVencido(): boolean {
    if (!this.empeno) return false
    return new Date(this.empeno.fecha_vencimiento) < new Date()
  }

  getDaysUntilExpiry(fecha: string | Date): number {
    const hoy = new Date()
    const fechaVencimiento = new Date(fecha)
    const diferencia = fechaVencimiento.getTime() - hoy.getTime()
    return Math.floor(diferencia / (1000 * 60 * 60 * 24))
  }

  calculateTotalAmount(): number {
    if (!this.empeno) return 0
    return this.empeno.monto_prestado + (this.empeno.monto_prestado * this.empeno.interes_mensual) / 100
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(amount)
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  goBack(): void {
    this.router.navigate(["/empenos"])
  }

  goToEdit(): void {
    if (this.empeno) {
      this.router.navigate(["/empenos", this.empeno.id, "editar"])
    }
  }

  goToCliente(): void {
    if (this.empeno) {
      this.router.navigate(["/clientes", this.empeno.cliente_id])
    }
  }

  public abs(value: number): number {
    return Math.abs(value)
  }

  getTotalPrendasValue(): number {
    if (!this.prendas || this.prendas.length === 0) return 0
    return this.prendas.reduce((total, prenda) => {
      const valor = prenda.valor_estimado || 0
      console.log(`💰 Prenda ${prenda.id}: ${valor}`)
      return total + valor
    }, 0)
  }

  getPrendasCount(): number {
    const count = this.prendas ? this.prendas.length : 0
    console.log("📊 Conteo de prendas:", count)
    return count
  }

  getTotalPeso(): number {
    if (!this.prendas || this.prendas.length === 0) return 0
    return this.prendas.reduce((total, prenda) => {
      const peso = prenda.peso || 0
      console.log(`⚖️ Prenda ${prenda.id}: ${peso}g`)
      return total + peso
    }, 0)
  }
}
