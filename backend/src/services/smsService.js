import twilio from 'twilio';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

// Lazy initialization - check env vars at call time, not load time
let _client = null;
function getClient() {
  if (_client) return _client;
  
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (accountSid && authToken && accountSid.startsWith('AC')) {
    _client = twilio(accountSid, authToken);
    logger.info('[SMS] Twilio client initialized');
  } else {
    logger.warn('[SMS] Twilio credentials not available');
  }
  return _client;
}

const UK_COUNTRY_CODE = '+44';

function formatUKNumber(phone) {
  if (!phone) return null;
  let cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  if (cleaned.startsWith('44')) {
    return UK_COUNTRY_CODE + cleaned.substring(2);
  } else if (cleaned.startsWith('44')) {
    return UK_COUNTRY_CODE + cleaned;
  } else {
    return UK_COUNTRY_CODE + cleaned;
  }
}

export const SMS_TEMPLATES = {
  EMERGENCY: (userName, location, message) => 
    `🚨 EMERGENCY ALERT: ${userName} has triggered an SOS! Location: ${location || 'Unknown'}. ${message ? `Message: ${message}` : ''} Contact emergency services if needed. - SoloCompass`,

  CHECKIN_CONFIRM: (userName, location, time) => 
    `✅ ${userName} checked in safely from ${location || 'their trip'} at ${time}. - SoloCompass`,

  FINAL_WARNING: (userName, scheduledTime) => 
    `⚠️ URGENT: ${userName} missed their check-in scheduled for ${scheduledTime}. Please confirm safety within 15 minutes or emergency contacts will be notified. - SoloCompass`,

  CONTACT_VERIFY: (userName) => 
    `🔐 ${userName} added you as an emergency contact on SoloCompass. Reply YES to verify your phone number and receive emergency alerts. Reply STOP to opt out. - SoloCompass`
};

export async function sendSMS(to, message, userId = null) {
  const client = getClient();
  if (!client) {
    logger.warn('Twilio not configured - SMS not sent:', message.substring(0, 50));
    return { success: false, error: 'Twilio not configured' };
  }

  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!fromNumber) {
    logger.error('TWILIO_PHONE_NUMBER not configured');
    return { success: false, error: 'TWILIO_PHONE_NUMBER not configured' };
  }
  
  try {
    const formattedNumber = formatUKNumber(to);
    if (!formattedNumber) {
      return { success: false, error: 'Invalid phone number format' };
    }

    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: formattedNumber
    });

    logger.info(`SMS sent to ${formattedNumber}:`, result.sid);
    return { success: true, sid: result.sid, to: formattedNumber };
  } catch (err) {
    logger.error('Twilio SMS error:', err.message);
    return { success: false, error: err.message };
  }
}

export async function sendEmergencySMS(contact, user, checkIn) {
  const location = checkIn.address || (checkIn.latitude && checkIn.longitude 
    ? `${checkIn.latitude.toFixed(4)}, ${checkIn.longitude.toFixed(4)}` 
    : 'Unknown');
  
  const message = SMS_TEMPLATES.EMERGENCY(user.name, location, checkIn.message);
  return sendSMS(contact.phone, message, user.id);
}

export async function sendCheckinConfirmationSMS(contact, user, checkIn) {
  const location = checkIn.address || (checkIn.latitude && checkIn.longitude 
    ? `${checkIn.latitude.toFixed(4)}, ${checkIn.longitude.toFixed(4)}` 
    : 'their trip');
  
  const time = new Date(checkIn.created_at).toLocaleTimeString('en-US', { 
    hour: '2-digit', minute: '2-digit' 
  });
  
  const message = SMS_TEMPLATES.CHECKIN_CONFIRM(user.name, location, time);
  return sendSMS(contact.phone, message, user.id);
}

export async function sendFinalWarningSMS(contact, user, scheduledCheckIn) {
  const scheduledTime = new Date(scheduledCheckIn.scheduled_time).toLocaleString('en-US', {
    timeZone: scheduledCheckIn.timezone || 'UTC',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const message = SMS_TEMPLATES.FINAL_WARNING(user.name, scheduledTime);
  return sendSMS(contact.phone, message, user.id);
}

export async function sendVerificationSMS(contact, user) {
  const message = SMS_TEMPLATES.CONTACT_VERIFY(user.name);
  return sendSMS(contact.phone, message, user.id);
}

export async function notifyEmergencyContactsSMS(contacts, user, checkIn, type) {
  const results = [];
  
  for (const contact of contacts) {
    if (!contact.phone) continue;
    
    const shouldNotify = type === 'emergency' 
      ? contact.notify_on_emergency 
      : contact.notify_on_checkin;
    
    if (!shouldNotify) continue;

    const preferSms = contact.prefer_sms === true;
    const preferEmail = contact.prefer_email !== false;

    if (type === 'emergency') {
      if (preferSms && contact.phone) {
        const result = await sendEmergencySMS(contact, user, checkIn);
        results.push({ contactId: contact.id, channel: 'sms', phone: contact.phone, ...result });
      }
    } else if (type === 'missed') {
      if (preferSms && contact.phone) {
        const result = await sendFinalWarningSMS(contact, user, checkIn);
        results.push({ contactId: contact.id, channel: 'sms', phone: contact.phone, ...result });
      }
    } else {
      if (preferSms && contact.phone) {
        const result = await sendCheckinConfirmationSMS(contact, user, checkIn);
        results.push({ contactId: contact.id, channel: 'sms', phone: contact.phone, ...result });
      }
    }
  }
  
  return results;
}