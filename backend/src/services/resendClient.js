import { Resend } from 'resend';
import dotenv from 'dotenv';
import { renderTemplate, getTemplate, getAvailableTemplates, getTemplatePreviewVars } from './emailTemplates.js';
import logger from './logger.js';

dotenv.config();

// Lazy initialization helper for Resend client
let _resendInstance = null;
const getResendClient = () => {
    if (!_resendInstance) {
        if (!process.env.RESEND_API_KEY) {
            logger.warn('[Resend] RESEND_API_KEY not yet available. Email operations will fail until secrets are loaded.');
            return null;
        }
        _resendInstance = new Resend(process.env.RESEND_API_KEY);
    }
    return _resendInstance;
};

const getFromEmail = () => process.env.EMAIL_FROM || 'SoloCompass <onboarding@resend.dev>';
const getFromName = () => process.env.EMAIL_FROM_NAME || 'SoloCompass';

export const sendEmail = async ({ to, type, vars, format = 'html', subject, html, text }) => {
  try {
    const resend = getResendClient();
    if (!resend) return { success: false, error: 'Email service not initialized' };
    
    let emailSubject = subject;
    let emailBody = html || text;
    
    if (!emailSubject || !emailBody) {
      if (!type) {
        return { success: false, error: 'Either type or subject/html must be provided' };
      }
      const rendered = renderTemplate(type, vars, format);
      emailSubject = rendered.subject;
      emailBody = rendered.body;
    }
    
    const emailOptions = {
      from: getFromEmail(),
      to: Array.isArray(to) ? to : [to],
      subject: emailSubject,
      [format === 'text' ? 'text' : 'html']: emailBody
    };

    const { data, error } = await resend.emails.send(emailOptions);

    if (error) {
      logger.error(`[Resend] Error sending ${type || 'direct'}:`, error);
      return { success: false, error };
    }

    logger.info(`[Resend] Sent ${type || 'direct'} to ${to}`);
    return { success: true, data, messageId: data?.id };
  } catch (err) {
    logger.error(`[Resend] Exception sending ${type || 'direct'}:`, err);
    return { success: false, error: err.message };
  }
};

export const sendTemplateEmail = async (to, templateType, vars, options = {}) => {
  const { format = 'html', ...rest } = options;
  return sendEmail({ to, type: templateType, vars, format, ...rest });
};

export const sendWelcomeEmail = (to, vars) => 
  sendTemplateEmail(to, 'welcome', vars);

export const sendVerificationEmail = (to, vars) => 
  sendTemplateEmail(to, 'emailVerification', vars);

export const sendPasswordResetEmail = (to, vars) => 
  sendTemplateEmail(to, 'passwordReset', vars);

export const sendTripConfirmation = (to, vars) => 
  sendTemplateEmail(to, 'tripConfirmation', vars);

export const sendSafetyCheckIn = (to, vars) => 
  sendTemplateEmail(to, 'safetyCheckIn', vars);

export const sendEmergencyAlert = (to, vars) => 
  sendTemplateEmail(to, 'emergencyAlert', vars);

export const sendWeeklyDigest = (to, vars) => 
  sendTemplateEmail(to, 'weeklyDigest', vars);

export const previewTemplate = (type, format = 'html') => {
  const template = getTemplate(type);
  if (!template) {
    throw new Error(`Unknown template: ${type}. Available: ${getAvailableTemplates().join(', ')}`);
  }

  const previewVars = getTemplatePreviewVars()[type];
  if (!previewVars) {
    throw new Error(`No preview variables defined for template: ${type}`);
  }

  return renderTemplate(type, previewVars, format);
};

export const getTemplatesInfo = () => {
  return getAvailableTemplates().map(type => {
    const template = getTemplate(type);
    const previewVars = getTemplatePreviewVars()[type];
    return {
      type,
      subject: template.subject,
      variables: previewVars ? Object.keys(previewVars) : []
    };
  });
};

export const testConnection = async () => {
  try {
    const resend = getResendClient();
    if (!resend) return { success: false, error: 'Email service not initialized' };
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: 'test@solocompass.app',
      subject: 'Test - SoloCompass Email System',
      html: '<p>Email system is working!</p>'
    });
    
    if (error) {
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export { getResendClient, getFromEmail as FROM_EMAIL, getFromName as FROM_NAME };
