-- Helper function to check if the current user is a member of a specific tenant.
-- This will be used as a security check in other functions.
CREATE OR REPLACE FUNCTION is_tenant_member(p_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.tenant_users tu
        WHERE tu.tenant_id = p_tenant_id AND tu.user_id = auth.uid()
    );
$$;

-- Function to get members of a specific tenant.
-- It includes a security check to ensure the caller is a member of the tenant.
CREATE OR REPLACE FUNCTION get_tenant_members(p_tenant_id UUID)
RETURNS TABLE (
    tenant_id UUID,
    tenant_name TEXT,
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
    -- Security Check: Only allow members of the tenant to see other members.
    IF NOT is_tenant_member(p_tenant_id) THEN
        RAISE EXCEPTION 'db.tenantMemberNotMember';
    END IF;

    RETURN QUERY
    SELECT
        tu.tenant_id,
        t.name AS tenant_name,
        tu.user_id,
        u.email::TEXT AS user_email,
        u.raw_user_meta_data->>'avatar_url' as user_avatar_url,
        u.raw_user_meta_data as user_raw_user_meta_data,
        tu.role_id,
        r.name as role_name,
        tu.created_at
    FROM
        public.tenant_users tu
    JOIN
        public.tenants t ON tu.tenant_id = t.id
    JOIN
        auth.users u ON tu.user_id = u.id
    JOIN
        public.roles r ON tu.role_id = r.id
    WHERE
        tu.tenant_id = p_tenant_id;
END;
$$;

-- Function to add a user to a tenant by their email.
-- Includes security checks for permissions.
CREATE OR REPLACE FUNCTION add_member_to_tenant_by_email(p_tenant_id UUID, p_user_email TEXT, p_role_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Security Check: Ensure the current user has permission to add members.
    -- This can be based on a specific permission, role, or tenant ownership.
    -- Here, we'll reuse the is_tenant_member check, assuming only members can add others.
    -- You could replace this with a more specific permission check if needed.
    IF NOT is_tenant_member(p_tenant_id) THEN
        RAISE EXCEPTION 'db.tenantMemberNoPermission';
    END IF;

    -- Find the user_id from the provided email
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_user_email;

    -- If user not found, raise an error
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'db.tenantMemberEmailNotFound';
    END IF;

    -- Insert the new member into the tenant_users table
    INSERT INTO public.tenant_users (tenant_id, user_id, role_id)
    VALUES (p_tenant_id, v_user_id, p_role_id);
END;
$$;

CREATE OR REPLACE FUNCTION create_role_with_permissions(
    p_tenant_id UUID,
    p_role_name TEXT,
    p_role_description TEXT,
    p_permission_ids UUID[]
)
RETURNS roles AS $$
DECLARE
    v_role roles;
    v_permission_id UUID;
BEGIN
    IF p_role_name IS NULL OR TRIM(p_role_name) = '' THEN
        RAISE EXCEPTION 'db.roleNameEmpty';
    END IF;

    -- 1. Create the new role
    INSERT INTO public.roles (tenant_id, name, description)
    VALUES (p_tenant_id, p_role_name, p_role_description)
    RETURNING * INTO v_role;

    -- 2. Grant permissions to the new role
    IF array_length(p_permission_ids, 1) > 0 THEN
        FOREACH v_permission_id IN ARRAY p_permission_ids
        LOOP
        -- Check if the user has permission to grant this permission
        IF can_grant_permission(v_role.id, v_permission_id) THEN
            INSERT INTO public.role_permissions (role_id, permission_id)
            VALUES (v_role.id, v_permission_id);
        ELSE
            RAISE EXCEPTION 'db.rolePermissionNoPermission';
        END IF;
        END LOOP;
    END IF;

    RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;