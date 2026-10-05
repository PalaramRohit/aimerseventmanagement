-- Migration: 20240101000025_problem_statements.sql
-- Description: Adds problem statements table and links to event_teams

-- 1. Create problem statements table
CREATE TABLE event_problem_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(event_id, title)
);

-- 2. Add foreign key to event_teams
ALTER TABLE event_teams 
ADD COLUMN problem_statement_id UUID REFERENCES event_problem_statements(id) ON DELETE SET NULL;

-- 3. RLS Policies
ALTER TABLE event_problem_statements ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "problem_statements_admin_all" ON event_problem_statements
  FOR ALL TO authenticated
  USING (public.get_my_role() = 'admin');

-- Participants can select published statements
CREATE POLICY "problem_statements_participant_select" ON event_problem_statements
  FOR SELECT TO authenticated
  USING (
    is_published = true 
    AND EXISTS (
      SELECT 1 FROM event_participants ep
      WHERE ep.event_id = event_problem_statements.event_id
      AND ep.participant_id = auth.uid()
    )
  );

-- We explicitly do not add an UPDATE policy on event_teams for participants.
-- Selection will be handled via a secure Service Role server action that verifies membership.

GRANT SELECT ON public.event_problem_statements TO authenticated;
