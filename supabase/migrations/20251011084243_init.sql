-- =====================================================================================
-- ==                                                                                 ==
-- ==                Web Plugin Framework - Database Initialization Script            ==
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

-- Function to get the well-known ID of the 'System' group.
CREATE OR REPLACE FUNCTION get_system_group_id()
RETURNS UUID AS $$
BEGIN
  RETURN '00000000-0000-0000-0000-000000000001';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to automatically update the `updated_at` timestamp on row modification.
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =====================================================================================
-- SECTION 2: CORE PERMISSION FUNCTIONS
-- =====================================================================================

-- Function to check if the current user has a system-level permission.
-- It checks if the user has the permission via the dedicated 'System' group.
CREATE OR REPLACE FUNCTION check_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Delegate the check to the group permission function for the System group.
  -- The `with_system_fallback=false` argument prevents it from recursively checking
  -- system permissions again, thus avoiding an infinite loop.
  RETURN check_group_permission(get_system_group_id(), permission_name, with_system_fallback := false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if the current user has a specific permission for a resource,
-- either via group membership or a system-level permission (as a fallback).
-- This is the primary function for RLS policies.
CREATE OR REPLACE FUNCTION check_group_permission(p_group_id UUID, p_permission_name TEXT, with_system_fallback BOOLEAN DEFAULT true)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN;
BEGIN
  -- 1. Check if the user has the permission directly within the specified group.
  -- This single query joins group membership, roles, and permissions.
  SELECT EXISTS (
    SELECT 1
    FROM public.group_users gu
    JOIN public.role_permissions rp ON gu.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE gu.user_id = auth.uid()
      AND gu.group_id = p_group_id
      AND p.name = p_permission_name
  ) INTO v_has_permission;

  -- 2. If permission is found in the group, return true immediately.
  IF v_has_permission THEN
    RETURN TRUE;
  END IF;

  -- 3. If no permission was found in the group, and if fallback is enabled,
  --    check for a system-level permission as an override.
  IF with_system_fallback THEN
    RETURN check_permission(p_permission_name);
  END IF;

  -- 4. If no fallback is checked, or if the system check fails, deny permission.
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================================================
-- SECTION 3: RLS/POLICY HELPER FUNCTIONS
-- =====================================================================================

-- Unified helper function to create a Row-Level Security (RLS) policy.
-- It automatically handles the distinction between INSERT (WITH CHECK) and other actions (USING).
-- If p_expression is not provided, it defaults to a standard check based on table and action name.
CREATE OR REPLACE FUNCTION create_rls_policy(p_table text, p_action text, p_expression text DEFAULT NULL, p_group_id_column text DEFAULT 'group_id')
RETURNS void AS $$
DECLARE
    policy_name text;
    command text;
    final_expression text;
    policy_template text;
    v_action_lower text := LOWER(p_action);
BEGIN
    policy_name := format('"Allow %s on %s"', p_action, p_table);

    -- Generate a default expression if not provided
    IF p_expression IS NULL THEN
        -- Use the specified group_id column, defaulting to 'group_id'.
        -- %I is used for safely quoting identifiers (like column names).
        -- The ''::text'' cast is crucial to resolve the function signature in dynamic SQL.
        final_expression := format('check_group_permission(%I, ''db.%s.%s''::text)', p_group_id_column, p_table, v_action_lower);
    ELSE
        final_expression := p_expression;
    END IF;

    -- Determine the policy clause based on the action
  -- INSERT policies use `WITH CHECK`, while others use `USING`.
  IF v_action_lower = 'insert' THEN
    policy_template := 'CREATE POLICY "Allow %s on %s" ON public.%I FOR %s WITH CHECK (%s);';
  ELSE
    policy_template := 'CREATE POLICY "Allow %s on %s" ON public.%I FOR %s USING (%s);';
  END IF;

  -- Execute the dynamic SQL to create the policy.
  EXECUTE format(policy_template, p_action, p_table, p_table, p_action, final_expression);
END;
$$ LANGUAGE plpgsql;

-- Helper function to drop a previously created RLS policy.
CREATE OR REPLACE FUNCTION drop_rls_policy(p_table TEXT, p_action TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format(
    'DROP POLICY IF EXISTS "Allow %s on %s" ON public.%I;',
    p_action, p_table, p_table
  );
END;
$$ LANGUAGE plpgsql;


-- =====================================================================================
-- SECTION 4: UNIFIED PERMISSION MODEL (TABLES)
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

-- Groups are the core of the new permission system.
-- Each group can have associated users and permissions.
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
-- Policies for `groups` table
SELECT create_rls_policy('groups', 'SELECT', p_group_id_column := 'id');
SELECT create_rls_policy('groups', 'INSERT', p_group_id_column := 'id');
SELECT create_rls_policy('groups', 'UPDATE', p_group_id_column := 'id');
SELECT create_rls_policy('groups', 'DELETE', p_group_id_column := 'id');
CREATE TRIGGER on_groups_update BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Roles are defined within each group.
-- A group owner can create, modify, and delete roles within their group.
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (group_id, name)
);
COMMENT ON COLUMN roles.group_id IS 'The group this role belongs to. If NULL, this indicates it is a global role template.';
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
-- Policies for `roles` table
SELECT create_rls_policy('roles', 'SELECT', '(group_id IS NULL) OR (check_group_permission(group_id, ''db.roles.select''))');
SELECT create_rls_policy('roles', 'INSERT');
SELECT create_rls_policy('roles', 'UPDATE');
SELECT create_rls_policy('roles', 'DELETE');
CREATE TRIGGER on_roles_update BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Junction table for the many-to-many relationship between roles and permissions.
-- Defines which permissions are granted to a specific role.
CREATE TABLE role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
-- Policies for `role_permissions` table
SELECT create_rls_policy('role_permissions', 'SELECT', '(SELECT check_group_permission(r.group_id, ''db.role_permissions.select'') FROM roles r WHERE r.id = role_id)');
SELECT create_rls_policy('role_permissions', 'INSERT', '(SELECT check_group_permission(r.group_id, ''db.role_permissions.insert'') FROM roles r WHERE r.id = role_id)');
SELECT create_rls_policy('role_permissions', 'DELETE', '(SELECT check_group_permission(r.group_id, ''db.role_permissions.delete'') FROM roles r WHERE r.id = role_id)');

-- Junction table for the many-to-many relationship between users and groups, assigning a role.
-- Defines user membership and their role within a group.
CREATE TABLE group_users (
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);
COMMENT ON TABLE group_users IS 'Assigns a user to a group with a specific role.';
ALTER TABLE group_users ENABLE ROW LEVEL SECURITY;
-- Policies for `group_users` table
SELECT create_rls_policy('group_users', 'SELECT');
SELECT create_rls_policy('group_users', 'INSERT');
SELECT create_rls_policy('group_users', 'UPDATE');
SELECT create_rls_policy('group_users', 'DELETE');


-- =====================================================================================
-- SECTION 5: GROUP MANAGEMENT FUNCTIONS (RPC)
-- =====================================================================================

-- Creates a new group and sets the calling user as its owner.
-- This function links the creator to the 'Owner' template role for the new group.
-- It does not copy the role or its permissions, ensuring efficiency.
CREATE OR REPLACE FUNCTION create_group(p_group_name TEXT, p_group_description TEXT)
RETURNS UUID AS $$
DECLARE
  new_group_id UUID;
  owner_role_id UUID;
BEGIN
  -- 1. Find the template 'Owner' role.
  SELECT id INTO owner_role_id
  FROM public.roles
  WHERE name = 'Owner' AND group_id IS NULL;

  IF owner_role_id IS NULL THEN
    RAISE EXCEPTION 'Template role "Owner" not found. System may not be initialized correctly.';
  END IF;

  -- 2. Create the new group.
  INSERT INTO public.groups (name, description)
  VALUES (p_group_name, p_group_description)
  RETURNING id INTO new_group_id;

  -- 3. Set the creator as the 'Owner' in the group_users table.
  INSERT INTO public.group_users (group_id, user_id, role_id)
  VALUES (new_group_id, auth.uid(), owner_role_id);

  -- 4. Return the new group's ID.
  RETURN new_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Promotes a user to a system administrator.
-- If p_user_id is NULL, it will promote the first user found in the system.
CREATE OR REPLACE FUNCTION promote_user_to_admin(p_user_id UUID DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
  target_user_id UUID;
  admin_role_id UUID;
  system_group_id UUID := get_system_group_id();
BEGIN
  -- 1. Determine the target user ID.
  IF p_user_id IS NULL THEN
    SELECT id INTO target_user_id FROM auth.users ORDER BY created_at LIMIT 1;
    IF target_user_id IS NULL THEN
      RAISE EXCEPTION 'No users found in the system.';
    END IF;
  ELSE
    target_user_id := p_user_id;
  END IF;

  -- 2. Get the Admin role ID from the System group.
  -- It's the first role created for the system group.
  SELECT id INTO admin_role_id
  FROM public.roles
  WHERE group_id = system_group_id
  ORDER BY created_at
  LIMIT 1;

  IF admin_role_id IS NULL THEN
    RAISE EXCEPTION 'Admin role not found for the System group. Initialization might be incomplete.';
  END IF;

  -- 3. Add the user to the System group with the Admin role.
  -- Use ON CONFLICT to avoid errors if the user is already in the group.
  INSERT INTO public.group_users (group_id, user_id, role_id)
  VALUES (system_group_id, target_user_id, admin_role_id)
  ON CONFLICT (group_id, user_id) DO UPDATE SET role_id = admin_role_id;

  RAISE NOTICE 'User % has been promoted to system administrator.', target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================================================
-- SECTION 6: GRANULAR TABLE MANAGEMENT FUNCTIONS (RPC)
-- =====================================================================================

-- 6.1 `updated_at` timestamp management
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

-- 6.2 Row-Level Security (RLS) and Group Policies
CREATE OR REPLACE FUNCTION setup_rbac_rls(p_table_name TEXT)
RETURNS VOID AS $$
BEGIN
    -- 1. Check permission
    IF NOT check_permission('system.rpc.invoke') THEN
        RAISE EXCEPTION 'Permission denied';
    END IF;

    -- 2. Ensure the table has a `group_id` column
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = p_table_name
          AND column_name = 'group_id'
    ) THEN
        RAISE EXCEPTION 'Table "public.%" must have a "group_id" column to use group-based policies.', p_table_name;
    END IF;

    -- 3. Enable RLS
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', p_table_name);

    -- 4. Add RBAC policies using the helper functions
    PERFORM create_rls_policy(p_table_name, 'SELECT');
    PERFORM create_rls_policy(p_table_name, 'INSERT');
    PERFORM create_rls_policy(p_table_name, 'UPDATE');
    PERFORM create_rls_policy(p_table_name, 'DELETE');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION teardown_rbac_rls(p_table_name TEXT)
RETURNS VOID AS $$
BEGIN
    -- 1. Check permission
    IF NOT check_permission('system.rpc.invoke') THEN
        RAISE EXCEPTION 'Permission denied';
    END IF;

    -- 2. Remove RBAC policies using the helper function
    PERFORM drop_rls_policy(p_table_name, 'SELECT');
    PERFORM drop_rls_policy(p_table_name, 'INSERT');
    PERFORM drop_rls_policy(p_table_name, 'UPDATE');
    PERFORM drop_rls_policy(p_table_name, 'DELETE');

    -- 3. Disable RLS
    EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', p_table_name);
END;
$$ LANGUAGE plpgsql;


-- =====================================================================================
-- SECTION 7: INITIAL SYSTEM DATA & TEMPLATE ROLES
-- =====================================================================================

-- Create the foundational 'System' group. This group is for managing admins and system-level permissions.
INSERT INTO public.groups (id, name, description) VALUES (get_system_group_id(), 'System', 'Group for system-level administrators and permissions.');

-- Define the core permissions required for the system.
-- Some are for admins (via the System group), others are for role-based assignment within user groups.
INSERT INTO permissions (name, description) VALUES
  -- System-level permissions for admins
  ('system.rpc.invoke', 'permissions.system.rpc.invoke'),
  ('db.permissions.select', 'permissions.db.permissions.select'),
  ('db.permissions.insert', 'permissions.db.permissions.insert'),
  ('db.permissions.update', 'permissions.db.permissions.update'),
  ('db.permissions.delete', 'permissions.db.permissions.delete'),

  -- Group management permissions (can be assigned to roles)
  ('db.groups.select', 'permissions.db.groups.select'),
  ('db.groups.update', 'permissions.db.groups.update'),
  ('db.groups.delete', 'permissions.db.groups.delete'),

  -- Role management permissions (can be assigned to roles)
  ('db.roles.select', 'permissions.db.roles.select'),
  ('db.roles.insert', 'permissions.db.roles.insert'),
  ('db.roles.update', 'permissions.db.roles.update'),
  ('db.roles.delete', 'permissions.db.roles.delete'),

  -- Role-permission assignment permissions (can be assigned to roles)
  ('db.role_permissions.select', 'permissions.db.role_permissions.select'),
  ('db.role_permissions.insert', 'permissions.db.role_permissions.insert'),
  ('db.role_permissions.delete', 'permissions.db.role_permissions.delete'),

  -- Group membership permissions (can be assigned to roles)
  ('db.group_users.select', 'permissions.db.group_users.select'),
  ('db.group_users.insert', 'permissions.db.group_users.insert'),
  ('db.group_users.update', 'permissions.db.group_users.update'),
  ('db.group_users.delete', 'permissions.db.group_users.delete');

-- Insert template roles (group_id is NULL). These are read-only templates for user-created groups.
INSERT INTO public.roles (name, description) VALUES
('Owner', 'Has all permissions for a group.'),
('Member', 'Can view content and participate in a group.');

-- Create the 'Admin' role within the 'System' group.
INSERT INTO public.roles (group_id, name, description)
VALUES (get_system_group_id(), 'Admin', 'System Administrator with full permissions.');

-- Assign all existing permissions to the 'Admin' role in the 'System' group.
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM public.roles WHERE group_id = get_system_group_id()),
  p.id
