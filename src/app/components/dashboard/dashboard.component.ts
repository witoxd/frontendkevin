import { Component, Inject, PLATFORM_ID,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import  { Router } from "@angular/router"
import { isPlatformBrowser } from "@angular/common"
import { RouterModule } from "@angular/router"
import  { EmpenoService } from "../../services/empeno.service"
import  { ClienteService } from "../../services/cliente.service"

interface DashboardStats {
  totalClientes: number
  empenosActivos: number
  empenosVencidos: number
  montoTotal: number
}

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
  currentUser: any = null
  stats: DashboardStats | null = null
  loading = false;

  constructor(
    private router: Router,
    private empenoService: EmpenoService,
    private clienteService: ClienteService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        this.currentUser = JSON.parse(userData);
      }
    }
  }

  ngOnInit(): void {
    this.loadDashboardStats()
  }

  loadDashboardStats(): void {
    if (!this.currentUser) return

    this.loading = true

    // // Cargar estadísticas básicas
    // Promise.all([
    //   this.clienteService.getClientes().toPromise(),
    //   this.empenoService.getEmpenos().toPromise(),
    //   this.empenoService.getEmpenosVencidos().toPromise(),
    // ])
    //   .then(([clientes, empenos, empenosVencidos]) => {
    //     const empenosActivos = empenos?.filter((e) => e.estado === "activo") || []
    //     const montoTotal = empenosActivos.reduce((total, empeno) => total + empeno.monto_prestado, 0)

    //     this.stats = {
    //       totalClientes: clientes?.length || 0,
    //       empenosActivos: empenosActivos.length,
    //       empenosVencidos: empenosVencidos?.length || 0,
    //       montoTotal: montoTotal,
    //     }

    //     this.loading = false
    //   })
    //   .catch((error) => {
    //     console.error("Error loading dashboard stats:", error)
    //     this.loading = false
    //   })
  }

  navigateTo(route: string): void {
    this.router.navigate([route])
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(amount)
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem("authToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("currentUser")
    }
    this.router.navigate(["/login"])
  }
}
