import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule,  Router } from "@angular/router"
import { FormsModule } from "@angular/forms"
import  { AsistenteService } from "../../../services/asistente.service"
import  { Asistente } from "../../../models/asistente.model"

@Component({
  selector: "app-asistente-list",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./asistente-list.component.html",
  styleUrls: ["./asistente-list.component.css"],
})
export class AsistenteListComponent implements OnInit {
  asistentes: Asistente[] = []
  filteredAsistentes: Asistente[] = []
  searchTerm = ""
  loading = true
  error: string | null = null

  constructor(
    private asistenteService: AsistenteService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadAsistentes()
  }

  loadAsistentes(): void {
    this.loading = true
    this.error = null

    this.asistenteService.getAsistentes().subscribe({
      next: (data) => {
        this.asistentes = data
        this.filteredAsistentes = data
        this.loading = false
      },
      error: (err) => {
        console.error("Error al cargar asistentes:", err)
        this.error = err.message || "Error al cargar los asistentes"
        this.loading = false
      },
    })
  }

  search(): void {
    if (!this.searchTerm.trim()) {
      this.filteredAsistentes = this.asistentes
      return
    }

    const term = this.searchTerm.toLowerCase().trim()
    this.filteredAsistentes = this.asistentes.filter(
      (asistente) =>
        asistente.nombre.toLowerCase().includes(term) ||
        asistente.telefono.toLowerCase().includes(term) ||
        asistente.edad.toString().includes(term) ||
        asistente.invitado_id.toString().includes(term),
    )
  }

  deleteAsistente(id: number, event: Event): void {
    event.preventDefault()
    event.stopPropagation()

    if (confirm("¿Estás seguro de que deseas eliminar este asistente?")) {
      this.asistenteService.deleteAsistente(id).subscribe({
        next: () => {
          this.asistentes = this.asistentes.filter((a) => a.id !== id)
          this.filteredAsistentes = this.filteredAsistentes.filter((a) => a.id !== id)
        },
        error: (err) => {
          console.error("Error al eliminar asistente:", err)
          alert("Error al eliminar el asistente: " + err.message)
        },
      })
    }
  }

  getInitials(name: string): string {
    return name.charAt(0).toUpperCase()
  }

  refreshList(): void {
    this.loadAsistentes()
  }

  onSearchChange(): void {
    this.search()
  }
}
