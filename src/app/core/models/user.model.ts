export type UserRole = 'Super Admin' | 'Verification Officer' | 'Branch Manager' | 'Auditor' | 'Analyst';

export interface PortalUser {
  id: string;          // uuid from API
  index?: number;
  name: string;
  branch: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  role: string;        // API role name e.g. 'admin' | 'staff'
}

// ── API shapes ────────────────────────────────────────────────────────────────

export interface ApiPermission {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiRole {
  id: number;
  name: string;
  permissions?: ApiPermission[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiUser {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  role: ApiRole;
  createdAt: string;
  updatedAt: string;
}

export interface RolesListResponse {
  status: string;
  message: string;
  data: ApiRole[];
}

export interface UsersListResponse {
  status: string;
  message: string;
  data: ApiUser[];
}

export interface CreateUserResponse {
  status: string;
  message: string;
  data: {
    user: ApiUser;
    new_password: string;
  };
}

export interface ResetPasswordResponse {
  status: string;
  message: string;
  data: {
    new_password: string;
  };
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ChangeRoleRequest {
  role?: string;
  role_id?: number;
}
