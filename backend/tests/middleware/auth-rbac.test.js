/**
 * RBAC matrix tests for backend/src/middleware/auth.js
 */

import { jest } from '@jest/globals';

const dbMock = {
  prepare: jest.fn(() => ({ get: jest.fn(), run: jest.fn() })),
  run: jest.fn(),
};

const jwtVerify = jest.fn();

jest.unstable_mockModule('../../src/db.js', () => ({ default: dbMock }));
jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    verify: jwtVerify,
    sign: jest.fn(() => 'token'),
  },
}));
jest.unstable_mockModule('../../src/services/logger.js', () => ({
  default: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

const {
  requireAdmin,
  requireSuperAdmin,
  requireModerator,
  requireViewerOrAbove,
} = await import('../../src/middleware/auth.js');

const runMiddleware = async (middleware, decodedUser) => {
  process.env.JWT_SECRET = 'test-secret';
  process.env.SESSION_VALIDATION_ENABLED = 'false';

  jwtVerify.mockReturnValue(decodedUser);

  const req = {
    headers: { authorization: 'Bearer test-token' },
    cookies: {},
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();

  await middleware(req, res, next);

  return { req, res, next };
};

describe('RBAC middleware matrix', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('requireViewerOrAbove allows user role', async () => {
    const { next, res } = await runMiddleware(requireViewerOrAbove, { userId: 1, role: 'user' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('requireViewerOrAbove allows viewer role', async () => {
    const { next, res } = await runMiddleware(requireViewerOrAbove, { userId: 1, role: 'viewer' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('requireViewerOrAbove denies unknown role', async () => {
    const { next, res } = await runMiddleware(requireViewerOrAbove, { userId: 1, role: 'guest' });
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('requireAdmin denies non-admin', async () => {
    const { next, res } = await runMiddleware(requireAdmin, { userId: 1, role: 'viewer' });
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('requireAdmin allows admin', async () => {
    const { next, res } = await runMiddleware(requireAdmin, { userId: 1, role: 'admin', admin_level: 'support' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('requireModerator denies support admin', async () => {
    const { next, res } = await runMiddleware(requireModerator, { userId: 1, role: 'admin', admin_level: 'support' });
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('requireModerator allows moderator', async () => {
    const { next, res } = await runMiddleware(requireModerator, { userId: 1, role: 'admin', admin_level: 'moderator' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('requireModerator allows super_admin', async () => {
    const { next, res } = await runMiddleware(requireModerator, { userId: 1, role: 'admin', admin_level: 'super_admin' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('requireSuperAdmin denies moderator', async () => {
    const { next, res } = await runMiddleware(requireSuperAdmin, { userId: 1, role: 'admin', admin_level: 'moderator' });
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('requireSuperAdmin allows super_admin', async () => {
    const { next, res } = await runMiddleware(requireSuperAdmin, { userId: 1, role: 'admin', admin_level: 'super_admin' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
