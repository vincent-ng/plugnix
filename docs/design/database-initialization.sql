-- =====================================================================================
-- ==                                                                                 ==
-- ==                Web Plugin Framework - Database Initialization Script                ==
-- ==                                                                                 ==
-- =====================================================================================
--
-- This script contains all the necessary SQL to set up the database for the framework,
-- including helper functions, core permission system tables, and initial data.
--
-- Instructions:
-- 1. Navigate to the SQL Editor in your Supabase project.
-- 2. Copy and paste the entire content of this file.
-- 3. Run the script.
--

-- =====================================================================================
-- SECTION 1: CORE HELPER FUNCTIONS
-- =====================================================================================

-- Function to automatically update the `updated_at` timestamp on row modification.
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if the current user has a specific permission.
-- It reads the permission list from the user's JWT app_metadata.
CREATE OR REPLACE FUNCTION check_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  permissions_list JSONB;
  has_permission BOOLEAN;
BEGIN
  -- Get the permissions list from the current user's app_metadata
  permissions_list := (auth.jwt() -> 'app_metadata' -> 'permissions');

  -- Check if the permissions_list is a valid JSON array
  IF jsonb_typeof(permissions_list) != 'array' THEN
    RETURN FALSE;
  END IF;

  -- Check if the requested permission exists in the array
  SELECT EXISTS (
    SELECT 1
    FROM jsonb_array_elements_text(permissions_list) AS p
    WHERE p.value = permission_name
  )
  INTO has_permission;

  RETURN has_permission;
END;
$$ LANGUAGE plpgsql;


-- =====================================================================================
-- SECTION 2: PERMISSION SYSTEM TABLES
-- =====================================================================================

-- Table to store all available permissions in the system.
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON COLUMN permissions.name IS 'e.g., "db.posts.create", "ui.dashboard.view"';
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to permissions" ON permissions FOR SELECT USING (true);
CREATE TRIGGER on_permissions_update BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Table to store all roles.
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
COMMENT ON COLUMN roles.name IS 'e.g., "admin", "editor"';
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to roles" ON roles FOR SELECT USING (true);
CREATE TRIGGER on_roles_update BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Junction table for the many-to-many relationship between roles and permissions.
CREATE TABLE role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to role_permissions" ON role_permissions FOR SELECT USING (true);

-- Junction table for the many-to-many relationship between users and roles.
CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to read their own roles" ON user_roles FOR SELECT USING (auth.uid() = user_id);


-- =====================================================================================
-- SECTION 3: INITIAL SYSTEM DATA (ADMIN ROLE & PERMISSIONS)
-- =====================================================================================

-- Create the foundational 'admin' role.
INSERT INTO roles (name, description) VALUES ('admin', 'Super Administrator with all permissions');

-- Define the core permissions required to manage the permission system itself.
INSERT INTO permissions (name, description) VALUES
  ('system.rpc.invoke', 'Allow invoking system-level RPC functions'),
  ('db.permissions.select', 'Read all permissions'),
  ('db.permissions.insert', 'Create new permissions'),
  ('db.permissions.update', 'Update existing permissions'),
  ('db.permissions.delete', 'Delete permissions'),
  ('db.roles.select', 'Read all roles'),
  ('db.roles.insert', 'Create new roles'),
  ('db.roles.update', 'Update existing roles'),
  ('db.roles.delete', 'Delete roles'),
  ('db.role_permissions.select', 'Read role-permission assignments'),
  ('db.role_permissions.insert', 'Assign permissions to roles'),
  ('db.role_permissions.delete', 'Remove permissions from roles'),
  ('db.user_roles.select', 'Read user-role assignments'),
  ('db.user_roles.insert', 'Assign roles to users'),
  ('db.user_roles.delete', 'Remove roles from users');

-- Assign all the above permissions to the 'admin' role.
DO $$
DECLARE
  admin_role_id UUID;
  perm_id UUID;
BEGIN
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  FOR perm_id IN (SELECT id FROM permissions WHERE name LIKE 'db.%' OR name LIKE 'system.%')
  LOOP
    INSERT INTO role_permissions (role_id, permission_id) VALUES (admin_role_id, perm_id);
  END LOOP;
END $$;


-- =====================================================================================
-- SECTION 4: GRANULAR TABLE MANAGEMENT FUNCTIONS (RPC)
-- =====================================================================================

