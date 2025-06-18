import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule,  Router } from "@angular/router"
import { FormsModule } from "@angular/forms"
import  { AbonoService } from "../../../services/abono.service"
import  { EmpenoService } from "../../../services/empeno.service"
import  { ClienteService } from "../../../services/cliente.service"
import  { Abono } from "../../../models/abono.model"
import  { Empeno } from "../../../models/empeno.model"
import  { Cliente } from "../../../models/cliente.model"
import { isPlatformBrowser } from "@angular/common"
import { Inject, PLATFORM_ID } from "@angular/core"

interface AbonoWithDetails extends Abono {
  empeno?: Empeno
  cliente?: Cliente
}

@Component({
  selector: "app-abono-list",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./abono-list.component.html",
  styleUrls: ["./abono-list.component.css"],
})


export class AbonoListComponent implements OnInit {
  abonos: AbonoWithDetails[] = []
  filteredAbonos: AbonoWithDetails[] = []
  loading = true
  error: string | null = null
  searchTerm = ""
  currentUser: any = null;

  constructor(
    private abonoService: AbonoService,
    private empenoService: EmpenoService,
    private clienteService: ClienteService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem("currentUser")
      if (userData) {
        this.currentUser = JSON.parse(userData)
      }
    }
  }

 ngOnInit(): void {
    this.loadAbonos()
  }

  loadAbonos(): void {
    this.loading = true
    this.error = null

    this.abonoService.getAbonos().subscribe({
      next: (abonos) => {
        this.abonos = abonos
        this.loadRelatedData()
      },
      error: (err) => {
        console.error("Error al cargar abonos:", err)
        this.error = err.message || "Error al cargar los abonos"
        this.loading = false
      },
    })
  }

  loadRelatedData(): void {
    const promises = this.abonos.map(async (abono) => {
      try {
        // Cargar empeño
        const empeno = await this.empenoService.getEmpenoById(abono.empeno_id).toPromise()
        abono.empeno = empeno

        // Cargar cliente
        if (empeno?.cliente_id) {
          const cliente = await this.clienteService.getClienteById(empeno.cliente_id).toPromise()
          abono.cliente = cliente
        }
      } catch (error) {
        console.error(`Error al cargar datos relacionados para abono ${abono.id}:`, error)
      }
    })

    Promise.all(promises).then(() => {
      this.filteredAbonos = this.abonos
      this.loading = false
    })
  }

  filterAbonos(): void {
    this.filteredAbonos = this.abonos.filter((abono) => {
      const matchesSearch =
        this.searchTerm === "" ||
        abono.id.toString().includes(this.searchTerm) ||
        abono.empeno_id.toString().includes(this.searchTerm) ||
        abono.cliente?.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        abono.cliente?.documento.includes(this.searchTerm)

      return matchesSearch
    })
  }

  onSearchChange(): void {
    this.filterAbonos()
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

  getTipoAbonoLabel(tipo: string): string {
    switch (tipo) {
      case "capital":
        return "Capital"
      case "interes":
        return "Interés"
      default:
        return tipo
    }
  }

  getTipoAbonoClass(tipo: string): string {
    switch (tipo) {
      case "capital":
        return "tipo-capital"
      case "interes":
        return "tipo-interes"
      default:
        return ""
    }
  }

  goToDashboard(): void {
    this.router.navigate(["/dashboard"])
  }

  goToCreate(): void {
    this.router.navigate(["/abonos/nuevo"])
  }

  goToEmpeno(empenoId: number): void {
    this.router.navigate(["/empenos", empenoId])
  }

  goToCliente(clienteId: number): void {
    this.router.navigate(["/clientes", clienteId])
  }

  get totalAbonos(): number {
    return this.abonos.reduce((total, abono) => total + abono.monto, 0)
  }

  get abonosHoy(): number {
    const hoy = new Date().toDateString()
    return this.abonos.filter((abono) => new Date(abono.fecha_abono).toDateString() === hoy).length
  }

  get abonosCapital(): number {
    return this.abonos.filter((abono) => abono.tipo_abono === "capital").length
  }

  get abonosInteres(): number {
    return this.abonos.filter((abono) => abono.tipo_abono === "interes").length
  }

  get hasAbonos(): boolean {
    return !this.loading && !this.error && (this.abonos?.length ?? 0) > 0
  }
}
