-- Migration: Audit fixes from codebase audit
-- Run this file to apply schema changes

-- 1. Add reminder_sent to scheduled_check_ins
ALTER TABLE scheduled_check_ins ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;

-- 2. Add deleted_at and deleted_by to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id);

-- 3. Add source_attribution to destinations for trust
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS safety_source VARCHAR(100);
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS safety_source_checked_at TIMESTAMP;

-- 4. Add city/country hierarchy to destinations
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS destination_level VARCHAR(20) DEFAULT 'city' CHECK (destination_level IN ('country', 'city', 'region'));
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS parent_destination_id INTEGER REFERENCES destinations(id);
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

-- 5. Add research tracking to destinations
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS research_status VARCHAR(50) DEFAULT 'not_started';
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS research_last_run_at TIMESTAMP;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS content_fresh_until TIMESTAMP;

-- 6. Add ai_usage tracking columns
ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS use_case VARCHAR(50);
ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'azure_openai';
ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS is_fallback BOOLEAN DEFAULT false;
ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS prompt_version VARCHAR(20);

-- Confirm changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('scheduled_check_ins', 'users', 'destinations', 'ai_usage')
AND column_name IN ('reminder_sent', 'deleted_at', 'deleted_by', 'destination_level', 'parent_destination_id', 'slug', 'research_status', 'use_case', 'source', 'is_fallback')
ORDER BY table_name, column_name;