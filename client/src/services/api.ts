/**
 * API Client Module for FreelanceOS
 * 
 * This module provides the HTTP client configuration and API service functions
 * for communicating with the Spring Boot backend.
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Client,
  ClientCreateDto,
  ClientUpdateDto,
  Project,
  ProjectCreateDto,
  ProjectUpdateDto,
  Task,
  TaskCreateDto,
  TaskUpdateDto,
  CalendarEvent,
  CalendarEventCreateDto,
  ScheduleResult,
  AiGeneratePlanRequest,
  AiGeneratePlanResponse,
  AiRecalculateResponse,
} from '../types';

// Token storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Token management functions
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Request interceptor - add auth token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for the refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(api(originalRequest));
            },
            reject: (err: Error) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      
      if (!refreshToken) {
        isRefreshing = false;
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<AuthResponse>('/api/auth/refresh', {
          refreshToken,
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        setTokens(accessToken, newRefreshToken);
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// AUTH API
// ============================================================================

export const authApi = {
  login: (data: LoginRequest) => 
    api.post<AuthResponse>('/auth/login', data),
  
  register: (data: RegisterRequest) => 
    api.post<AuthResponse>('/auth/register', data),
  
  refresh: (refreshToken: string) => 
    api.post<AuthResponse>('/auth/refresh', { refreshToken }),
  
  logout: () => 
    api.post('/auth/logout'),
  
  me: () => 
    api.get<User>('/auth/me'),
};

// ============================================================================
// CLIENT API
// ============================================================================

export const clientApi = {
  getAll: () => api.get<Client[]>('/clients'),
  getById: (id: number) => api.get<Client>(`/clients/${id}`),
  create: (data: ClientCreateDto) => api.post<Client>('/clients', data),
  update: (id: number, data: ClientUpdateDto) => api.put<Client>(`/clients/${id}`, data),
  delete: (id: number) => api.delete(`/clients/${id}`),
  search: (name: string) => api.get<Client[]>('/clients/search', { params: { name } }),
};

// ============================================================================
// PROJECT API
// ============================================================================

export const projectApi = {
  getAll: () => api.get<Project[]>('/projects'),
  getById: (id: number) => api.get<Project>(`/projects/${id}`),
  getByClient: (clientId: number) => api.get<Project[]>(`/projects/client/${clientId}`),
  getByStatus: (status: string) => api.get<Project[]>('/projects/status', { params: { status } }),
  create: (data: ProjectCreateDto) => api.post<Project>('/projects', data),
  update: (id: number, data: ProjectUpdateDto) => api.put<Project>(`/projects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/${id}`),
};

// ============================================================================
// TASK API
// ============================================================================

export const taskApi = {
  getAll: () => api.get<Task[]>('/tasks'),
  getById: (id: number) => api.get<Task>(`/tasks/${id}`),
  getByProject: (projectId: number) => api.get<Task[]>(`/tasks/project/${projectId}`),
  getOverdue: () => api.get<Task[]>('/tasks/overdue'),
  create: (data: TaskCreateDto) => api.post<Task>('/tasks', data),
  update: (id: number, data: TaskUpdateDto) => api.put<Task>(`/tasks/${id}`, data),
  toggleLock: (id: number) => api.patch<Task>(`/tasks/${id}/toggle-lock`),
  delete: (id: number) => api.delete(`/tasks/${id}`),
};

// ============================================================================
// CALENDAR API
// ============================================================================

export const calendarApi = {
  getAll: () => api.get<CalendarEvent[]>('/calendar'),
  getById: (id: number) => api.get<CalendarEvent>(`/calendar/${id}`),
  getEventsBetween: (start: string, end: string) => 
    api.get<CalendarEvent[]>('/calendar/range', { params: { start, end } }),
  create: (data: CalendarEventCreateDto) => api.post<CalendarEvent>('/calendar', data),
  update: (id: number, data: CalendarEventCreateDto) => api.put<CalendarEvent>(`/calendar/${id}`, data),
  delete: (id: number) => api.delete(`/calendar/${id}`),
  generateSchedule: () => api.post<ScheduleResult>('/calendar/generate-schedule'),
  generateScheduleForProject: (projectId: number) => 
    api.post<ScheduleResult>(`/calendar/generate-schedule/project/${projectId}`),
};

// ============================================================================
// AI API
// ============================================================================

export const aiApi = {
  generatePlan: (data: AiGeneratePlanRequest) => 
    api.post<AiGeneratePlanResponse>('/ai/generate-plan', data),
  generatePlanSimple: (description: string) => 
    api.post<AiGeneratePlanResponse>('/ai/generate-plan/simple', null, { params: { description } }),
  recalculateCalendar: () => 
    api.post<AiRecalculateResponse>('/ai/recalculate-calendar'),
  recalculateProjectCalendar: (projectId: number) => 
    api.post<AiRecalculateResponse>(`/ai/recalculate-calendar/project/${projectId}`),
};

export default api;
