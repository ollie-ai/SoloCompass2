-- Migration v026: Add pending_actions table for admin action approval workflow
-- This table tracks admin actions that require approval from a higher-level admin

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

-- Index for faster queries
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
