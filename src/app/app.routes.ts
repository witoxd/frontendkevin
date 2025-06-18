import type { Routes } from "@angular/router"

export const routes: Routes = [
  { path: "", redirectTo: "/asistentes", pathMatch: "full" },
  {
    path: "asistentes",
    loadComponent: () =>
      import("./components/asistentes/asistente-list/asistente-list.component").then((m) => m.AsistenteListComponent),
  },
  {
    path: "asistentes/nuevo",
    loadComponent: () =>
      import("./components/asistentes/asistente-form/asistente-form.component").then((m) => m.AsistenteFormComponent),
  },
  {
    path: "asistentes/:id",
    loadComponent: () =>
      import("./components/asistentes/asistente-detail/asistente-detail.component").then(
        (m) => m.AsistenteDetailComponent,
      ),
  },
  {
    path: "asistentes/:id/editar",
    loadComponent: () =>
      import("./components/asistentes/asistente-form/asistente-form.component").then((m) => m.AsistenteFormComponent),
  },
  {
    path: "**",
    redirectTo: "/asistentes",
  },
]
