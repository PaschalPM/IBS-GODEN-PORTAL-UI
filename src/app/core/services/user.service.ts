import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  PortalUser,
  ApiUser,
  ApiRole,
  CreateUserDto,
  RolesListResponse,
  UsersListResponse,
  CreateUserResponse,
  ResetPasswordResponse,
  ChangePasswordRequest,
  ChangeRoleRequest
} from '../models/user.model';
import { ToastService } from './toast.service';
import { environment } from '../../../environments/environment';

/** Maps an API user object to the flat PortalUser shape used by the UI. */
function mapApiUser(u: ApiUser): PortalUser {
  return {
    id: u.uuid,
    name: `${u.first_name} ${u.last_name}`.trim(),
    email: u.email,
    role: u.role.name as PortalUser['role'],
    branch: 'Main Branch',        // API doesn't return branch yet
    phoneNumber: '',              // API doesn't return phone yet
    status: 'Active',
    createdAt: u.createdAt
  };
}

@Injectable({ providedIn: 'root' })
export class UserService {

  private readonly base = `${environment.apiUrl}/users`;
  private readonly rolesUrl = `${environment.apiUrl}/roles`;

  // Reactive store — components read from these signals
  readonly users = signal<PortalUser[]>([]);
  readonly roles = signal<ApiRole[]>([]);
  readonly loading = signal(false);

  constructor(
    private http: HttpClient,
    private toast: ToastService
  ) {}

  // ── GET /roles ──────────────────────────────────────────────────────────────
  async loadRoles(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.get<RolesListResponse>(this.rolesUrl)
      );
      this.roles.set(res.data || []);
    } catch (err) {
      const msg = this.extractMessage(err, 'Failed to load roles.');
      console.warn('Roles load warning:', msg);
    }
  }

  // ── GET /users ──────────────────────────────────────────────────────────────
  async loadUsers(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(
        this.http.get<UsersListResponse>(this.base)
      );
      this.users.set(res.data.map(mapApiUser));
    } catch (err) {
      const msg = this.extractMessage(err, 'Failed to load users.');
      this.toast.error('Users Error', msg);
    } finally {
      this.loading.set(false);
    }
  }

  // ── POST /users ─────────────────────────────────────────────────────────────
  async createUser(dto: CreateUserDto): Promise<{ user: PortalUser; newPassword: string } | null> {
    this.loading.set(true);
    try {
      const payload = {
        first_name: dto.firstName,
        last_name: dto.lastName,
        email: dto.email,
        role: dto.role
      };
      const res = await firstValueFrom(
        this.http.post<CreateUserResponse>(this.base, payload)
      );
      const mapped = mapApiUser(res.data.user);
      // Prepend to local store so the table updates instantly
      this.users.update(list => [mapped, ...list]);
      this.toast.success('User Created', res.message ?? 'User created successfully.');
      return { user: mapped, newPassword: res.data.new_password };
    } catch (err) {
      const msg = this.extractMessage(err, 'Failed to create user.');
      this.toast.error('Create User Failed', msg);
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  // ── DELETE /users/:uuid ──────────────────────────────────────────────────────
  async deleteUser(uuid: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.base}/${uuid}`)
      );
      this.users.update(list => list.filter(u => u.id !== uuid));
      this.toast.success('User Deleted', 'User has been removed successfully.');
      return true;
    } catch (err) {
      const msg = this.extractMessage(err, 'Failed to delete user.');
      this.toast.error('Delete Failed', msg);
      return false;
    }
  }

  // ── POST /users/change-password ─────────────────────────────────────────────
  async changePassword(payload: ChangePasswordRequest): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.post(`${this.base}/change-password`, payload)
      );
      this.toast.success('Password Changed', 'Your password has been updated.');
      return true;
    } catch (err) {
      const msg = this.extractMessage(err, 'Failed to change password.');
      this.toast.error('Change Password Failed', msg);
      return false;
    }
  }

  // ── POST /users/:uuid/reset-password ────────────────────────────────────────
  async resetPassword(uuid: string): Promise<string | null> {
    try {
      const res = await firstValueFrom(
        this.http.post<ResetPasswordResponse>(`${this.base}/${uuid}/reset-password`, {})
      );
      this.toast.success('Password Reset', res.message ?? 'Password reset successfully.');
      return res.data.new_password;
    } catch (err) {
      const msg = this.extractMessage(err, 'Failed to reset password.');
      this.toast.error('Reset Failed', msg);
      return null;
    }
  }

  // ── PATCH / POST /users/:uuid/change-role ───────────────────────────────────
  async changeRole(uuid: string, roleName: string, roleId?: number): Promise<boolean> {
    try {
      const payload: ChangeRoleRequest = {
        role: roleName,
        ...(roleId ? { role_id: roleId } : {})
      };

      try {
        await firstValueFrom(
          this.http.patch(`${this.base}/${uuid}/change-role`, payload)
        );
      } catch (err: any) {
        if (err?.status === 404 || err?.status === 405) {
          await firstValueFrom(
            this.http.post(`${this.base}/${uuid}/change-role`, payload)
          );
        } else {
          throw err;
        }
      }

      // Update local state in users signal
      this.users.update(list =>
        list.map(u => u.id === uuid ? { ...u, role: roleName as any } : u)
      );
      this.toast.success('Role Updated', `User role successfully updated to ${roleName}.`);
      return true;
    } catch (err) {
      const msg = this.extractMessage(err, 'Failed to update user role.');
      this.toast.error('Role Update Failed', msg);
      return false;
    }
  }

  // ── Helper ───────────────────────────────────────────────────────────────────
  private extractMessage(err: unknown, fallback: string): string {
    const httpErr = err as HttpErrorResponse;
    return (
      httpErr?.error?.message?.message ??
      httpErr?.error?.message ??
      httpErr?.message ??
      fallback
    );
  }
}
