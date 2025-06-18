import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import {  ActivatedRoute,  Router, RouterModule } from "@angular/router"
import  { AsistenteService } from "../../../services/asistente.service"
import  { Asistente } from "../../../models/asistente.model"

@Component({
  selector: "app-asistente-detail",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./asistente-detail.component.html",
  styleUrls: ["./asistente-detail.component.css"],
})
export class AsistenteDetailComponent implements OnInit {
  asistente: Asistente | null = null
  loading = true
  error: string | null = null

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private asistenteService: AsistenteService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id")
    if (id) {
      this.loadAsistente(+id)
    } else {
      this.error = "ID de asistente no válido"
      this.loading = false
    }
  }

  loadAsistente(id: number): void {
    this.loading = true
    this.error = null

    this.asistenteService.getAsistenteById(id).subscribe({
      next: (asistente) => {
        this.asistente = asistente
        this.loading = false
      },
      error: (err) => {
        console.error("Error al cargar asistente:", err)
        this.error = err.message || "Error al cargar el asistente"
        this.loading = false
      },
    })
  }

  deleteAsistente(): void {
    if (!this.asistente) return

    const confirmMessage = `¿Estás seguro de que deseas eliminar a ${this.asistente.nombre}?`
    if (confirm(confirmMessage)) {
      this.asistenteService.deleteAsistente(this.asistente.id).subscribe({
        next: () => {
          alert("Asistente eliminado correctamente")
          this.router.navigate(["/asistentes"])
        },
        error: (err) => {
          console.error("Error al eliminar asistente:", err)
          alert("Error al eliminar el asistente: " + err.message)
        },
      })
    }
  }

  getInitials(name: string): string {
    if (!name) return "?"
    return name.charAt(0).toUpperCase()
  }

  goBack(): void {
    this.router.navigate(["/asistentes"])
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
}
