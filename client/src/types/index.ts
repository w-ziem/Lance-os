/**
 * TypeScript Type Definitions for FreelanceOS
 * 
 * These types mirror the backend DTOs and entities for type-safe frontend development.
 */

// ============================================================================
// ENUMS (as const objects for compatibility with erasableSyntaxOnly)
// ============================================================================

export const ProjectStatus = {
  PLANNED: 'PLANNED',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;
export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus];

export const TaskStatus = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;
export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export const TaskPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;
export type TaskPriority = typeof TaskPriority[keyof typeof TaskPriority];

export const AuthProvider = {
  LOCAL: 'LOCAL',
  GOOGLE: 'GOOGLE',
} as const;
export type AuthProvider = typeof AuthProvider[keyof typeof AuthProvider];

export const Role = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;
export type Role = typeof Role[keyof typeof Role];

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  provider: AuthProvider;
  roles: Role[];
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ============================================================================
// CLIENT TYPES
// ============================================================================

export interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  projectCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClientCreateDto {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
}

export interface ClientUpdateDto {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
}

// ============================================================================
// PROJECT TYPES
// ============================================================================

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  clientId: number;
  clientName: string;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCreateDto {
  name: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  clientId: number;
}

export interface ProjectUpdateDto {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// TASK TYPES
// ============================================================================

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedHours?: number;
  deadline?: string;
  locked: boolean;
  projectId: number;
  projectName: string;
  calendarEventId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCreateDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  estimatedHours?: number;
  deadline?: string;
  locked?: boolean;
  projectId: number;
}

export interface TaskUpdateDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  estimatedHours?: number;
  deadline?: string;
  locked?: boolean;
}

// ============================================================================
// CALENDAR TYPES
// ============================================================================

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  taskId?: number;
  taskTitle?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEventCreateDto {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  taskId?: number;
}

// ============================================================================
// SCHEDULING TYPES
// ============================================================================

export interface ScheduleResult {
  scheduledEvents: CalendarEvent[];
  unscheduledTaskIds: number[];
  conflicts: ScheduleConflict[];
  totalScheduledHours: number;
  success: boolean;
  message: string;
}

export interface ScheduleConflict {
  taskId: number;
  reason: string;
  suggestedResolution?: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

// ============================================================================
// AI TYPES
// ============================================================================

export interface AiGeneratePlanRequest {
  projectDescription: string;
  clientName?: string;
  deadline?: string;
  budget?: number;
}

export interface AiGeneratePlanResponse {
  success: boolean;
  message?: string;
  suggestedTasks: TaskSuggestion[];
  estimatedTotalHours?: number;
  estimatedDuration?: string;
}

export interface TaskSuggestion {
  title: string;
  description?: string;
  estimatedHours: number;
  priority: string;
  order: number;
}

export interface AiRecalculateResponse {
  success: boolean;
  message?: string;
  suggestedOrder?: number[];
  warnings?: string[];
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiError {
  status: number;
  error: string;
  message: string;
  timestamp: string;
  path: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
