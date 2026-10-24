export type Role = 'STUDENT' | 'TEACHER' | 'USER' | 'ADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  /** Legacy alias for accessToken, retained for Experiment 1 clients. */
  token: string;
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  username: string;
  role: Role;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: 'STUDENT' | 'TEACHER';
}

export interface Mark {
  id: number;
  studentId: number;
  studentName: string;
  subject: string;
  assessment: string;
  score: number;
  maxScore: number;
  uploadedBy: string;
}

export interface AuthState {
  token: string | null;
  username: string | null;
  role: Role | null;
  isAuthenticated: boolean;
}

export interface ApiError {
  status?: number;
  message: string;
}
