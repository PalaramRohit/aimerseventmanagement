-- Fix privileges for event_teams
GRANT INSERT ON public.event_teams TO authenticated;
GRANT UPDATE ON public.event_teams TO authenticated;
GRANT DELETE ON public.event_teams TO authenticated;