-- 4.1 `updated_at` timestamp management
CREATE OR REPLACE FUNCTION add_updated_at_trigger(p_table_name TEXT)
RETURNS VOID AS $$
BEGIN
  IF NOT check_permission('system.rpc.invoke') THEN RAISE EXCEPTION 'Permission denied'; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = p_table_name AND column_name = 'updated_at') THEN
    RAISE EXCEPTION 'Table "public.%" does not have an "updated_at" column.', p_table_name;
  END IF;
  EXECUTE format('CREATE TRIGGER on_%s_update BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION handle_updated_at();', p_table_name, p_table_name);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION remove_updated_at_trigger(p_table_name TEXT)
RETURNS VOID AS $$
BEGIN
  IF NOT check_permission('system.rpc.invoke') THEN RAISE EXCEPTION 'Permission denied'; END IF;
  EXECUTE format('DROP TRIGGER IF EXISTS on_%s_update ON public.%I;', p_table_name, p_table_name);
END;
$$ LANGUAGE plpgsql;

-- 4.2 Row-Level Security (RLS)
CREATE OR REPLACE FUNCTION enable_rls(p_table_name TEXT)
RETURNS VOID AS $$
BEGIN
  IF NOT check_permission('system.rpc.invoke') THEN RAISE EXCEPTION 'Permission denied'; END IF;
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', p_table_name);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION disable_rls(p_table_name TEXT)
RETURNS VOID AS $$
BEGIN
  IF NOT check_permission('system.rpc.invoke') THEN RAISE EXCEPTION 'Permission denied'; END IF;
  EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', p_table_name);
END;
$$ LANGUAGE plpgsql;

-- 4.3 Role-Based Access Control (RBAC) Policies
CREATE OR REPLACE FUNCTION add_rbac_policies(p_table_name TEXT)
RETURNS VOID AS $$
BEGIN
  IF NOT check_permission('system.rpc.invoke') THEN RAISE EXCEPTION 'Permission denied'; END IF;
  EXECUTE format('CREATE POLICY "Allow select based on permission" ON public.%I FOR SELECT USING (check_permission(format(''db.%s.select'', %L)));', p_table_name, p_table_name);
  EXECUTE format('CREATE POLICY "Allow insert based on permission" ON public.%I FOR INSERT WITH CHECK (check_permission(format(''db.%s.insert'', %L)));', p_table_name, p_table_name);
  EXECUTE format('CREATE POLICY "Allow update based on permission" ON public.%I FOR UPDATE USING (check_permission(format(''db.%s.update'', %L)));', p_table_name, p_table_name);
  EXECUTE format('CREATE POLICY "Allow delete based on permission" ON public.%I FOR DELETE USING (check_permission(format(''db.%s.delete'', %L)));', p_table_name, p_table_name);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION remove_rbac_policies(p_table_name TEXT)
RETURNS VOID AS $$
BEGIN
  IF NOT check_permission('system.rpc.invoke') THEN RAISE EXCEPTION 'Permission denied'; END IF;
  EXECUTE format('DROP POLICY IF EXISTS "Allow select based on permission" ON public.%I;', p_table_name);
  EXECUTE format('DROP POLICY IF EXISTS "Allow insert based on permission" ON public.%I;', p_table_name);
  EXECUTE format('DROP POLICY IF EXISTS "Allow update based on permission" ON public.%I;', p_table_name);
  EXECUTE format('DROP POLICY IF EXISTS "Allow delete based on permission" ON public.%I;', p_table_name);
END;
$$ LANGUAGE plpgsql;

-- 4.4 Owner Policy
CREATE OR REPLACE FUNCTION add_owner_policy(p_table_name TEXT)
RETURNS VOID AS $$
BEGIN
  IF NOT check_permission('system.rpc.invoke') THEN RAISE EXCEPTION 'Permission denied'; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = p_table_name AND column_name = 'user_id') THEN
    RAISE EXCEPTION 'Table "public.%" does not have a "user_id" column.', p_table_name;
  END IF;
  EXECUTE format('CREATE POLICY "Allow full access for owners" ON public.%I USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);', p_table_name);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION remove_owner_policy(p_table_name TEXT)
RETURNS VOID AS $$
BEGIN
  IF NOT check_permission('system.rpc.invoke') THEN RAISE EXCEPTION 'Permission denied'; END IF;
  EXECUTE format('DROP POLICY IF EXISTS "Allow full access for owners" ON public.%I;', p_table_name);
END;
$$ LANGUAGE plpgsql;

-- =====================================================================================
-- ==                                END OF SCRIPT                                    ==
-- =====================================================================================