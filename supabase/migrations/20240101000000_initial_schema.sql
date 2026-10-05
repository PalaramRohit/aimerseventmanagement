-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    role TEXT CHECK (role IN ('admin', 'coordinator', 'participant')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- 2. events
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    venue TEXT,
    max_participants INTEGER CHECK (max_participants >= 0),
    registration_open BOOLEAN DEFAULT false,
    attendance_enabled BOOLEAN DEFAULT false,
    breakfast_enabled BOOLEAN DEFAULT false,
    lunch_enabled BOOLEAN DEFAULT false,
    dinner_enabled BOOLEAN DEFAULT false,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT events_date_check CHECK (end_date >= start_date)
);
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- 3. registration_allowlist
CREATE TABLE registration_allowlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (event_id, email)
);
ALTER TABLE registration_allowlist ENABLE ROW LEVEL SECURITY;

-- 4. event_participants
CREATE TABLE event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    matrix_token TEXT UNIQUE NOT NULL,
    status TEXT CHECK (status IN ('registered', 'cancelled')) DEFAULT 'registered',
    registered_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (event_id, participant_id)
);
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- 5. event_coordinators
CREATE TABLE event_coordinators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    coordinator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (event_id, coordinator_id)
);
ALTER TABLE event_coordinators ENABLE ROW LEVEL SECURITY;

-- 6. attendance_records
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    scanned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    scanned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (event_id, participant_id)
);
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- 7. food_records
CREATE TABLE food_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')) NOT NULL,
    scanned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    scanned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (event_id, participant_id, meal_type)
);
ALTER TABLE food_records ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_allowlist_event_id ON registration_allowlist(event_id);
CREATE INDEX idx_allowlist_email ON registration_allowlist(email);
CREATE INDEX idx_ep_matrix_token ON event_participants(matrix_token);
CREATE INDEX idx_ec_coordinator_id ON event_coordinators(coordinator_id);
CREATE INDEX idx_ar_event_id ON attendance_records(event_id);
CREATE INDEX idx_fr_event_id ON food_records(event_id);

-- RLS Baseline Policies (Minimal/Safe: Admin Full Access, Default Deny)
-- All tables have RLS enabled and default to denying all requests.
-- Complex per-role logic is deferred to Phase 3.
