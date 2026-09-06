import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom, catchError, of, throwError } from 'rxjs';
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
   * Decode JWT and extract user information from the token payload
   */
  private decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      const decoded = JSON.parse(atob(parts[1]));
      return decoded;
    } catch (err) {
      return null;
    }
  }

  /**
   * Called on app init (via APP_INITIALIZER).
   * Decodes the stored JWT token and restores the user session.
   * Silently clears state if the token is missing or invalid.
   */
  async fetchCurrentUser(): Promise<void> {
    const token = this.getToken();
    if (!token) return;

    try {
      // Decode JWT to extract user information
      const decoded = this.decodeToken(token);
      
      if (!decoded || !decoded.sub || !decoded.email) {
        // Invalid token — clear everything
        this.currentUserSignal.set(null);
        localStorage.removeItem('ibs_auth_token');
        localStorage.removeItem('ibs_auth_user');
        return;
      }

      // Extract role name if role is an object
      let roleName = 'Branch Manager';
      if (typeof decoded.role === 'string') {
        roleName = decoded.role as AuthUser['role'];
      } else if (typeof decoded.role === 'object' && decoded.role?.name) {
        roleName = decoded.role.name as AuthUser['role'];
      }

      // Map decoded JWT → AuthUser
      const user: AuthUser = {
        id: decoded.sub,
        name: decoded.name ?? decoded.email.split('@')[0],
        email: decoded.email,
        role: roleName as AuthUser['role'],
        branch: 'Main Branch',
        avatarUrl: ''
      };

      // Always keep localStorage in sync
      localStorage.setItem('ibs_auth_user', JSON.stringify(user));
      this.currentUserSignal.set(user);

    } catch {
      // Token decode failure — clear everything
      this.currentUserSignal.set(null);
      localStorage.removeItem('ibs_auth_token');
      localStorage.removeItem('ibs_auth_user');
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
        }).pipe(
          catchError((err: HttpErrorResponse) => {
            return throwError(() => err);
          })
        )
      );

      // Validate response structure
      if (!response || !response.access_token) {
        throw new Error('INVALID_LOGIN_RESPONSE');
      }

      // Store token
      localStorage.setItem('ibs_auth_token', response.access_token);

      // Decode JWT to extract user information
      const decoded = this.decodeToken(response.access_token);
      
      if (!decoded || !decoded.sub || !decoded.email) {
        localStorage.removeItem('ibs_auth_token');
        throw new Error('INVALID_TOKEN_DATA');
      }

      // Extract role name if role is an object
      let roleName = 'Branch Manager';
      if (typeof decoded.role === 'string') {
        roleName = decoded.role as AuthUser['role'];
      } else if (typeof decoded.role === 'object' && decoded.role?.name) {
        roleName = decoded.role.name as AuthUser['role'];
      }

      // Map decoded JWT → AuthUser
      const user: AuthUser = {
        id: decoded.sub,
        name: decoded.name ?? decoded.email.split('@')[0],
        email: decoded.email,
        role: roleName as AuthUser['role'],
        branch: 'Main Branch',
        avatarUrl: ''
      };

      // Persist user if rememberMe
      if (credentials.rememberMe) {
        localStorage.setItem('ibs_auth_user', JSON.stringify(user));
      }

      this.currentUserSignal.set(user);
      this.toastService.success('Login Successful', `Welcome back, ${user.name}!`);
      return true;

    } catch (err) {
      const httpErr = err as HttpErrorResponse;
      let message = 'An unexpected error occurred. Please try again.';
      
      // Handle custom error messages
      if (err instanceof Error) {
        if (err.message === 'INVALID_LOGIN_RESPONSE') {
          message = 'Invalid server response: missing access token';
        } else if (err.message === 'INVALID_TOKEN_DATA') {
          message = 'Invalid token data returned from server';
        } else if (err.message === 'Missing credentials') {
          // Already showed toast, re-throw without showing again
          throw err;
        } else {
          message = err.message;
        }
      } else if (httpErr?.error) {
        // Handle HTTP error responses (401, 500, etc.)
        if (httpErr.error.message) {
          const errorMsg = httpErr.error.message;
          if (typeof errorMsg === 'string') {
            message = errorMsg;
          } else if (typeof errorMsg === 'object') {
            // Extract from nested message object
            message = errorMsg.message ?? errorMsg.error ?? JSON.stringify(errorMsg);
          }
        } else if (httpErr.error.status === 'error' && httpErr.error.message) {
          message = httpErr.error.message;
        }
      }
      
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

  /**
   * Called by AuthInterceptor when the API returns 401 (expired/invalid token).
   * Guarded so a burst of parallel 401s only clears state and redirects once.
   */
  sessionExpired() {
    if (!this.currentUserSignal() && !this.getToken()) return;

    this.currentUserSignal.set(null);
    localStorage.removeItem('ibs_auth_user');
    localStorage.removeItem('ibs_auth_token');
    this.toastService.error('Session Expired', 'Your session has expired. Please sign in again.');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('ibs_auth_token');
  }
}
