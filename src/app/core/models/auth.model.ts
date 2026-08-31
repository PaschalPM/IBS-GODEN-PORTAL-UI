export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Verification Officer' | 'Branch Manager' | 'Auditor' | 'admin';
  branch: string;
  avatarUrl?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/** Shape returned by POST /auth/login - only contains the token */
export interface LoginResponse {
  access_token: string;
}

/** Shape returned by GET /auth/me */
export interface MeResponse {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  role: string | { id?: number; name?: string; permissions?: any[] };
  branch?: string;
  avatarUrl?: string;
}
