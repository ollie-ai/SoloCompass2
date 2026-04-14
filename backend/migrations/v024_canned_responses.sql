-- SoloCompass Database Migration v024
-- Add Canned Responses Table for Support
-- Created: 2026-04-09

-- ============================================
-- Table: canned_responses
-- ============================================
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

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_canned_responses_category ON canned_responses(category);
CREATE INDEX idx_canned_responses_created_by ON canned_responses(created_by);

-- ============================================
-- Seed some default canned responses
-- ============================================
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