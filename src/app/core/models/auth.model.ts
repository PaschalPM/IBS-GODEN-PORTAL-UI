export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Verification Officer' | 'Branch Manager' | 'Auditor';
  branch: string;
  avatarUrl?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/** Shape returned by POST /auth/login */
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name?: string;
    fullName?: string;
    email: string;
    role: string;
    branch?: string;
    avatarUrl?: string;
  };
}

/** Shape returned by GET /auth/me */
export interface MeResponse {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  role: string;
  branch?: string;
  avatarUrl?: string;
}
