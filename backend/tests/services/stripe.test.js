/**
 * Unit tests for backend/src/services/stripe.js — handleStripeWebhook
 *
 * Mocks Stripe SDK, db, and email service — no network calls.
 */

import { jest } from '@jest/globals';

process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';

// ── mocks ──────────────────────────────────────────────────────────────────────
const mockRun = jest.fn().mockResolvedValue({ changes: 1 });
const mockGet = jest.fn();
const dbMock = {
  prepare: jest.fn(() => ({ get: mockGet, run: mockRun })),
  run: mockRun,
  get: mockGet,
};

const mockConstructEvent = jest.fn();
const stripeMock = {
  webhooks: { constructEvent: mockConstructEvent },
};

jest.unstable_mockModule('stripe', () => ({ default: jest.fn(() => stripeMock) }));
jest.unstable_mockModule('../../src/db.js', () => ({ default: dbMock }));
jest.unstable_mockModule('../../src/services/logger.js', () => ({
  default: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));
jest.unstable_mockModule('../../src/services/notificationService.js', () => ({
  createNotification: jest.fn().mockResolvedValue(true),
  getNotificationPreferences: jest.fn().mockResolvedValue({}),
}));
jest.unstable_mockModule('../../src/services/notificationRegistry.js', () => ({
  CHANNEL: { PUSH: 'push', EMAIL: 'email' },
  getChannelsForType: jest.fn(() => []),
}));
jest.unstable_mockModule('../../src/services/pushService.js', () => ({
  sendPushNotification: jest.fn().mockResolvedValue(true),
}));
jest.unstable_mockModule('../../src/services/email.js', () => ({
  sendCustomEmail: jest.fn().mockResolvedValue(true),
}));

const { handleStripeWebhook } = await import('../../src/services/stripe.js');

// ── helpers ───────────────────────────────────────────────────────────────────
const makeEvent = (type, data) => ({ type, data: { object: data } });

beforeEach(() => {
  jest.clearAllMocks();
  dbMock.prepare.mockReturnValue({ get: mockGet, run: mockRun });
  dbMock.run = mockRun;
  dbMock.get = mockGet;
});

// ── checkout.session.completed ─────────────────────────────────────────────────
describe('checkout.session.completed', () => {
  test('upgrades user to guardian tier and sets is_premium', async () => {
    const session = {
      client_reference_id: '42',
      customer: 'cus_test123',
      metadata: { planTier: 'guardian' },
    };
    mockConstructEvent.mockReturnValue(makeEvent('checkout.session.completed', session));
    mockGet.mockResolvedValue({ email: 'user@test.com', name: 'Test User' });

    const result = await handleStripeWebhook('sig', Buffer.from('{}'));

    expect(result).toMatchObject({ success: true });
    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE users SET is_premium'),
      expect.any(String), // expiryDate
      'cus_test123',
      'guardian',
      '42'
    );
  });

  test('defaults to explorer tier when metadata missing', async () => {
    const session = {
      client_reference_id: '99',
      customer: 'cus_abc',
      metadata: {},
    };
    mockConstructEvent.mockReturnValue(makeEvent('checkout.session.completed', session));
    mockGet.mockResolvedValue(null); // no email lookup needed

    await handleStripeWebhook('sig', Buffer.from('{}'));

    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE users SET is_premium'),
      expect.any(String),
      'cus_abc',
      'explorer',
      '99'
    );
  });

  test('upgrades user to navigator tier', async () => {
    const session = {
      client_reference_id: '7',
      customer: 'cus_nav',
      metadata: { planTier: 'navigator' },
    };
    mockConstructEvent.mockReturnValue(makeEvent('checkout.session.completed', session));
    mockGet.mockResolvedValue({ email: 'nav@test.com', name: 'Nav User' });

    const result = await handleStripeWebhook('sig', Buffer.from('{}'));

    expect(result.success).toBe(true);
    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('subscription_tier'),
      expect.any(String),
      'cus_nav',
      'navigator',
      '7'
    );
  });
});

// ── customer.subscription.deleted ─────────────────────────────────────────────
describe('customer.subscription.deleted', () => {
  test('downgrades user to explorer and sets is_premium=false', async () => {
    const subscription = { customer: 'cus_cancel123' };
    mockConstructEvent.mockReturnValue(makeEvent('customer.subscription.deleted', subscription));
    mockGet.mockResolvedValue({ id: '55' });

    const result = await handleStripeWebhook('sig', Buffer.from('{}'));

    expect(result).toMatchObject({ success: true });
    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('is_premium = false'),
      'explorer',
      'cus_cancel123'
    );
  });

  test('no-ops gracefully when stripe_customer_id not found', async () => {
    const subscription = { customer: 'cus_unknown' };
    mockConstructEvent.mockReturnValue(makeEvent('customer.subscription.deleted', subscription));
    mockGet.mockResolvedValue(null); // user not found

    const result = await handleStripeWebhook('sig', Buffer.from('{}'));

    // Should succeed without calling UPDATE
    expect(result).toMatchObject({ success: true });
    expect(mockRun).not.toHaveBeenCalledWith(
      expect.stringContaining('is_premium = false'),
      expect.anything(),
      expect.anything()
    );
  });
});

// ── signature verification failure ────────────────────────────────────────────
describe('signature verification', () => {
  test('returns error when Stripe signature invalid', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('No signatures found matching the expected signature for payload.');
    });

    const result = await handleStripeWebhook('bad-sig', Buffer.from('{}'));

    expect(result).toMatchObject({ success: false });
    expect(mockRun).not.toHaveBeenCalled();
  });
});

// ── unknown event type ─────────────────────────────────────────────────────────
describe('unknown event type', () => {
  test('returns success and does nothing for unhandled event type', async () => {
    mockConstructEvent.mockReturnValue(makeEvent('invoice.paid', {}));

    const result = await handleStripeWebhook('sig', Buffer.from('{}'));

    expect(result).toMatchObject({ success: true });
  });
});
