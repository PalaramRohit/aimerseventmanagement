-- Migration: Phase 13 Coordinator Scan History
-- Adds RLS updates for coordinators to see their own scans.
-- Adds RPCs for fetching admin and coordinator scan histories.

-- 1. Update RLS for attendance_records
DROP POLICY IF EXISTS "attendance_select" ON attendance_records;
CREATE POLICY "attendance_select" ON attendance_records
  FOR SELECT TO authenticated
  USING (
    participant_id = auth.uid()
    OR public.get_my_role() = 'admin'
    OR (
        scanned_by = auth.uid() 
        AND event_id IN (SELECT event_id FROM event_coordinators WHERE coordinator_id = auth.uid())
    )
  );

-- 2. Update RLS for food_records
DROP POLICY IF EXISTS "food_select" ON food_records;
CREATE POLICY "food_select" ON food_records
  FOR SELECT TO authenticated
  USING (
    participant_id = auth.uid()
    OR public.get_my_role() = 'admin'
    OR (
        scanned_by = auth.uid() 
        AND event_id IN (SELECT event_id FROM event_coordinators WHERE coordinator_id = auth.uid())
    )
  );

-- 3. RPC: get_admin_scan_history
CREATE OR REPLACE FUNCTION get_admin_scan_history(event_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    is_admin BOOLEAN;
    result JSONB;
BEGIN
    -- Verify admin
    IF public.get_my_role() != 'admin' THEN
        RAISE EXCEPTION 'Access denied: Admin only';
    END IF;

    WITH coordinator_stats AS (
        SELECT 
            ec.coordinator_id,
            p.full_name as coordinator_name,
            ec.task_attendance,
            ec.task_breakfast,
            ec.task_lunch,
            ec.task_dinner,
            COALESCE(att.scan_count, 0) as attendance_count,
            COALESCE(food_bf.scan_count, 0) as breakfast_count,
            COALESCE(food_lu.scan_count, 0) as lunch_count,
            COALESCE(food_dn.scan_count, 0) as dinner_count,
            GREATEST(att.last_scan, food_bf.last_scan, food_lu.last_scan, food_dn.last_scan) as last_scan,
            (COALESCE(att.scan_count, 0) + COALESCE(food_bf.scan_count, 0) + COALESCE(food_lu.scan_count, 0) + COALESCE(food_dn.scan_count, 0)) as total_scans
        FROM event_coordinators ec
        JOIN profiles p ON p.id = ec.coordinator_id
        LEFT JOIN (
            SELECT scanned_by, COUNT(*) as scan_count, MAX(scanned_at) as last_scan 
            FROM attendance_records 
            WHERE event_id = event_id_param 
            GROUP BY scanned_by
        ) att ON att.scanned_by = ec.coordinator_id
        LEFT JOIN (
            SELECT scanned_by, COUNT(*) as scan_count, MAX(scanned_at) as last_scan 
            FROM food_records 
            WHERE event_id = event_id_param AND meal_type = 'breakfast' 
            GROUP BY scanned_by
        ) food_bf ON food_bf.scanned_by = ec.coordinator_id
        LEFT JOIN (
            SELECT scanned_by, COUNT(*) as scan_count, MAX(scanned_at) as last_scan 
            FROM food_records 
            WHERE event_id = event_id_param AND meal_type = 'lunch' 
            GROUP BY scanned_by
        ) food_lu ON food_lu.scanned_by = ec.coordinator_id
        LEFT JOIN (
            SELECT scanned_by, COUNT(*) as scan_count, MAX(scanned_at) as last_scan 
            FROM food_records 
            WHERE event_id = event_id_param AND meal_type = 'dinner' 
            GROUP BY scanned_by
        ) food_dn ON food_dn.scanned_by = ec.coordinator_id
        WHERE ec.event_id = event_id_param
    ),
    detailed_history AS (
        SELECT 
            ar.id as scan_id,
            p.full_name as participant_name,
            p.email as participant_email,
            'attendance' as operation,
            c.full_name as coordinator_name,
            ar.scanned_at as timestamp,
            ar.scanned_by as coordinator_id
        FROM attendance_records ar
        JOIN profiles p ON p.id = ar.participant_id
        JOIN profiles c ON c.id = ar.scanned_by
        WHERE ar.event_id = event_id_param

        UNION ALL

        SELECT 
            fr.id as scan_id,
            p.full_name as participant_name,
            p.email as participant_email,
            fr.meal_type as operation,
            c.full_name as coordinator_name,
            fr.scanned_at as timestamp,
            fr.scanned_by as coordinator_id
        FROM food_records fr
        JOIN profiles p ON p.id = fr.participant_id
        JOIN profiles c ON c.id = fr.scanned_by
        WHERE fr.event_id = event_id_param
        
        ORDER BY timestamp DESC
    )
    SELECT jsonb_build_object(
        'coordinators', COALESCE((SELECT jsonb_agg(to_jsonb(coordinator_stats)) FROM coordinator_stats), '[]'::jsonb),
        'history', COALESCE((SELECT jsonb_agg(to_jsonb(detailed_history)) FROM detailed_history), '[]'::jsonb)
    ) INTO result;

    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_scan_history(UUID) TO authenticated;

-- 4. RPC: get_coordinator_scan_history
CREATE OR REPLACE FUNCTION get_coordinator_scan_history(event_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    is_assigned BOOLEAN;
    result JSONB;
BEGIN
    -- Verify coordinator is assigned to this event
    SELECT EXISTS (
        SELECT 1 FROM event_coordinators 
        WHERE event_id = event_id_param AND coordinator_id = auth.uid()
    ) INTO is_assigned;

    IF NOT is_assigned THEN
        RAISE EXCEPTION 'Access denied: Not assigned to this event';
    END IF;

    WITH detailed_history AS (
        SELECT 
            ar.id as scan_id,
            p.full_name as participant_name,
            'attendance' as operation,
            ar.scanned_at as timestamp
        FROM attendance_records ar
        JOIN profiles p ON p.id = ar.participant_id
        WHERE ar.event_id = event_id_param AND ar.scanned_by = auth.uid()

        UNION ALL

        SELECT 
            fr.id as scan_id,
            p.full_name as participant_name,
            fr.meal_type as operation,
            fr.scanned_at as timestamp
        FROM food_records fr
        JOIN profiles p ON p.id = fr.participant_id
        WHERE fr.event_id = event_id_param AND fr.scanned_by = auth.uid()
        
        ORDER BY timestamp DESC
    )
    SELECT COALESCE(jsonb_agg(to_jsonb(detailed_history)), '[]'::jsonb) INTO result FROM detailed_history;

    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_coordinator_scan_history(UUID) TO authenticated;
