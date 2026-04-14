import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const API_BASE = process.env.VITE_API_URL || 'http://localhost:3005/api';

export const server = setupServer(
  http.get(`${API_BASE}/trips`, () => {
    return HttpResponse.json({
      success: true,
      data: { trips: [] }
    });
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('API Health', () => {
  it('should return health check', async () => {
    const res = await fetch(`${API_BASE}/health`);
    const data = await res.json();
    expect(data.success).toBe(true);
  });
});

describe('Trips API', () => {
  it('should return empty trips array', async () => {
    const res = await fetch(`${API_BASE}/trips`);
    const data = await res.json();
    expect(data.data.trips).toEqual([]);
  });
});