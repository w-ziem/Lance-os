import { useMutation } from '@tanstack/react-query';
import api from '@services/api';
import type {
  AccessTokenResponse,
  RegisterRequest,
  RegisterResponse,
  SendCodeRequest,
  VerifyCodeRequest,
} from '@/types/auth';

// Each mutation maps one backend endpoint. No caching here — these are writes.
// Components consume them via { mutate, mutateAsync, isPending, error }.

export function useRegister() {
  return useMutation<RegisterResponse, Error, RegisterRequest>({
    mutationFn: (data) =>
      api.post<RegisterResponse>('/auth/register', data).then((r) => r.data),
  });
}

export function useSendCode() {
  return useMutation<void, Error, SendCodeRequest>({
    mutationFn: (data) =>
      api.post<void>('/auth/send-code', data).then((r) => r.data),
  });
}

export function useVerifyCode() {
  return useMutation<AccessTokenResponse, Error, VerifyCodeRequest>({
    mutationFn: (data) =>
      api.post<AccessTokenResponse>('/auth/verify-code', data).then((r) => r.data),
  });
}
