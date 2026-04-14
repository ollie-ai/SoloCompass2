/**
 * Unit tests for auth.js login route — account lockout behaviour
 *
 * Tests the lockout logic directly by exercising the route handler
 * with a mocked Express req/res and db.
 */

import { jest } from '@jest/globals';

// ── mocks ──────────────────────────────────────────────────────────────────────
const mockGet = jest.fn();
const mockRun = jest.fn().mockResolvedValue({ changes: 1 });
const dbMock = {
  prepare: jest.fn(() => ({ get: mockGet, run: mockRun })),
  get: mockGet,
  run: mockRun,
};

// bcrypt — allow real compare to be bypassed
const bcryptMock = {
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('$hashed'),
  genSalt: jest.fn().mockResolvedValue('salt'),
};

jest.unstable_mockModule('../../src/db.js', () => ({ default: dbMock }));
jest.unstable_mockModule('bcryptjs', () => ({ default: bcryptMock }));
jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: jest.fn(() => 'mock.jwt.token'),
    verify: jest.fn(),
  },
}));
jest.unstable_mockModule('../../src/services/logger.js', () => ({
  default: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), http: jest.fn() },
}));
jest.unstable_mockModule('../../src/middleware/validate.js', () => ({
  handleValidationErrors: (req, res, next) => next(),
}));
// Suppress email sends
jest.unstable_mockModule('../../src/services/email.js', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
}));

// ── import router after mocks ──────────────────────────────────────────────────
import express from 'express';
import request from 'supertest';

const authRouter = (await import('../../src/routes/auth.js')).default;

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

// ── helpers ───────────────────────────────────────────────────────────────────
const makeUser = (overrides = {}) => ({
  id: '1',
  email: 'test@solo.com',
  password: '$hashed',
  name: 'Test',
  role: 'user',
  is_verified: true,
  is_premium: false,
  subscription_tier: 'explorer',
  premium_expires_at: null,
  failed_attempts: 0,
  locked_until: null,
  admin_level: null,
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret';
  dbMock.prepare.mockReturnValue({ get: mockGet, run: mockRun });
  dbMock.get = mockGet;
  dbMock.run = mockRun;
});

// ── lockout tests ──────────────────────────────────────────────────────────────
describe('POST /api/auth/login — account lockout', () => {
  test('returns 423 when account is currently locked', async () => {
    const lockedUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins from now
    mockGet.mockResolvedValue(makeUser({ locked_until: lockedUntil, failed_attempts: 5 }));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@solo.com', password: 'wrong' });

    expect(res.status).toBe(423);
    expect(res.body.error.code).toBe('ACCOUNT_LOCKED');
  });

  test('locks account after 5 failed attempts and returns 423', async () => {
    mockGet.mockResolvedValue(makeUser({ failed_attempts: 4, locked_until: null }));
    bcryptMock.compare.mockResolvedValue(false); // wrong password

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@solo.com', password: 'wrongpass' });

    expect(res.status).toBe(423);
    expect(res.body.error.code).toBe('ACCOUNT_LOCKED');
    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('locked_until'),
      5,
      expect.any(String),
      '1'
    );
  });

  test('increments failed_attempts (but does not lock) before reaching 5', async () => {
    mockGet.mockResolvedValue(makeUser({ failed_attempts: 2, locked_until: null }));
    bcryptMock.compare.mockResolvedValue(false);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@solo.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('failed_attempts'),
      3,
      '1'
    );
  });

  test('resets failed_attempts on successful login', async () => {
    mockGet.mockResolvedValue(makeUser({ failed_attempts: 2 }));
    bcryptMock.compare.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@solo.com', password: 'correctpass' });

    expect(res.status).toBe(200);
    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('failed_attempts = 0'),
      '1'
    );
  });

  test('allows login on previously locked account once lockout expires', async () => {
    const expiredLock = new Date(Date.now() - 1000).toISOString(); // already expired
    mockGet.mockResolvedValue(makeUser({ locked_until: expiredLock, failed_attempts: 5 }));
    bcryptMock.compare.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@solo.com', password: 'correctpass' });

    expect(res.status).toBe(200);
  });

  test('returns 401 for unknown email without revealing existence', async () => {
    mockGet.mockResolvedValue(null); // user not found

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@solo.com', password: 'anything' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  test('unverified user cannot login', async () => {
    mockGet.mockResolvedValue(makeUser({ is_verified: false, failed_attempts: 0 }));
    bcryptMock.compare.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@solo.com', password: 'correctpass' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('EMAIL_NOT_VERIFIED');
  });
});
