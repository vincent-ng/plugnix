```typescript
// supabase/functions/admin-api-proxy/index.ts

import { createClient } from 'jsr:@supabase/supabase-js@2'

// Define the structure of the incoming request from the client
type Operation = 'select' | 'insert' | 'update' | 'delete'
interface AdminApiRequest {
  operation: Operation
  table: string
  match?: Record<string, any>
  data?: Record<string, any> | Record<string, any>[]
  columns?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*', // Or your specific domain for better security
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // Step 1: Initialize Supabase Admin Client for administrative tasks
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    )

    // Step 2: Authenticate the user from the request header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authentication required.' }), { status: 401 })
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token or user not found.' }), { status: 401 })
    }

    // Step 3: Get the request payload
    const { operation, table, match, data, columns = '*' }: AdminApiRequest = await req.json()

    // Step 4: Construct the required permission string
    const requiredPermission = `db.${table}.${operation}`;

    // Step 5: Check if the user has the required permission
    // This is the new, critical RBAC check.
    const { data: userPermissions, error: permissionError } = await supabaseAdmin
      .from('user_roles')
      .select('roles(role_permissions(permissions(name)))')
      .eq('user_id', user.id);

    if (permissionError) {
      console.error('Error fetching user permissions:', permissionError);
      return new Response(JSON.stringify({ error: 'Failed to verify permissions.' }), { status: 500 });
    }

    const hasPermission = userPermissions
      .flatMap(ur => ur.roles.flatMap(r => r.role_permissions))
      .some(p => p.permissions.name === requiredPermission);

    if (!hasPermission) {
      return new Response(JSON.stringify({ error: 'Permission denied.' }), { status: 403 });
    }

    // If the check passes, the user is authorized. Proceed with the operation.

    // Step 6: Execute the database operation
    let query = supabaseAdmin.from(table)
    let result

    switch (operation) {
      case 'select':
        result = await query.select(columns).match(match || {})
        break
      case 'insert':
        if (!data) throw new Error('Insert operation requires "data".')
        result = await query.insert(data).select()
        break
      case 'update':
        if (!data || !match) throw new Error('Update requires "data" and "match".')
        result = await query.update(data).match(match).select()
        break
      case 'delete':
        if (!match) throw new Error('Delete requires a "match" condition.')
        result = await query.delete().match(match)
        break
      default:
        throw new Error('Invalid operation specified.')
    }

    if (result.error) {
      console.error('Supabase Query Error:', result.error)
      return new Response(JSON.stringify({ error: 'An internal database error occurred.' }), { status: 500 })
    }

    // Step 7: Return the successful result
    return new Response(JSON.stringify(result.data), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 400,
    })
  }
})
```