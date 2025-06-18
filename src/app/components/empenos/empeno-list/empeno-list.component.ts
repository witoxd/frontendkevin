import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule,  Router } from "@angular/router"
import { FormsModule } from "@angular/forms"
import  { EmpenoService } from "../../../services/empeno.service"
import  { Empeno } from "../../../models/empeno.model"
import { isPlatformBrowser } from "@angular/common"
import {  Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: "app-empeno-list",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./empeno-list.component.html",
  styleUrls: ["./empeno-list.component.css"],
})
export class EmpenoListComponent implements OnInit {
  empenos: Empeno[] = []
  currentUser: any = null
  filteredEmpenos: Empeno[] = []
  loading = true
  error: string | null = null
  searchTerm = ""
  selectedEstado = ""

   estados = [
    { value: "", label: "Todos los estados" },
    { value: "activo", label: "Activo" },
    { value: "recuperado", label: "Recuperado" },
    { value: "perdido", label: "Perdido" },
  ]


  constructor(
    private empenoService: EmpenoService,
    private router: Router,
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
    this.loadEmpenos()
  }

  loadEmpenos(): void {
    this.loading = true
    this.error = null

    this.empenoService.getEmpenos().subscribe({
      next: (empenos) => {
        this.empenos = empenos
        this.filteredEmpenos = empenos
        this.loading = false
      },
      error: (err) => {
        console.error("Error al cargar empeños:", err)
        this.error = err.message || "Error al cargar los empeños"
        this.loading = false
      },
    })
  }

  filterEmpenos(): void {
    this.filteredEmpenos = this.empenos.filter((empeno) => {
      const matchesSearch =
        this.searchTerm === "" ||
        empeno.id.toString().includes(this.searchTerm) ||
        empeno.cliente_id.toString().includes(this.searchTerm)

      const matchesEstado = this.selectedEstado === "" || empeno.estado === this.selectedEstado

      return matchesSearch && matchesEstado
    })
  }

  onSearchChange(): void {
    this.filterEmpenos()
  }

  onEstadoChange(): void {
    this.filterEmpenos()
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

  isVencido(fechaVencimiento: Date): boolean {
    return new Date(fechaVencimiento) < new Date()
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

  goToDashboard(): void {
    this.router.navigate(["/dashboard"])
  }

  goToDetail(id: number): void {
    this.router.navigate(["/empenos", id])
  }

  goToCreate(): void {
    this.router.navigate(["/empenos/nuevo"])
  }

  goToEdit(id: number): void {
    this.router.navigate(["/empenos", id, "editar"])
  }

  goToAbono(empenoId: number): void {
    this.router.navigate(["/abonos/nuevo", empenoId])
  }

  exportClienteInfo(empenoId: number): void {
    this.empenoService.exportClienteInfo(empenoId).subscribe({
      next: (data) => {
        // Crear y descargar archivo
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `cliente-empeno-${empenoId}.json`
        link.click()
        window.URL.revokeObjectURL(url)
      },
      error: (err) => {
        console.error("Error al exportar información del cliente:", err)
        alert("Error al exportar la información del cliente")
      },
    })
  }

  get empenosActivos() {
    return this.empenos?.filter((e) => e.estado === "activo")?.length || 0
  }

  get empenosRecuperados() {
    return this.empenos?.filter((e) => e.estado === "recuperado")?.length || 0
  }

  get empenosPerdidos() {
    return this.empenos?.filter((e) => e.estado === "perdido")?.length || 0
  }

  get hasEmpenos(): boolean {
    return !this.loading && !this.error && (this.empenos?.length ?? 0) > 0
  }
}
