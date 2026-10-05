# Phase — Team Project Submission Verification Report

## Verification Checklist

1. **Required Database Changes**: ✅
   - Evaluated `event_teams` schema and applied `20240101000031_team_project_submission.sql`.
   - Safely appended `github_url`, `deployed_url`, and `submitted_at` columns.

2. **Team Leader Authorization**: ✅
   - The `ProjectSubmission` component renders an interactive form only if `isLeader` is true.
   - The Server Action `submitProject` explicitly checks `participation.team_role === 'leader'` using `requireParticipant()` (authenticated user).

3. **Team Member Read-Only Behavior**: ✅
   - Non-leaders see a clean, informative "Not Submitted Yet" placeholder.
   - Once submitted, all members (including leaders) see a read-only list of the links and timestamp. No edit/delete buttons exist.
   
4. **Duplicate/Second Submission Rejection**: ✅
   - Handled optimistically via `submittedAt` state in UI.
   - Securely enforced in Server Action: `.is('submitted_at', null)` guarantees the `service_role` client strictly allows only ONE submission to lock into the database.

5. **Cross-team / Cross-event Rejection**: ✅
   - The RPC explicitly requires the participant's `team_id` derived server-side.
   - The update query checks `.eq('id', teamId)` and `.eq('event_id', eventId)` preventing modification of other teams or events.

6. **URL Validation**: ✅
   - Frontend and Backend validations require `github_url` to explicitly begin with `https://github.com/`.
   - `deployed_url` is optional, but if provided, must strictly start with `https://`.

7. **Admin Visibility**: ✅
   - Modified `TeamManager.tsx` in the Admin Portal to gracefully present the team's Problem Statement and conditionally display the active project submission links inside the detailed view map.

8. **Integrity and Security Checks**: ✅
   - Used `SUPABASE_SERVICE_ROLE_KEY` inside the Server Action because `event_teams` is RLS-protected against writes from regular participants.
   - No sensitive mock data, keys, or unnecessary architectural changes were included.

9. **Build/Lint/Typecheck**: ✅
   - Background tasks processed `npm run typecheck && npm run lint && npm run build` successfully after resolving minor Lucide icon disparities (`GitBranch` vs `Github`).
