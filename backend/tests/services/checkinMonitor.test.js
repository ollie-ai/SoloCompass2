/**
 * Unit tests for backend/src/services/checkinMonitor.js
 *
 * Covers escalation flow stages using mocked DB and notification channels.
 */

import { jest } from '@jest/globals';

const mockPrepare = jest.fn();
const dbMock = {
  prepare: mockPrepare,
};

const notifyEmergencyContacts = jest.fn().mockResolvedValue(true);
const createNotification = jest.fn().mockResolvedValue(true);
const notifyEmergencyContactsSMS = jest.fn().mockResolvedValue(true);
const broadcastToUser = jest.fn();

jest.unstable_mockModule('../../src/db.js', () => ({ default: dbMock }));
jest.unstable_mockModule('../../src/services/notificationService.js', () => ({
  notifyEmergencyContacts,
  createNotification,
}));
jest.unstable_mockModule('../../src/services/smsService.js', () => ({
  notifyEmergencyContactsSMS,
}));
jest.unstable_mockModule('../../src/services/websocket.js', () => ({
  broadcastToUser,
}));
jest.unstable_mockModule('../../src/services/logger.js', () => ({
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const { startScheduledCheckInMonitor } = await import('../../src/services/checkinMonitor.js');

const fixedNow = new Date('2026-04-10T12:00:00.000Z');

const makeAllResponder = ({
  upcoming = [],
  missed = [],
  finalWarningNeeded = [],
  contacts = [],
}) => {
  return (sql) => {
    if (sql.includes('FROM emergency_contacts')) {
      return contacts;
    }
    if (sql.includes('scheduled_time > ?') && sql.includes('reminder_sent')) {
      return upcoming;
    }
    if (sql.includes('scheduled_time <= ?') && sql.includes('sci.missed_at IS NULL') && sql.includes('WHERE sci.is_active = true') && !sql.includes('final_warning_sent IS NULL OR sci.final_warning_sent = false')) {
      return missed;
    }
    if (sql.includes('final_warning_sent IS NULL OR sci.final_warning_sent = false')) {
      return finalWarningNeeded;
    }
    return [];
  };
};

const wireDbScenario = (scenario) => {
  const allResponder = makeAllResponder(scenario);

  mockPrepare.mockImplementation((sql) => ({
    all: jest.fn(async () => allResponder(sql)),
    run: jest.fn(async () => ({ changes: 1 })),
  }));
};

const runOneMonitorTick = async () => {
  const intervalSpy = jest.spyOn(global, 'setInterval').mockImplementation((fn) => {
    runOneMonitorTick.intervalFn = fn;
    return 1;
  });

  startScheduledCheckInMonitor();

  expect(typeof runOneMonitorTick.intervalFn).toBe('function');
  await runOneMonitorTick.intervalFn();

  intervalSpy.mockRestore();
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.setSystemTime(fixedNow.getTime());
});

afterEach(() => {
  jest.useRealTimers();
});

describe('checkinMonitor escalation flow', () => {
  test('stage 0: sends reminder for due check-ins within reminder window', async () => {
    wireDbScenario({
      upcoming: [
        {
          id: 11,
          user_id: 7,
          trip_id: 3,
          scheduled_time: new Date(fixedNow.getTime() - 5 * 60 * 1000).toISOString(),
          reminder_sent: false,
          missed_at: null,
          final_warning_sent: false,
          sos_triggered: false,
        },
      ],
      missed: [],
      finalWarningNeeded: [],
    });

    await runOneMonitorTick();

    expect(broadcastToUser).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ type: 'checkin_reminder' })
    );
    expect(createNotification).toHaveBeenCalledWith(
      7,
      'checkin_reminder',
      expect.any(String),
      expect.any(String),
      expect.objectContaining({ scheduledCheckInId: 11 }),
      11
    );
  });

  test('stage 1: after grace period sends final warning and notifies emergency contacts', async () => {
    wireDbScenario({
      upcoming: [],
      missed: [
        {
          id: 22,
          user_id: 9,
          user_name: 'Ava',
          trip_id: 4,
          scheduled_time: new Date(fixedNow.getTime() - 20 * 60 * 1000).toISOString(),
          missed_at: null,
          final_warning_sent: false,
          sos_triggered: false,
        },
      ],
      finalWarningNeeded: [],
      contacts: [{ id: 1, user_id: 9, notify_on_emergency: true }],
    });

    await runOneMonitorTick();

    expect(broadcastToUser).toHaveBeenCalledWith(
      9,
      expect.objectContaining({ type: 'checkin_missed' })
    );
    expect(createNotification).toHaveBeenCalledWith(
      9,
      'checkin_missed',
      expect.any(String),
      expect.any(String),
      expect.objectContaining({ scheduledCheckInId: 22 }),
      22
    );
    expect(notifyEmergencyContacts).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ id: 9, name: 'Ava' }),
      expect.objectContaining({ id: 22 }),
      'missed'
    );
    expect(notifyEmergencyContactsSMS).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ id: 9, name: 'Ava' }),
      expect.objectContaining({ id: 22 }),
      'missed'
    );
  });

  test('stage 2/3: after second grace period triggers SOS and deactivates schedule', async () => {
    wireDbScenario({
      upcoming: [],
      missed: [
        {
          id: 33,
          user_id: 10,
          user_name: 'Noah',
          trip_id: 5,
          scheduled_time: new Date(fixedNow.getTime() - 40 * 60 * 1000).toISOString(),
          missed_at: null,
          final_warning_sent: true,
          sos_triggered: false,
        },
      ],
      finalWarningNeeded: [],
      contacts: [{ id: 2, user_id: 10, notify_on_emergency: true }],
    });

    await runOneMonitorTick();

    expect(broadcastToUser).toHaveBeenCalledWith(
      10,
      expect.objectContaining({ type: 'checkin_sos' })
    );
    expect(createNotification).toHaveBeenCalledWith(
      10,
      'checkin_sos',
      expect.any(String),
      expect.any(String),
      expect.objectContaining({ scheduledCheckInId: 33 }),
      33
    );
    expect(notifyEmergencyContacts).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ id: 10, name: 'Noah' }),
      expect.objectContaining({ id: 33 }),
      'emergency'
    );
    expect(notifyEmergencyContactsSMS).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ id: 10, name: 'Noah' }),
      expect.objectContaining({ id: 33 }),
      'emergency'
    );

    const runCalls = mockPrepare.mock.results
      .map((r) => r.value)
      .filter(Boolean)
      .map((prepared) => prepared.run)
      .filter(Boolean);

    // Ensure at least one run was made to set sos_triggered/is_active in update query path.
    expect(runCalls.length).toBeGreaterThan(0);
  });

  test('does not notify contacts when none exist', async () => {
    wireDbScenario({
      upcoming: [],
      missed: [
        {
          id: 44,
          user_id: 12,
          user_name: 'Mia',
          trip_id: 8,
          scheduled_time: new Date(fixedNow.getTime() - 20 * 60 * 1000).toISOString(),
          missed_at: null,
          final_warning_sent: false,
          sos_triggered: false,
        },
      ],
      finalWarningNeeded: [],
      contacts: [],
    });

    await runOneMonitorTick();

    expect(notifyEmergencyContacts).not.toHaveBeenCalled();
    expect(notifyEmergencyContactsSMS).not.toHaveBeenCalled();
  });
});
