-- ============================================================
-- SoloCompass Database Migrations v023-v026
-- Run these in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- v023: Site-wide Announcement System
-- Adds table for managing site-wide announcements visible to all users
-- ============================================================

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL,
  message VARCHAR(2000) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'critical')),
  active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_announcements_active ON announcements(active) WHERE active = true;
CREATE INDEX idx_announcements_dates ON announcements(start_date, end_date);
CREATE INDEX idx_announcements_created_by ON announcements(created_by);


-- ============================================================
-- v024: Add Canned Responses Table for Support
-- ============================================================

CREATE TABLE IF NOT EXISTS canned_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('billing', 'technical', 'account', 'general')),
    subject VARCHAR(500),
    body TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}',
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_canned_responses_category ON canned_responses(category);
CREATE INDEX idx_canned_responses_created_by ON canned_responses(created_by);

-- Seed some default canned responses
INSERT INTO canned_responses (title, category, subject, body, variables) VALUES
('Welcome', 'general', 'Welcome to SoloCompass!', 
 'Hi {{user_name}},

Welcome to SoloCompass! We''re excited to have you on board. If you have any questions about getting started, feel free to reach out.

Safe travels!
The SoloCompass Team',
 ARRAY['user_name']),

('Password Reset', 'account', 'Password Reset Instructions',
 'Hi {{user_name}},

We received a request to reset your password. Click the link below to create a new password:

{{reset_link}}

This link will expire in 24 hours.

If you didn''t request this, please ignore this email.

Best,
The SoloCompass Team',
 ARRAY['user_name', 'reset_link']),

('Billing Inquiry', 'billing', 'Re: Your Billing Question',
 'Hi {{user_name}},

Thank you for reaching out about your billing concern. I''ve looked into your account (ID: {{user_id}}) and see the following:

{{billing_details}}

If you need any clarification, please let me know.

Best regards,
SoloCompass Support',
 ARRAY['user_name', 'user_id', 'billing_details']),

('Technical Issue', 'technical', 'Re: Technical Support Request',
 'Hi {{user_name}},

Thank you for reporting this issue. Our technical team is looking into it and will get back to you within 24-48 hours.

Your ticket reference: {{ticket_id}}

In the meantime, you can check our help center at {{help_url}} for common solutions.

Best,
SoloCompass Technical Team',
 ARRAY['user_name', 'ticket_id', 'help_url']),

('Account Verification', 'account', 'Account Verification Complete',
 'Hi {{user_name}},

Your account has been successfully verified. You now have full access to all SoloCompass features.

Your verified email: {{email}}

Need to update your profile? Visit: {{profile_url}}

Happy travels!
The SoloCompass Team',
 ARRAY['user_name', 'email', 'profile_url']),

('Subscription Upgrade', 'billing', 'Your Premium Subscription',
 'Hi {{user_name}},

Thank you for upgrading to SoloCompass Premium! Your subscription is now active.

Plan: {{plan_name}}
Started: {{start_date}}
Next billing: {{next_billing}}

Your premium benefits include:
{{benefits}}

Questions? Reply to this email.

Best,
SoloCompass Billing',
 ARRAY['user_name', 'plan_name', 'start_date', 'next_billing', 'benefits']),

('Trip Planning Help', 'general', 'Planning Your Solo Adventure',
 'Hi {{user_name}},

Great to hear you''re planning a trip to {{destination}}! 

Here are some resources to help you plan:
- Safety information: {{safety_url}}
- Solo traveler tips: {{tips_url}}
- Destination guides: {{guides_url}}

Would you like help creating your trip itinerary? Just let me know!

Safe travels,
Atlas (SoloCompass AI)',
 ARRAY['user_name', 'destination', 'safety_url', 'tips_url', 'guides_url']),

('Check-in Reminder', 'technical', 'Setting Up Safety Check-ins',
 'Hi {{user_name}},

To set up safety check-ins for your trip to {{destination}}, follow these steps:

1. Go to your trip in the app
2. Click on "Safety" tab
3. Set your check-in schedule
4. Add emergency contacts

Your check-ins will help keep you safe while traveling solo.

Need help? Reply to this email.

Best,
SoloCompass Safety Team',
 ARRAY['user_name', 'destination']);


-- ============================================================
-- v025: Add webhook_deliveries table for tracking webhooks with retry support
-- ============================================================

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id VARCHAR(255),
  url VARCHAR(2048) NOT NULL,
  payload JSONB,
  headers JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'pending',
  response_code INTEGER,
  response_body TEXT,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  next_retry_at TIMESTAMP,
  last_attempt_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_next_retry ON webhook_deliveries(next_retry_at) WHERE next_retry_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);


-- ============================================================
-- v026: Add pending_actions table for admin action approval workflow
-- This table tracks admin actions that require approval from a higher-level admin
-- ============================================================

CREATE TABLE IF NOT EXISTS pending_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type VARCHAR(100) NOT NULL,
  actor_admin_id INTEGER NOT NULL REFERENCES users(id),
  target_type VARCHAR(50) NOT NULL,
  target_id VARCHAR(255) NOT NULL,
  params JSONB DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by INTEGER REFERENCES users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_pending_actions_status ON pending_actions(status);
CREATE INDEX IF NOT EXISTS idx_pending_actions_actor ON pending_actions(actor_admin_id);
CREATE INDEX IF NOT EXISTS idx_pending_actions_created ON pending_actions(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE pending_actions IS 'Tracks admin actions requiring approval from higher-level admins';
COMMENT ON COLUMN pending_actions.action_type IS 'Type of action (e.g., delete_user, anonymize_user, delete_destination)';
COMMENT ON COLUMN pending_actions.actor_admin_id IS 'Admin who requested the action';
COMMENT ON COLUMN pending_actions.target_type IS 'Type of target (e.g., user, destination)';
COMMENT ON COLUMN pending_actions.target_id IS 'ID of the target resource';
COMMENT ON COLUMN pending_actions.params IS 'JSON parameters for the action';
COMMENT ON COLUMN pending_actions.status IS 'Current status: pending, approved, or rejected';
COMMENT ON COLUMN pending_actions.approved_by IS 'Admin who approved or rejected the action';
COMMENT ON COLUMN pending_actions.rejection_reason IS 'Reason provided when action is rejected';


-- ============================================================
-- Migration Complete
-- Run this in Supabase SQL Editor to create all new tables
-- ============================================================