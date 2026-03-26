import { describe, it, expect } from 'vitest';
import { apiSuccess, apiError, apiValidationError, apiUnauthorized, apiForbidden, apiNotFound, apiConflict, apiRateLimited, apiInternalError } from '@/lib/api-response';

describe('API Response Helpers', () => {
  it('apiSuccess returns 200 with data', async () => {
    const response = apiSuccess({ id: '123', name: 'Test' });
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.id).toBe('123');
  });

  it('apiSuccess respects custom status code', async () => {
    const response = apiSuccess({ created: true }, 201);
    expect(response.status).toBe(201);
  });

  it('apiValidationError returns 400', async () => {
    const response = apiValidationError('Bad input', { field: 'title' });
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toBe('Bad input');
  });

  it('apiUnauthorized returns 401', async () => {
    const response = apiUnauthorized();
    const body = await response.json();
    expect(response.status).toBe(401);
    expect(body.error.code).toBe('UNAUTHENTICATED');
  });

  it('apiForbidden returns 403', async () => {
    const response = apiForbidden('Not allowed');
    const body = await response.json();
    expect(response.status).toBe(403);
    expect(body.error.message).toBe('Not allowed');
  });

  it('apiNotFound returns 404', async () => {
    const response = apiNotFound('Item not found');
    const body = await response.json();
    expect(response.status).toBe(404);
    expect(body.error.message).toBe('Item not found');
  });

  it('apiConflict returns 409', async () => {
    const response = apiConflict('Duplicate');
    const body = await response.json();
    expect(response.status).toBe(409);
    expect(body.error.code).toBe('CONFLICT');
  });

  it('apiRateLimited returns 429', async () => {
    const response = apiRateLimited('Too many requests');
    const body = await response.json();
    expect(response.status).toBe(429);
    expect(body.error.code).toBe('RATE_LIMITED');
  });

  it('apiInternalError returns 500', async () => {
    const response = apiInternalError();
    const body = await response.json();
    expect(response.status).toBe(500);
    expect(body.error.code).toBe('INTERNAL_ERROR');
  });

  it('apiError includes correlationId', async () => {
    const response = apiError('CUSTOM', 'Custom error', 422);
    const body = await response.json();
    expect(response.status).toBe(422);
    expect(body.error.message).toBe('Custom error');
    expect(body.error.correlationId).toBeDefined();
    expect(body.error.correlationId).toMatch(/^req_/);
  });
});
