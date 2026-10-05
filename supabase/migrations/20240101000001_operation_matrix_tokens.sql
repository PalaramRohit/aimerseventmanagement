-- 1. Add participant meal opt-in fields
ALTER TABLE event_participants ADD COLUMN breakfast_opted BOOLEAN DEFAULT false;
ALTER TABLE event_participants ADD COLUMN lunch_opted BOOLEAN DEFAULT false;
ALTER TABLE event_participants ADD COLUMN dinner_opted BOOLEAN DEFAULT false;

-- 2. Safely remove the legacy single-token architecture
-- Drop the manual index first
DROP INDEX IF EXISTS idx_ep_matrix_token;
-- Drop the column
ALTER TABLE event_participants DROP COLUMN matrix_token;

-- 3. Create participant_matrix_tokens table
CREATE TABLE participant_matrix_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_participant_id UUID NOT NULL REFERENCES event_participants(id) ON DELETE CASCADE,
    token_type TEXT CHECK (token_type IN ('attendance', 'breakfast', 'lunch', 'dinner')) NOT NULL,
    token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (event_participant_id, token_type)
);

-- 4. Enable RLS
ALTER TABLE participant_matrix_tokens ENABLE ROW LEVEL SECURITY;
