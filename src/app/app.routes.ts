import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'services',
    canActivate: [authGuard],
    loadComponent: () => import('./features/portal/services-hub.component').then(m => m.ServicesHubComponent)
  },
  {
    path: 'users',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/dedukt/layout/users-layout.component').then(m => m.UsersLayoutComponent)
  },
  {
    path: 'settings',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/dedukt/layout/general-layout.component').then(m => m.GeneralLayoutComponent)
  },
  {
    path: 'dedukt',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dedukt/layout/dedukt-layout.component').then(m => m.DeduktLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'search'
      },
      {
        path: 'search',
        loadComponent: () => import('./features/dedukt/pages/employee-search/employee-search.component').then(m => m.EmployeeSearchComponent)
      },
      {
        path: 'deductions',
        loadComponent: () => import('./features/dedukt/pages/deductions/deductions.component').then(m => m.DeductionsComponent)
      },
      {
        path: 'cancellations',
        loadComponent: () => import('./features/dedukt/pages/cancellations/cancellations.component').then(m => m.CancellationsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
