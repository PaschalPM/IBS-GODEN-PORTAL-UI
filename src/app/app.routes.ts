import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

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
      },
      {
        path: 'users',
        loadComponent: () => import('./features/dedukt/pages/user-management/user-management.component').then(m => m.UserManagementComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
