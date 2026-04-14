-- SoloCompass Migration Script
-- Run this SQL in your Supabase SQL Editor to add all new tables and fields
-- Created: April 2026

-- ============================================================
-- PART 1: DESTINATION GOVERNANCE FIELDS
-- ============================================================

-- Add new columns to destinations table (if not exist)
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS destination_type TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS primary_city TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS timezone TEXT;

ALTER TABLE destinations ADD COLUMN IF NOT EXISTS publication_status TEXT DEFAULT 'draft' CHECK(publication_status IN ('draft', 'pending_review', 'live', 'paused', 'blocked'));
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS safety_gate_status TEXT DEFAULT 'unchecked' CHECK(safety_gate_status IN ('unchecked', 'pass', 'fail'));
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS manual_review_status TEXT DEFAULT 'pending' CHECK(manual_review_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS reviewer INTEGER REFERENCES users(id);
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS advisory_checked_at TIMESTAMP;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS advisory_source TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS advisory_summary TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS stale_after TIMESTAMP;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS notes_for_internal_review TEXT;

ALTER TABLE destinations ADD COLUMN IF NOT EXISTS internal_safety_tier TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS internal_confidence_score REAL;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS common_risks TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS safer_areas_summary TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS areas_extra_caution TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS after_dark_guidance TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS transport_safety_notes TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS women_solo_notes TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS lgbtq_notes TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS emergency_prep_note TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS scam_harassment_patterns TEXT;

ALTER TABLE destinations ADD COLUMN IF NOT EXISTS short_summary TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS why_solo_travellers TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS best_for_tags TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS climate_summary TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS arrival_tips TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS local_etiquette_notes TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS ideal_trip_length TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS neighbourhood_shortlist TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS content_freshness_date TIMESTAMP;

ALTER TABLE destinations ADD COLUMN IF NOT EXISTS ai_batch_run_id TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS ai_prompt_version TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS ai_briefing_status TEXT DEFAULT 'pending' CHECK(ai_briefing_status IN ('pending', 'generated', 'reviewed', 'published'));
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS ai_quality_score REAL;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS fallback_summary_available BOOLEAN DEFAULT FALSE;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS source_pack_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS ai_card_summary TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS ai_safety_brief TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS ai_solo_suitability TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS ai_arrival_checklist TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS ai_neighbourhood_guidance TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS ai_after_dark TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS ai_common_friction TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS ai_quick_facts TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS ai_fallback_summary TEXT;

-- Migrate existing data: set publication_status = 'live' for existing live destinations
UPDATE destinations SET publication_status = 'live' WHERE status = 'live' AND (publication_status IS NULL OR publication_status = 'draft');

-- ============================================================
-- PART 2: MESSAGING TABLES
-- ============================================================

-- Buddy Conversations
CREATE TABLE IF NOT EXISTS buddy_conversations (
  id SERIAL PRIMARY KEY,
  participant_a INTEGER NOT NULL REFERENCES users(id),
  participant_b INTEGER NOT NULL REFERENCES users(id),
  trip_id INTEGER REFERENCES trips(id),
  last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Buddy Messages
CREATE TABLE IF NOT EXISTS buddy_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES buddy_conversations(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK(message_type IN ('text', 'image', 'system')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PART 3: CALLS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS buddy_calls (
  id SERIAL PRIMARY KEY,
  caller_id INTEGER NOT NULL REFERENCES users(id),
  receiver_id INTEGER NOT NULL REFERENCES users(id),
  conversation_id INTEGER REFERENCES buddy_conversations(id),
  call_type TEXT DEFAULT 'video' CHECK(call_type IN ('video', 'audio')),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined', 'ended', 'missed')),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PART 4: TRIP SHARING TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS trip_shares (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  share_code TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trip_collaborators (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  role TEXT DEFAULT 'editor' CHECK(role IN ('editor', 'viewer')),
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(trip_id, user_id)
);

-- ============================================================
-- PART 5: INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON buddy_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_a ON buddy_conversations(participant_a);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_b ON buddy_conversations(participant_b);
CREATE INDEX IF NOT EXISTS idx_calls_caller ON buddy_calls(caller_id);
CREATE INDEX IF NOT EXISTS idx_calls_receiver ON buddy_calls(receiver_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON buddy_calls(status);
CREATE INDEX IF NOT EXISTS idx_trip_shares_code ON trip_shares(share_code);
CREATE INDEX IF NOT EXISTS idx_trip_collaborators_trip ON trip_collaborators(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_collaborators_user ON trip_collaborators(user_id);

-- ============================================================
-- PART 6: NOTIFICATION TYPE FIX
-- ============================================================

-- Drop the constraint if it exists (to fix the checkin_missed type issue)
-- First check if constraint exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'notifications_type_check' 
    AND conrelid = 'notifications'::regclass
  ) THEN
    ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
  END IF;
END $$;

-- ============================================================
-- COMPLETE
-- ============================================================

SELECT 'Migration completed successfully!' as status;