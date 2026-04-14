-- v023: Site-wide Announcement System
-- Adds table for managing site-wide announcements visible to all users

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

-- Add index on created_by for admin lookups
CREATE INDEX idx_announcements_created_by ON announcements(created_by);