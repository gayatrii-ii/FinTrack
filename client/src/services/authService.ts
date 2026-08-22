import api from './api';
import { User, ApiResponse } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  currency?: string;
}

export interface AuthResponseData {
  user: User;
  token: string;
}

export const authService = {
  async register(data: RegisterCredentials): Promise<AuthResponseData> {
    const res = await api.post<ApiResponse<AuthResponseData>>('/auth/register', data);
    return res.data.data!;
  },

  async login(data: LoginCredentials): Promise<AuthResponseData> {
    const res = await api.post<ApiResponse<AuthResponseData>>('/auth/login', data);
    return res.data.data!;
  },

  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data!;
  },

  async updateProfile(data: { name?: string; currency?: string }): Promise<User> {
    const res = await api.patch<ApiResponse<User>>('/auth/profile', data);
    return res.data.data!;
  },
};
