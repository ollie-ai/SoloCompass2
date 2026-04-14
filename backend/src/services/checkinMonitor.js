import db from '../db.js';
import { notifyEmergencyContacts, createNotification } from './notificationService.js';
import { notifyEmergencyContactsSMS } from './smsService.js';
import { broadcastToUser } from './websocket.js';
import logger from './logger.js';

const CHECK_INTERVAL_MS = 60000;
const GRACE_PERIOD_MS = 15 * 60 * 1000;
const REMINDER_BEFORE_MS = 15 * 60 * 1000;

export function startScheduledCheckInMonitor() {
  logger.info('[CheckIn Monitor] Starting scheduled check-in monitor');
  
  setInterval(async () => {
    try {
      const now = new Date();
      
      const upcomingCheckIns = await db.prepare(`
        SELECT 
          sci.*,
          u.id as user_id,
          u.name as user_name,
          u.email as user_email
        FROM scheduled_check_ins sci
        JOIN users u ON sci.user_id = u.id
        WHERE sci.is_active = true
          AND sci.scheduled_time > ?
          AND sci.scheduled_time <= ?
          AND (sci.reminder_sent IS NULL OR sci.reminder_sent = false)
      `).all(
        new Date(now.getTime() - REMINDER_BEFORE_MS).toISOString(),
        now.toISOString()
      );

      for (const sci of upcomingCheckIns) {
        await db.prepare(`
          UPDATE scheduled_check_ins SET reminder_sent = true WHERE id = ?
        `).run(sci.id);

        broadcastToUser(sci.user_id, {
          type: 'checkin_reminder',
          scheduledCheckIn: {
            id: sci.id,
            scheduledTime: sci.scheduled_time,
            tripId: sci.trip_id
          },
          message: `Check-in due at ${new Date(sci.scheduled_time).toLocaleTimeString()}. Tap to confirm you're safe.`
        });

        await createNotification(
          sci.user_id,
          'checkin_reminder',
          'Scheduled Check-In Due Soon',
          `Your check-in is due at ${new Date(sci.scheduled_time).toLocaleTimeString()}. Confirm now or your contacts will be notified.`,
          { scheduledCheckInId: sci.id, tripId: sci.trip_id },
          sci.id
        );

        logger.info(`[CheckIn Monitor] Reminder sent for scheduled check-in ${sci.id}`);
      }
      
      const missedCheckIns = await db.prepare(`
        SELECT 
          sci.*,
          u.id as user_id,
          u.name as user_name,
          u.email as user_email
        FROM scheduled_check_ins sci
        JOIN users u ON sci.user_id = u.id
        WHERE sci.is_active = true
          AND sci.scheduled_time <= ?
          AND sci.missed_at IS NULL
      `).all(now.toISOString());

      for (const sci of missedCheckIns) {
        const scheduledTime = new Date(sci.scheduled_time);
        const timeSinceMissed = now - scheduledTime;
        
        if (timeSinceMissed >= GRACE_PERIOD_MS && !sci.final_warning_sent) {
          await sendFinalWarning(sci);
        } else if (timeSinceMissed >= GRACE_PERIOD_MS * 2 && !sci.sos_triggered) {
          await triggerSOS(sci);
        }
      }

      const finalWarningNeeded = await db.prepare(`
        SELECT 
          sci.*,
          u.id as user_id,
          u.name as user_name,
          u.email as user_email
        FROM scheduled_check_ins sci
        JOIN users u ON sci.user_id = u.id
        WHERE sci.is_active = true
          AND sci.scheduled_time <= ?
          AND sci.missed_at IS NULL
          AND (sci.final_warning_sent IS NULL OR sci.final_warning_sent = false)
      `).all(new Date(now - GRACE_PERIOD_MS).toISOString());

      for (const sci of finalWarningNeeded) {
        await db.prepare(`
          UPDATE scheduled_check_ins 
          SET missed_at = CURRENT_TIMESTAMP, final_warning_sent = true 
          WHERE id = ?
        `).run(sci.id);
        
        await sendFinalWarning(sci);
      }

    } catch (error) {
      logger.error('[CheckIn Monitor] Error:', error.message);
    }
  }, CHECK_INTERVAL_MS);
  
  logger.info('[CheckIn Monitor] Check-in monitor running (checks every 60s, 15min grace period)');
}

async function sendFinalWarning(scheduledCheckIn) {
  try {
    const contacts = await db.prepare(`
      SELECT * FROM emergency_contacts 
      WHERE user_id = ? AND notify_on_emergency = true
    `).all(scheduledCheckIn.user_id);

    if (contacts.length === 0) return;

    const user = {
      id: scheduledCheckIn.user_id,
      name: scheduledCheckIn.user_name
    };

    logger.info(`[CheckIn Monitor] Sending final warning for user ${scheduledCheckIn.user_id}`);

    broadcastToUser(scheduledCheckIn.user_id, {
      type: 'checkin_missed',
      message: `You missed your scheduled check-in. Your emergency contacts will be notified if you don't check in within 15 minutes.`,
      scheduledCheckInId: scheduledCheckIn.id
    });

    await createNotification(
      scheduledCheckIn.user_id,
      'checkin_missed',
      'Missed Check-In - Final Warning',
      'You missed your scheduled check-in. Emergency contacts will be notified in 15 minutes.',
      { scheduledCheckInId: scheduledCheckIn.id },
      scheduledCheckIn.id
    );

    await notifyEmergencyContacts(contacts, user, scheduledCheckIn, 'missed');
    await notifyEmergencyContactsSMS(contacts, user, scheduledCheckIn, 'missed');

    await db.prepare(`
      UPDATE scheduled_check_ins SET final_warning_sent = true WHERE id = ?
    `).run(scheduledCheckIn.id);

  } catch (error) {
    logger.error('[CheckIn Monitor] Error sending final warning:', error.message);
  }
}

async function triggerSOS(scheduledCheckIn) {
  try {
    const contacts = await db.prepare(`
      SELECT * FROM emergency_contacts 
      WHERE user_id = ? AND notify_on_emergency = true
    `).all(scheduledCheckIn.user_id);

    if (contacts.length === 0) return;

    const user = {
      id: scheduledCheckIn.user_id,
      name: scheduledCheckIn.user_name
    };

    logger.info(`[CheckIn Monitor] Triggering SOS for user ${scheduledCheckIn.user_id}`);

    broadcastToUser(scheduledCheckIn.user_id, {
      type: 'checkin_sos',
      message: `SOS triggered. Your emergency contacts have been notified.`,
      scheduledCheckInId: scheduledCheckIn.id
    });

    await createNotification(
      scheduledCheckIn.user_id,
      'checkin_sos',
      'SOS - Emergency Contacts Notified',
      `Your emergency contacts have been notified that you missed your check-in at ${new Date(scheduledCheckIn.scheduled_time).toLocaleTimeString()}.`,
      { scheduledCheckInId: scheduledCheckIn.id },
      scheduledCheckIn.id
    );

    await notifyEmergencyContacts(contacts, user, scheduledCheckIn, 'emergency');
    await notifyEmergencyContactsSMS(contacts, user, scheduledCheckIn, 'emergency');

    await db.prepare(`
      UPDATE scheduled_check_ins SET sos_triggered = true, is_active = false WHERE id = ?
    `).run(scheduledCheckIn.id);

  } catch (error) {
    logger.error('[CheckIn Monitor] Error triggering SOS:', error.message);
  }
}
