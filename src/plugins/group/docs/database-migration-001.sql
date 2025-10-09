-- migration-001: refactor rpc for enhanced security and functionality

-- Drop existing functions to ensure a clean re-creation
DROP FUNCTION IF EXISTS is_group_member(UUID);
DROP FUNCTION IF EXISTS get_group_members(UUID);
DROP FUNCTION IF EXISTS add_member_by_email(UUID, TEXT, UUID);

-- Helper function to check if the current user is a member of a specific group.
-- This will be used as a security check in other functions.
CREATE OR REPLACE FUNCTION is_group_member(p_group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.group_users gu
        WHERE gu.group_id = p_group_id AND gu.user_id = auth.uid()
    );
$$;

-- Function to get members of a specific group.
-- It includes a security check to ensure the caller is a member of the group.
CREATE OR REPLACE FUNCTION get_group_members(p_group_id UUID)
RETURNS TABLE (
    group_id UUID,
    group_name TEXT,
    user_id UUID,
    user_email TEXT,
    user_avatar_url TEXT,
    user_raw_user_meta_data JSONB,
    role_id UUID,
    role_name TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Security Check: Only allow members of the group to see other members.
    IF NOT is_group_member(p_group_id) THEN
        RAISE EXCEPTION 'User is not a member of this group and cannot view its members.';
    END IF;

    RETURN QUERY
    SELECT
        gu.group_id,
        g.name AS group_name,
        gu.user_id,
        u.email::TEXT AS user_email,
        u.raw_user_meta_data->>'avatar_url' as user_avatar_url,
        u.raw_user_meta_data as user_raw_user_meta_data,
        gu.role_id,
        r.name as role_name,
        gu.created_at
    FROM
        public.group_users gu
    JOIN
        public.groups g ON gu.group_id = g.id
    JOIN
        auth.users u ON gu.user_id = u.id
    JOIN
        public.roles r ON gu.role_id = r.id
    WHERE
        gu.group_id = p_group_id;
END;
$$;

-- Function to add a user to a group by their email.
-- Includes security checks for permissions.
CREATE OR REPLACE FUNCTION add_member_by_email(p_group_id UUID, p_user_email TEXT, p_role_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Security Check: Ensure the current user has permission to add members.
    -- This can be based on a specific permission, role, or group ownership.
    -- Here, we'll reuse the is_group_member check, assuming only members can add others.
    -- You could replace this with a more specific permission check if needed.
    IF NOT is_group_member(p_group_id) THEN
        RAISE EXCEPTION 'User does not have permission to add members to this group.';
    END IF;

    -- Find the user_id from the provided email
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_user_email;

    -- If user not found, raise an error
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found.', p_user_email;
    END IF;

    -- Insert the new member into the group_users table
    INSERT INTO public.group_users (group_id, user_id, role_id)
    VALUES (p_group_id, v_user_id, p_role_id);
END;
$$;