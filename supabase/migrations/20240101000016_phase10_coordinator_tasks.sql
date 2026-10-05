-- Migration: Phase 3 Coordinator Task Assignments
-- Adds specific operational responsibilities and station assignment to event_coordinators.
-- Preserves existing RLS and foreign keys.

ALTER TABLE event_coordinators
ADD COLUMN IF NOT EXISTS task_attendance BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS task_breakfast BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS task_lunch BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS task_dinner BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS station TEXT;

-- We don't need any additional tables because tasks are directly tied to the coordinator's event assignment.