FROM public.permissions p;

-- Assign permissions to the 'Owner' template role.
-- The Owner gets all permissions related to managing their group.
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM public.roles WHERE name = 'Owner' AND group_id IS NULL),
  p.id
FROM public.permissions p
WHERE p.name LIKE 'db.groups.%'
   OR p.name LIKE 'db.roles.%'
   OR p.name LIKE 'db.role_permissions.%'
   OR p.name LIKE 'db.group_users.%';

-- Assign permissions to the 'Member' template role.
-- Members can only see basic information about the group.
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM public.roles WHERE name = 'Member' AND group_id IS NULL),
  p.id
FROM public.permissions p
WHERE p.name = 'db.groups.select';


-- =====================================================================================
-- SECTION 8: FRAMEWORK TEARDOWN FUNCTION (FOR DEVELOPMENT/DEBUGGING)
-- =====================================================================================
--
-- This function drops all tables, functions, and other resources created by this script.
-- It's useful for a clean re-run during development.
--
CREATE OR REPLACE FUNCTION teardown_framework()
RETURNS VOID AS $$
BEGIN
  -- 1. Drop tables. The CASCADE option will also remove policies, triggers, and constraints.
  DROP TABLE IF EXISTS public.group_users CASCADE;
  DROP TABLE IF EXISTS public.role_permissions CASCADE;
  DROP TABLE IF EXISTS public.roles CASCADE;
  DROP TABLE IF EXISTS public.groups CASCADE;
  DROP TABLE IF EXISTS public.permissions CASCADE;

  -- 2. Drop all functions created by this script.
  -- Note: We must specify the function signature (argument types) for a unique match.
  DROP FUNCTION IF EXISTS public.handle_updated_at();
  DROP FUNCTION IF EXISTS public.create_rls_policy(text, text, text, text);
  DROP FUNCTION IF EXISTS public.drop_rls_policy(text, text);
  DROP FUNCTION IF EXISTS public.check_permission(text);
  DROP FUNCTION IF EXISTS public.check_group_permission(uuid, text, boolean);
  DROP FUNCTION IF EXISTS public.create_group(text);
  DROP FUNCTION IF EXISTS public.promote_user_to_admin(uuid);
  DROP FUNCTION IF EXISTS public.add_updated_at_trigger(text);
  DROP FUNCTION IF EXISTS public.remove_updated_at_trigger(text);
  DROP FUNCTION IF EXISTS public.setup_rbac_rls(text);
  DROP FUNCTION IF EXISTS public.teardown_rbac_rls(text);

  RAISE NOTICE 'Framework resources have been torn down.';
END;
$$ LANGUAGE plpgsql;

-- To run the teardown, uncomment the following line and execute it in your SQL editor:
-- SELECT teardown_framework();


-- =====================================================================================
-- ==                                END OF SCRIPT                                    ==
-- =====================================================================================
