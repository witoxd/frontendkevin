import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import {  ActivatedRoute,  Router, RouterLink } from "@angular/router"
import  { ClienteService } from "../../../services/cliente.service"
import  { Cliente } from "../../../models/cliente.model"
import { RouterModule } from "@angular/router"
import { isPlatformBrowser } from '@angular/common';
import {  Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: "app-cliente-detail",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./cliente-detail.component.html",
  styleUrls: ["./cliente-detail.component.css"],
})
export class ClienteDetailComponent implements OnInit {
  cliente: Cliente | null = null
  loading = true
  error: string | null = null
 currentUser: any = null
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clienteService: ClienteService,
    @Inject(PLATFORM_ID) private platformId: Object,
     
  ) {
    // Acceso seguro a localStorage
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem("currentUser");
      if (userData) {
        this.currentUser = JSON.parse(userData);
      }
    }
  }

 ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id")
    if (id) {
      this.loadCliente(+id)
    } else {
      this.error = "ID de cliente no válido"
      this.loading = false
    }
  }

  loadCliente(id: number): void {
    this.loading = true
    this.error = null

    this.clienteService.getClienteById(id).subscribe({
      next: (cliente) => {
        this.cliente = cliente
        this.loading = false
      },
      error: (err) => {
        console.error("Error al cargar cliente:", err)
        this.error = err.message || "Error al cargar el cliente"
        this.loading = false
      },
    })
  }

  deleteCliente(): void {
    if (!this.cliente) return

    const confirmMessage = `¿Estás seguro de que deseas eliminar a ${this.cliente.nombre}?`
    if (confirm(confirmMessage)) {
      this.clienteService.deleteCliente(this.cliente.id).subscribe({
        next: () => {
          alert("Cliente eliminado correctamente")
          this.router.navigate(["/clientes"])
        },
        error: (err) => {
          console.error("Error al eliminar cliente:", err)
          alert("Error al eliminar el cliente: " + err.message)
        },
      })
    }
  }

  getInitials(name: string): string {
    if (!name) return "?"
    return name.charAt(0).toUpperCase()
  }

  goBack(): void {
    this.router.navigate(["/clientes"])
  }
}
