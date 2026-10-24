import axios, { AxiosError } from 'axios';
import type { LoginRequest, LoginResponse, RegisterRequest, User, ApiError, Mark, Role } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle global errors (401, 403)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenType');
        localStorage.removeItem('expiresIn');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else if (status === 403) {
        if (window.location.pathname !== '/access-denied') {
          window.location.href = '/access-denied';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const loginApi = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/api/auth/login', credentials);
  return response.data;
};

export const registerApi = async (data: RegisterRequest): Promise<User> => {
  const response = await api.post<User>('/api/auth/register', data);
  return response.data;
};

export const getProfileApi = async (): Promise<User> => {
  const response = await api.get<User>('/api/user/profile');
  return response.data;
};

export const getUsersApi = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/api/admin/users');
  return response.data;
};

export const deleteUserApi = async (id: number): Promise<void> => {
  await api.delete(`/api/admin/users/${id}`);
};

export const updateUserApi = async (user: User): Promise<User> => {
  const response = await api.put<User>(`/api/admin/users/${user.id}`, {
    username: user.username, email: user.email, role: user.role,
  });
  return response.data;
};

export const getMarksApi = async (): Promise<Mark[]> => (await api.get<Mark[]>('/api/marks')).data;
export const getStudentsApi = async (): Promise<User[]> => (await api.get<User[]>('/api/teacher/students')).data;
export const uploadMarkApi = async (mark: Omit<Mark, 'id' | 'studentName' | 'uploadedBy'>): Promise<Mark> =>
  (await api.post<Mark>('/api/marks', mark)).data;
export const deleteMarkApi = async (id: number): Promise<void> => { await api.delete(`/api/marks/${id}`); };
export const getRoleLabel = (role: Role) => role === 'USER' ? 'STUDENT' : role;
