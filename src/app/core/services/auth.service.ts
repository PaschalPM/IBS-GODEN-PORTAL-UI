import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom, catchError, of } from 'rxjs';
import { AuthUser, LoginCredentials, LoginResponse, MeResponse } from '../models/auth.model';
import { ToastService } from './toast.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<AuthUser | null>(this.getStoredUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastService: ToastService
  ) {}

  private getStoredUser(): AuthUser | null {
    try {
      const saved = localStorage.getItem('ibs_auth_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  }

  /**
   * Called on app init (via APP_INITIALIZER).
   * Validates the stored token against GET /auth/me and refreshes the user signal.
   * Silently clears state if the token is missing or rejected (401).
   */
  async fetchCurrentUser(): Promise<void> {
    const token = this.getToken();
    if (!token) return;

    try {
      const me = await firstValueFrom(
        this.http.get<MeResponse>(`${environment.apiUrl}/auth/me`).pipe(
          catchError(() => of(null))
        )
      );

      if (!me) {
        // Token rejected — clear everything
        this.currentUserSignal.set(null);
        localStorage.removeItem('ibs_auth_token');
        localStorage.removeItem('ibs_auth_user');
        return;
      }

      const user: AuthUser = {
        id: me.id,
        name: me.fullName ?? me.name ?? me.email.split('@')[0],
        email: me.email,
        role: (me.role as AuthUser['role']) ?? 'Branch Manager',
        branch: me.branch ?? 'Main Branch',
        avatarUrl: me.avatarUrl ?? ''
      };

      // Always keep localStorage in sync
      localStorage.setItem('ibs_auth_user', JSON.stringify(user));
      this.currentUserSignal.set(user);

    } catch {
      // Network failure — keep current local state, don't force logout
    }
  }

  async login(credentials: LoginCredentials): Promise<boolean> {
    if (!credentials.email || !credentials.password) {
      this.toastService.error('Validation Error', 'Please enter both email and password.');
      throw new Error('Missing credentials');
    }

    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, {
          email: credentials.email,
          password: credentials.password
        })
      );

      // Map API user → AuthUser
      const user: AuthUser = {
        id: response.user.id,
        name: response.user.fullName ?? response.user.name ?? credentials.email.split('@')[0],
        email: response.user.email,
        role: (response.user.role as AuthUser['role']) ?? 'Branch Manager',
        branch: response.user.branch ?? 'Main Branch',
        avatarUrl: response.user.avatarUrl ?? ''
      };

      // Persist token
      localStorage.setItem('ibs_auth_token', response.token);

      // Persist user if rememberMe
      if (credentials.rememberMe) {
        localStorage.setItem('ibs_auth_user', JSON.stringify(user));
      }

      this.currentUserSignal.set(user);
      this.toastService.success('Login Successful', `Welcome back, ${user.name}!`);
      return true;

    } catch (err) {
      const httpErr = err as HttpErrorResponse;
      const message =
        httpErr?.error?.message ??
        httpErr?.message ??
        'An unexpected error occurred. Please try again.';
      this.toastService.error('Login Failed', message);
      throw err;
    }
  }

  logout() {
    this.currentUserSignal.set(null);
    localStorage.removeItem('ibs_auth_user');
    localStorage.removeItem('ibs_auth_token');
    this.toastService.info('Signed Out', 'You have been signed out of IBS Golden Portal.');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('ibs_auth_token');
  }
}
