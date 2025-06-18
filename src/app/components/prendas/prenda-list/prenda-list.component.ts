import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule,  Router } from "@angular/router"
import { FormsModule } from "@angular/forms"
import  { PrendaService } from "../../../services/prenda.service"
import  { EmpenoService } from "../../../services/empeno.service"
import  { ClienteService } from "../../../services/cliente.service"
import  { Prenda } from "../../../models/prenda.model"
import  { Empeno } from "../../../models/empeno.model"
import  { Cliente } from "../../../models/cliente.model"
import { isPlatformBrowser } from "@angular/common"
import { Inject, PLATFORM_ID } from "@angular/core"

interface PrendaWithDetails extends Prenda {
  empeno?: Empeno
  cliente?: Cliente
}

@Component({
  selector: "app-prenda-list",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./prenda-list.component.html",
  styleUrls: ["./prenda-list.component.css"],
})
export class PrendaListComponent implements OnInit {
  prendas: PrendaWithDetails[] = []
  filteredPrendas: PrendaWithDetails[] = []
  loading = true
  error: string | null = null
  searchTerm = ""
  selectedEstado = ""
  currentUser: any = null

  estados = [
    { value: "", label: "Todos los estados" },
    { value: "disponible", label: "Disponible" },
    { value: "empenada", label: "Empeñada" },
    { value: "vendida", label: "Vendida" },
    { value: "perdida", label: "Perdida" },
  ];

  constructor(
    private prendaService: PrendaService,
    private empenoService: EmpenoService,
    private clienteService: ClienteService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem("currentUser")
      if (userData) {
        this.currentUser = JSON.parse(userData)
      }
    }
  }

  ngOnInit(): void {
    this.loadPrendas()
  }

  loadPrendas(): void {
    this.loading = true
    this.error = null

    this.prendaService.getPrendas().subscribe({
      next: (prendas) => {
        this.prendas = prendas
        this.loadRelatedData()
      },
      error: (err) => {
        console.error("Error al cargar prendas:", err)
        this.error = err.message || "Error al cargar las prendas"
        this.loading = false
      },
    })
  }

  loadRelatedData(): void {
    const promises = this.prendas.map(async (prenda) => {
      try {
        // Cargar empeño si existe
        if (prenda.empeno_id) {
          const empeno = await this.empenoService.getEmpenoById(prenda.empeno_id).toPromise()
          prenda.empeno = empeno

          // Cargar cliente si existe el empeño
          if (empeno?.cliente_id) {
            const cliente = await this.clienteService.getClienteById(empeno.cliente_id).toPromise()
            prenda.cliente = cliente
          }
        }
      } catch (error) {
        console.error(`Error al cargar datos relacionados para prenda ${prenda.id}:`, error)
      }
    })

    Promise.all(promises).then(() => {
      this.filteredPrendas = this.prendas
      this.loading = false
    })
  }

  filterPrendas(): void {
    this.filteredPrendas = this.prendas.filter((prenda) => {
      const matchesSearch =
        this.searchTerm === "" ||
        prenda.id.toString().includes(this.searchTerm) ||
        prenda.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        prenda.cliente?.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        prenda.cliente?.documento.includes(this.searchTerm) ||
        (prenda.empeno_id && prenda.empeno_id.toString().includes(this.searchTerm))

      const matchesEstado = this.selectedEstado === "" || prenda.estado === this.selectedEstado

      return matchesSearch && matchesEstado
    })
  }

  onSearchChange(): void {
    this.filterPrendas()
  }

  onEstadoChange(): void {
    this.filterPrendas()
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case "disponible":
        return "estado-disponible"
      case "empenada":
        return "estado-empenada"
      case "vendida":
        return "estado-vendida"
      case "perdida":
        return "estado-perdida"
      default:
        return ""
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case "disponible":
        return "Disponible"
      case "empenada":
        return "Empeñada"
      case "vendida":
        return "Vendida"
      case "perdida":
        return "Perdida"
      default:
        return estado
    }
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

  formatWeight(weight?: number): string {
    return weight ? `${weight}g` : "N/A"
  }

  formatKilates(kilates?: number): string {
    return kilates ? `${kilates}k` : "N/A"
  }

  goToDashboard(): void {
    this.router.navigate(["/dashboard"])
  }

  goToCreate(): void {
    this.router.navigate(["/prendas/nueva"])
  }

  goToDetail(id: number): void {
    this.router.navigate(["/prendas", id])
  }

  goToEdit(id: number): void {
    this.router.navigate(["/prendas", id, "editar"])
  }

  goToEmpeno(empenoId: number): void {
    this.router.navigate(["/empenos", empenoId])
  }

  goToCliente(clienteId: number): void {
    this.router.navigate(["/clientes", clienteId])
  }

  markAsPerdida(prendaId: number): void {
    const prenda = this.prendas.find((p) => p.id === prendaId)
    if (!prenda) return

    const confirmMessage = `¿Estás seguro de que deseas marcar la prenda "${prenda.descripcion}" como perdida?`
    if (confirm(confirmMessage)) {
      const updateData = { estado: "perdida" as const }

      this.prendaService.updatePrenda(prendaId, updateData).subscribe({
        next: () => {
          // Actualizar la prenda en la lista local
          const index = this.prendas.findIndex((p) => p.id === prendaId)
          if (index !== -1) {
            this.prendas[index].estado = "perdida"
          }
          this.filterPrendas()
          alert("Prenda marcada como perdida correctamente")
        },
        error: (err) => {
          console.error("Error al marcar prenda como perdida:", err)
          alert("Error al marcar la prenda como perdida: " + err.message)
        },
      })
    }
  }

  deletePrenda(prendaId: number): void {
    const prenda = this.prendas.find((p) => p.id === prendaId)
    if (!prenda) return

    const confirmMessage = `¿Estás seguro de que deseas eliminar la prenda "${prenda.descripcion}"?`
    if (confirm(confirmMessage)) {
      this.prendaService.deletePrenda(prendaId).subscribe({
        next: () => {
          this.prendas = this.prendas.filter((p) => p.id !== prendaId)
          this.filteredPrendas = this.filteredPrendas.filter((p) => p.id !== prendaId)
          alert("Prenda eliminada correctamente")
        },
        error: (err) => {
          console.error("Error al eliminar prenda:", err)
          alert("Error al eliminar la prenda: " + err.message)
        },
      })
    }
  }

  get totalPrendas(): number {
    return this.prendas.length
  }

  get prendasDisponibles(): number {
    return this.prendas.filter((p) => p.estado === "disponible").length
  }

  get prendasEmpenadas(): number {
    return this.prendas.filter((p) => p.estado === "empenada").length
  }

  get prendasVendidas(): number {
    return this.prendas.filter((p) => p.estado === "vendida").length
  }

  get prendasPerdidas(): number {
    return this.prendas.filter((p) => p.estado === "perdida").length
  }

  get valorTotalPrendas(): number {
    return this.prendas.reduce((total, prenda) => total + (prenda.valor_estimado || 0), 0)
  }

  get valorPrendasDisponibles(): number {
    return this.prendas
      .filter((p) => p.estado === "disponible")
      .reduce((total, prenda) => total + (prenda.valor_estimado || 0), 0)
  }

  get hasPrendas(): boolean {
    return !this.loading && !this.error && (this.prendas?.length ?? 0) > 0
  }
}
