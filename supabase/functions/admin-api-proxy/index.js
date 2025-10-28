// supabase/functions/admin-api-proxy/index.js

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
    const { operation, table, schema = 'public', match, data, columns = '*' } = await req.json()

    // Step 4: Check if the user has the system.rpc.invoke permission (required for all operations)
    const { data: hasInvokePermission, error: invokeError } = await supabaseAdmin.rpc('user_has_system_permission', {
      p_user_id: user.id,
      p_permission_name: 'system.rpc.invoke'
    })

    if (invokeError || !hasInvokePermission) {
      return createResponse({ error: 'db:systemRpcInvokeRequired' }, 403)
    }

    // Step 5: Check if the user has the specific permission for this operation
    const fullTableName = schema === 'public' ? table : `${schema}.${table}`
    const requiredPermission = `db.${fullTableName}.${operation}`
    const { data: hasPermission, error: permissionError } = await supabaseAdmin.rpc('user_has_system_permission', {
      p_user_id: user.id,
      p_permission_name: requiredPermission
    })
    if (permissionError || !hasPermission) {
      return createResponse({ error: 'db:permissionDenied', permission: requiredPermission }, 403)
    }

    // If both checks pass, the user is authorized. Proceed with the operation.

    // Step 6: Execute the database operation
    let query = supabaseAdmin.from(fullTableName)
    let result

    switch (operation) {
      case 'select':
        result = await query.select(columns).match(match || {})
        break
      case 'insert':
        if (!data) throw new Error('insert operation requires data')
        result = await query.insert(data).select()
        break
      case 'update':
        if (!data || !match) throw new Error('update operation requires data and match')
        result = await query.update(data).match(match).select()
        break
      case 'delete':
        if (!match) throw new Error('delete operation requires match')
        result = await query.delete().match(match)
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