import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink } from "@angular/router"
import  { ClienteService } from "../../../services/cliente.service"
import  { Cliente } from "../../../models/cliente.model"
import { FormsModule } from "@angular/forms"
import { isPlatformBrowser } from '@angular/common';
import {  Inject, PLATFORM_ID } from '@angular/core';
@Component({
  selector: "app-cliente-list",
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: "./cliente-list.component.html",
  styleUrl: "./cliente-list.component.css",
})

export class ClienteListComponent implements OnInit {
  clientes: Cliente[] = []
  filteredClientes: Cliente[] = []
  searchTerm = ""
  loading = true
  error: string | null = null
  currentUser: any = null;
  
  constructor(private clienteService: ClienteService,
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
    this.loadClientes()
  }

  loadClientes(): void {
    this.loading = true
    this.error = null

    this.clienteService.getClientes().subscribe({
      next: (data) => {
        this.clientes = data
        this.filteredClientes = data
        this.loading = false
      },
      error: (err) => {
        console.error("Error al cargar clientes:", err)
        this.error = err.message || "Error al cargar los clientes"
        this.loading = false
      },
    })
  }

  search(): void {
    if (!this.searchTerm.trim()) {
      this.filteredClientes = this.clientes
      return
    }

    const term = this.searchTerm.toLowerCase().trim()
    this.filteredClientes = this.clientes.filter(
      (cliente) =>
        cliente.nombre.toLowerCase().includes(term) ||
        cliente.correo.toLowerCase().includes(term) ||
        cliente.telefono.toLowerCase().includes(term),
    )
  }

  deleteCliente(id: number, event: Event): void {
    event.preventDefault()
    event.stopPropagation()

    if (confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      this.clienteService.deleteCliente(id).subscribe({
        next: () => {
          this.clientes = this.clientes.filter((c) => c.id !== id)
          this.filteredClientes = this.filteredClientes.filter((c) => c.id !== id)
        },
        error: (err) => {
          console.error("Error al eliminar cliente:", err)
          alert("Error al eliminar el cliente: " + err.message)
        },
      })
    }
  }

  getInitials(name: string): string {
    return name.charAt(0).toUpperCase()
  }

  refreshList(): void {
    this.loadClientes()
  }
}
