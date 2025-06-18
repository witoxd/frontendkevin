import  { Routes } from "@angular/router"
import { AuthService } from "./services/auth.service"

export const routes: Routes = [
  { path: "", redirectTo: "/login", pathMatch: "full" },
  {
    path: "register",
    loadComponent: () => import("./components/register/register.component").then(m => m.RegisterComponent),
      providers: [AuthService]
  },
  {
    path: "login",
    loadComponent: () => import("./components/login/login.component").then(m => m.LoginComponent),
      providers: [AuthService]
  },
  {
    path: "dashboard",
    loadComponent: () => import("./components/dashboard/dashboard.component").then((m) => m.DashboardComponent),
      providers: [AuthService]
  }
  ,
  {
    path: "clientes",
    loadComponent: () =>
      import("./components/clientes/cliente-list/cliente-list.component").then((m) => m.ClienteListComponent),
  },
  {
    path: "clientes/nuevo",
    loadComponent: () =>
      import("./components/clientes/cliente-form/cliente-form.component").then((m) => m.ClienteFormComponent),
  },
  {
    path: "clientes/:id",
    loadComponent: () =>
      import("./components/clientes/cliente-detail/cliente-detail.component").then((m) => m.ClienteDetailComponent),
  },
  {
    path: "clientes/:id/editar",
    loadComponent: () =>
      import("./components/clientes/cliente-form/cliente-form.component").then((m) => m.ClienteFormComponent),
  },
  {
    path: "empenos",
    loadComponent: () =>
      import("./components/empenos/empeno-list/empeno-list.component").then((m) => m.EmpenoListComponent),
  },
  {
    path: "empenos/nuevo",
    loadComponent: () =>
      import("./components/empenos/empeno-form/empeno-form.component").then((m) => m.EmpenoFormComponent),
  },
  {
    path: "empenos/nuevo/:clienteId",
    loadComponent: () =>
      import("./components/empenos/empeno-form/empeno-form.component").then((m) => m.EmpenoFormComponent),
  },
  {
    path: "empenos/:id",
    loadComponent: () =>
      import("./components/empenos/empeno-detail/empeno-detail.component").then((m) => m.EmpenoDetailComponent),
  },
  {
    path: "empenos/:id/editar",
    loadComponent: () =>
      import("./components/empenos/empeno-form/empeno-form.component").then((m) => m.EmpenoFormComponent),
  },
   {
    path: "abonos",
    loadComponent: () =>
      import("./components/abono/abono-list/abono-list.component").then((m) => m.AbonoListComponent),
  },
  {
    path: "abonos/nuevo",
    loadComponent: () =>
      import("./components/abono/abono-form/abono-form.component").then((m) => m.AbonoFormComponent),
  },
  {
    path: "abonos/nuevo/:empenoId",
    loadComponent: () =>
      import("./components/abono/abono-form/abono-form.component").then((m) => m.AbonoFormComponent),
  },
  {
    path: "prendas",
    loadComponent: () =>
      import("./components/prendas/prenda-list/prenda-list.component").then((m) => m.PrendaListComponent),
  },
  {
    path: "**",
    redirectTo: "/login",
  }
]
