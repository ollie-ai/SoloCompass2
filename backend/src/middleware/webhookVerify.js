import crypto from 'crypto';

const WEBHOOK_SIGNATURE_HEADER = 'x-webhook-signature';
const WEBHOOK_TIMESTAMP_HEADER = 'x-webhook-timestamp';
const WEBHOOK_TOLERANCE_SECONDS = 300;

export function verifyWebhook(secret, requiredEvent = null) {
  return (req, res, next) => {
    const signature = req.headers[WEBHOOK_SIGNATURE_HEADER];
    const timestamp = req.headers[WEBHOOK_TIMESTAMP_HEADER];

    if (!signature) {
      return res.status(401).json({
        success: false,
        error: { code: 'MISSING_SIGNATURE', message: 'Webhook signature is required' }
      });
    }

    if (!timestamp) {
      return res.status(401).json({
        success: false,
        error: { code: 'MISSING_TIMESTAMP', message: 'Webhook timestamp is required' }
      });
    }

    const now = Math.floor(Date.now() / 1000);
    const webhookTime = parseInt(timestamp, 10);

    if (isNaN(webhookTime) || Math.abs(now - webhookTime) > WEBHOOK_TOLERANCE_SECONDS) {
      return res.status(401).json({
        success: false,
        error: { code: 'TIMESTAMP_EXPIRED', message: 'Webhook timestamp is expired' }
      });
    }

    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const providedSignature = signature.replace(/^sha256=/, '');

    if (!crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    )) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_SIGNATURE', message: 'Webhook signature verification failed' }
      });
    }

    if (requiredEvent && req.headers['x-webhook-event'] !== requiredEvent) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_EVENT', message: `Expected event type: ${requiredEvent}` }
      });
    }

    req.webhookVerified = true;
    next();
  };
}

export function verifyPaymentWebhook(secret) {
  return verifyWebhook(secret, 'payment.event');
}

export function extractWebhookData(req) {
  return {
    event: req.headers['x-webhook-event'],
    timestamp: req.headers['x-webhook-timestamp'],
    signature: req.headers['x-webhook-signature'],
    body: req.body
  };
}
