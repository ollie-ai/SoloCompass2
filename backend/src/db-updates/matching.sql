-- SoloCompass Matching Database Schema
-- Version: 1.0

-- Store user quiz profiles for matching
CREATE TABLE IF NOT EXISTS user_travel_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  adventure_level TEXT CHECK(adventure_level IN ('chill', 'moderate', 'adventurous')),
  social_preference TEXT CHECK(social_preference IN ('solo', 'mix', 'social')),
  pace_preference TEXT CHECK(pace_preference IN ('relaxed', 'balanced', 'packed')),
  budget_level TEXT CHECK(budget_level IN ('budget', 'moderate', 'luxury')),
  trip_style TEXT CHECK(trip_style IN ('cultural', 'active', 'mixed', 'relaxed')),
  interests TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Store buddy requests
CREATE TABLE IF NOT EXISTS buddy_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_id INTEGER NOT NULL,
  recipient_id INTEGER NOT NULL,
  trip_id INTEGER NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  responded_at DATETIME,
  FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  UNIQUE(requester_id, recipient_id, trip_id)
);

-- Store accepted buddy connections
CREATE TABLE IF NOT EXISTS buddy_connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user1_id INTEGER NOT NULL,
  user2_id INTEGER NOT NULL,
  trip_id INTEGER NOT NULL,
  connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  UNIQUE(user1_id, user2_id, trip_id)
);

-- Store user blocks (don't show me this person)
CREATE TABLE IF NOT EXISTS user_blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  blocker_id INTEGER NOT NULL,
  blocked_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(blocker_id, blocked_id)
);

-- Matching preferences
CREATE TABLE IF NOT EXISTS matching_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  min_compatibility_score INTEGER DEFAULT 30,
  preferred_destination TEXT,
  date_flexibility INTEGER DEFAULT 3,
  max_budget INTEGER,
  interests_filter TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_buddy_requests_status ON buddy_requests(status);
CREATE INDEX IF NOT EXISTS idx_buddy_requests_recipient ON buddy_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_buddy_requests_requester ON buddy_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_user_travel_profiles_user ON user_travel_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_buddy_connections_users ON buddy_connections(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_matching_preferences_user ON matching_preferences(user_id);
