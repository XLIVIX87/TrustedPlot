import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function apiError(
  code: string,
  message: string,
  status: number,
  details?: Record<string, unknown>
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        details,
        correlationId: `req_${randomUUID().replace(/-/g, '').slice(0, 12)}`,
      },
    },
    { status }
  );
}

export function apiValidationError(message: string, details?: Record<string, unknown>) {
  return apiError('VALIDATION_ERROR', message, 400, details);
}

export function apiUnauthorized(message = 'Authentication required') {
  return apiError('UNAUTHENTICATED', message, 401);
}

export function apiForbidden(message = 'Insufficient permissions') {
  return apiError('FORBIDDEN', message, 403);
}

export function apiNotFound(message = 'Resource not found') {
  return apiError('NOT_FOUND', message, 404);
}

export function apiConflict(message: string) {
  return apiError('CONFLICT', message, 409);
}

export function apiRateLimited(message = 'Rate limit exceeded') {
  return apiError('RATE_LIMITED', message, 429);
}

export function apiInternalError(message = 'Internal server error') {
  return apiError('INTERNAL_ERROR', message, 500);
}
