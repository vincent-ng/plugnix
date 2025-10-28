// supabase/functions/admin-api-user/index.js

import { createClient } from 'jsr:@supabase/supabase-js@2'

// Helper function to create a response with CORS headers
function createResponse(data, status = 200) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  }

  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders,
  })
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createResponse({ error: null })
  }

  try {
    // Step 1: Initialize Supabase Admin Client for administrative tasks
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { persistSession: false } }
    )

    // Step 2: Authenticate the user from the request header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return createResponse({ error: 'db:authenticationRequired' }, 401)
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))

    if (userError || !user) {
      return createResponse({ error: 'db:invalidTokenOrUser' }, 401)
    }

    // Step 3: Get the request payload
    const { operation, userId, data, options } = await req.json()

    // Step 4: Check if the user has the system.rpc.invoke permission (required for all operations)
    const { data: hasInvokePermission, error: invokeError } = await supabaseAdmin.rpc('user_has_system_permission', {
      p_user_id: user.id,
      p_permission_name: 'system.rpc.invoke'
    })

    if (invokeError || !hasInvokePermission) {
      return createResponse({ error: 'db:systemRpcInvokeRequired' }, 403)
    }

    // Step 5: Check if the user has the specific permission for user operations
    const requiredPermission = `db.auth.users.${operation}`
    const { data: hasUserPermission, error: userPermError } = await supabaseAdmin.rpc('user_has_system_permission', {
      p_user_id: user.id,
      p_permission_name: requiredPermission
    })

    if (userPermError || !hasUserPermission) {
      return createResponse({ error: 'db:permissionDenied', permission: requiredPermission }, 403)
    }

    // Step 6: Execute the user operation
    let result

    switch (operation) {
      case 'select':
        if (userId) {
          result = await supabaseAdmin.auth.admin.getUserById(userId)
        } else {
          result = await supabaseAdmin.auth.admin.listUsers(options || {})
        }
        break
      case 'insert':
        if (!data) throw new Error('insert operation requires data')
        result = await supabaseAdmin.auth.admin.createUser(data)
        break
      case 'update':
        if (!userId || !data) throw new Error('update operation requires userId and data')
        result = await supabaseAdmin.auth.admin.updateUserById(userId, data)
        break
      case 'delete':
        if (!userId) throw new Error('delete operation requires userId')
        result = await supabaseAdmin.auth.admin.deleteUser(userId)
        break
      default:
        return createResponse({ error: 'db:invalidOperation', operation }, 400)
    }

    if (result.error) {
      throw result.error
    }

    // Step 7: Return the successful result
    // 直接返回Supabase的结果，不额外包装
    return createResponse(result.data)

  } catch (error) {
    return createResponse({ error: 'db:internalDatabaseError', message: error.message }, 500)
  }
})