export interface User {
  id: string;
  name: string;
  empCode: string;
  email: string;
  role?: {
    id: string;
    name: string;
    permissions: string[];
    slug:string;
  };
  personalPermissions?: Permission[];
  rolePermissions?: Permission[];
  _id?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  empCode: string;
  mobile:string;
}

declare module '../services/auth' {
  export function login(email: string, password: string): Promise<AuthResponse>;
  export function register(name: string, empCode: string, email: string,mobile:string, password: string): Promise<AuthResponse>;
  export function logout(): Promise<void>;
  export function getCurrentUser(): Promise<User>;
  export function hasPermission(permission: string): boolean;
}
