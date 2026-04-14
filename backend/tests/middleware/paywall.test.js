/**
 * Unit tests for backend/src/middleware/paywall.js
 *
 * Mocks the `db` module so no live database is required.
 */

import { jest } from '@jest/globals';

// ── db mock ────────────────────────────────────────────────────────────────────
const mockGet = jest.fn();
const dbMock = {
  prepare: jest.fn(() => ({ get: mockGet })),
};

jest.unstable_mockModule('../../src/db.js', () => ({ default: dbMock }));
jest.unstable_mockModule('../../src/services/logger.js', () => ({
  default: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

// ── import SUT after mocks are registered ─────────────────────────────────────
const { requireFeature, enforceTripLimits, hasFeature, FEATURES, PLAN_TIERS } =
  await import('../../src/middleware/paywall.js');

// ── helpers ───────────────────────────────────────────────────────────────────
const makeReq = (userId = 1) => ({ userId });
const makeRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  dbMock.prepare.mockReturnValue({ get: mockGet });
});

// ── hasFeature ─────────────────────────────────────────────────────────────────
describe('hasFeature()', () => {
  test('Explorer cannot access AI_CHAT', async () => {
    mockGet.mockResolvedValueOnce({ subscription_tier: 'explorer', is_premium: false });
    expect(await hasFeature(1, FEATURES.AI_CHAT)).toBe(false);
  });

  test('Guardian cannot access AI_CHAT', async () => {
    mockGet.mockResolvedValueOnce({ subscription_tier: 'guardian', is_premium: false });
    expect(await hasFeature(1, FEATURES.AI_CHAT)).toBe(false);
  });

  test('Navigator can access AI_CHAT', async () => {
    mockGet.mockResolvedValueOnce({ subscription_tier: 'navigator', is_premium: false });
    expect(await hasFeature(1, FEATURES.AI_CHAT)).toBe(true);
  });

  test('Explorer cannot access SCHEDULED_CHECKIN', async () => {
    mockGet.mockResolvedValueOnce({ subscription_tier: 'explorer', is_premium: false });
    expect(await hasFeature(1, FEATURES.SCHEDULED_CHECKIN)).toBe(false);
  });

  test('Guardian can access SCHEDULED_CHECKIN', async () => {
    mockGet.mockResolvedValueOnce({ subscription_tier: 'guardian', is_premium: false });
    expect(await hasFeature(1, FEATURES.SCHEDULED_CHECKIN)).toBe(true);
  });

  test('Legacy premium user treated as Guardian (can access SCHEDULED_CHECKIN)', async () => {
    mockGet.mockResolvedValueOnce({ subscription_tier: null, is_premium: true });
    expect(await hasFeature(1, FEATURES.SCHEDULED_CHECKIN)).toBe(true);
  });

  test('Explorer cannot access BUDDY_DISCOVERY', async () => {
    mockGet.mockResolvedValueOnce({ subscription_tier: 'explorer', is_premium: false });
    expect(await hasFeature(1, FEATURES.BUDDY_DISCOVERY)).toBe(false);
  });

  test('Explorer can access CREATE_TRIPS', async () => {
    mockGet.mockResolvedValueOnce({ subscription_tier: 'explorer', is_premium: false });
    expect(await hasFeature(1, FEATURES.CREATE_TRIPS)).toBe(true);
  });

  test('Unknown user defaults to Explorer access (no AI_CHAT)', async () => {
    mockGet.mockResolvedValueOnce(null);
    expect(await hasFeature(1, FEATURES.AI_CHAT)).toBe(false);
  });
});

// ── requireFeature middleware ──────────────────────────────────────────────────
describe('requireFeature()', () => {
  test('blocks Explorer from AI_CHAT with 403', async () => {
    mockGet.mockResolvedValue({ subscription_tier: 'explorer', is_premium: false });
    const req = makeReq();
    const res = makeRes();
    const next = jest.fn();

    await requireFeature(FEATURES.AI_CHAT)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('allows Navigator to access AI_CHAT', async () => {
    mockGet.mockResolvedValue({ subscription_tier: 'navigator', is_premium: false });
    const req = makeReq();
    const res = makeRes();
    const next = jest.fn();

    await requireFeature(FEATURES.AI_CHAT)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('allows Guardian to access SCHEDULED_CHECKIN', async () => {
    mockGet.mockResolvedValue({ subscription_tier: 'guardian', is_premium: false });
    const req = makeReq();
    const res = makeRes();
    const next = jest.fn();

    await requireFeature(FEATURES.SCHEDULED_CHECKIN)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('error in DB lookup calls next() to avoid blocking user', async () => {
    mockGet.mockRejectedValueOnce(new Error('DB down'));
    const req = makeReq();
    const res = makeRes();
    const next = jest.fn();

    await requireFeature(FEATURES.AI_CHAT)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});

// ── enforceTripLimits middleware ───────────────────────────────────────────────
describe('enforceTripLimits()', () => {
  const req = makeReq();

  test('allows Explorer with 1 active trip to create another', async () => {
    mockGet
      .mockResolvedValueOnce({ subscription_tier: 'explorer', is_premium: false }) // user row
      .mockResolvedValueOnce({ count: 1 }); // trip count
    const res = makeRes();
    const next = jest.fn();

    await enforceTripLimits(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  test('blocks Explorer who already has 2 active trips', async () => {
    mockGet
      .mockResolvedValueOnce({ subscription_tier: 'explorer', is_premium: false })
      .mockResolvedValueOnce({ count: 2 });
    const res = makeRes();
    const next = jest.fn();

    await enforceTripLimits(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('allows Guardian with 10 active trips (no limit)', async () => {
    mockGet
      .mockResolvedValueOnce({ subscription_tier: 'guardian', is_premium: false })
      .mockResolvedValueOnce({ count: 10 });
    const res = makeRes();
    const next = jest.fn();

    await enforceTripLimits(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('allows Navigator with 10 active trips (no limit)', async () => {
    mockGet
      .mockResolvedValueOnce({ subscription_tier: 'navigator', is_premium: false })
      .mockResolvedValueOnce({ count: 10 });
    const res = makeRes();
    const next = jest.fn();

    await enforceTripLimits(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('error in DB lookup calls next() to avoid blocking user', async () => {
    mockGet.mockRejectedValueOnce(new Error('DB timeout'));
    const res = makeRes();
    const next = jest.fn();

    await enforceTripLimits(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
