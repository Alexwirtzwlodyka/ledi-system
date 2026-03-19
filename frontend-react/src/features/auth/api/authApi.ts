export interface LoginPayload { username: string; password: string; otp?: string }

export function buildLoginRequest(payload: LoginPayload) {
  return { method: 'POST' as const, url: '/auth/login', body: { username: payload.username.trim().toLowerCase(), password: payload.password, otp: payload.otp?.trim() || undefined } }
}

export function buildStepUpRequest(payload: LoginPayload) {
  return { method: 'POST' as const, url: '/auth/step-up', body: { username: payload.username.trim().toLowerCase(), password: payload.password } }
}
