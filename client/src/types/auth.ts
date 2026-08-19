// Mirrors the backend DTOs in com.wziem.lancebackend.api.dto.auth.
// If the backend shape changes, this file changes — keep them in sync.

export interface RegisterRequest {
  email: string;
  fullName: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  fullName: string;
}

export interface SendCodeRequest {
  email: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface AccessTokenResponse {
  accessToken: string;
  tokenType: string;
}

// Minimal app-side user shape. Grows as endpoints return more fields.
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  hourlyRate: number | null;
}

export interface UpdateHourlyRateRequest {
  hourlyRate: number;
}
