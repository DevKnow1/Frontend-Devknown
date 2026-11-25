import { apiClient } from './client';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from '../types/api';

export const authApi = {
  // HU-10 (RF-01): Registro público
  register: async (payload: RegisterRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
    return data;
  },

  // HU-11 (RF-02): Inicio de sesión
  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  // HU-13 (RF-03): Revoca el token en el servidor
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  // HU-12 (RF-04): Obtiene el usuario autenticado y su rol actual
  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },
};