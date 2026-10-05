-- Migration: 20240101000031_team_project_submission.sql
-- Description: Add project submission fields to event_teams

ALTER TABLE event_teams
ADD COLUMN github_url TEXT,
ADD COLUMN deployed_url TEXT,
ADD COLUMN submitted_at TIMESTAMPTZ;
