import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthentication } from '@/framework/contexts/AuthenticationContext';
import { useTenant } from '@/framework/contexts/TenantContext';
import { Button } from '@/framework/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/framework/components/ui/card';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import {
  test_is_tenant_member_unauthorized,
  test_is_tenant_member,
  test_get_tenant_members,
  test_add_member_to_tenant_by_email,
  test_add_owner_to_tenant_by_email,
  test_add_member_to_tenant_by_email_non_existing_user,
  test_create_role_with_permissions_empty_role_name,
  test_create_tenant,
  test_create_tenant_empty_name,
  test_get_tenant_by_id,
  test_update_tenant,
  test_delete_tenant,
  test_create_role,
  test_get_role_by_id,
  test_update_role,
  test_delete_role,
  test_remove_member_from_tenant,
  test_update_member_role,
  test_assign_permission_to_role,
  test_revoke_permission_from_role,
  test_create_duplicate_tenant,
  test_create_duplicate_role,
} from './test-cases';

const TestDbAutomation = () => {
  const { t } = useTranslation();
  const { user } = useAuthentication();
  const { currentTenant } = useTenant();
  const [testResults, setTestResults] = useState([]);
  const [running, setRunning] = useState(false);
  const createdTenantId = useRef(null);
  const createdRoleId = useRef(null);
  const updateTestRoleId = useRef(null);
  const permissionTestRoleId = useRef(null);
  const testPermissionName = 'db.tenants.select';

  const updateTestResult = useCallback((name, status, details = '') => {
    setTestResults(prev =>
      prev.map(result => (result.name === name ? { ...result, status, details } : result))
    );
  }, []);

  const tests = useMemo(() => [
    // Tenant tests
    {
      name: 'create_tenant_with_description',
      test: async () => {
        const tenantName = `Test Tenant ${new Date().getTime()}`;
        const { tenantId, message } = await test_create_tenant(tenantName, 'Test Tenant Description');
        createdTenantId.current = tenantId;
        return message;
      },
    },
    {
      name: 'create_tenant_without_description',
      test: async () => {
        const tenantName = `Test Tenant ${new Date().getTime()}`;
        const { tenantId, message } = await test_create_tenant(tenantName);
        // We don't need to store this tenantId since we are just testing creation
        await test_delete_tenant(tenantId); // Clean up this tenant right away
        return message;
      },
    },
    { name: 'create_tenant_empty_name', test: test_create_tenant_empty_name },
    { name: 'get_tenant_by_id', test: () => test_get_tenant_by_id(createdTenantId.current) },
    { name: 'update_tenant', test: () => test_update_tenant(createdTenantId.current) },

    // Role tests
    {
      name: 'create_role',
      test: async () => {
        const { message, roleId } = await test_create_role(currentTenant.id);
        createdRoleId.current = roleId;
        return message;
      },
    },
    { name: 'get_role_by_id', test: () => test_get_role_by_id(createdRoleId.current) },
    { name: 'update_role', test: () => test_update_role(createdRoleId.current) },

    // Permission tests
    {
      name: 'create_role_for_permission_test',
      test: async () => {
        const { message, roleId } = await test_create_role(currentTenant.id);
        permissionTestRoleId.current = roleId;
        return message;
      },
    },
    {
      name: 'assign_permission_to_role',
      test: () => test_assign_permission_to_role(permissionTestRoleId.current, testPermissionName),
    },
    {
      name: 'revoke_permission_from_role',
      test: () => test_revoke_permission_from_role(permissionTestRoleId.current, testPermissionName),
    },

    // Member tests
    {
      name: 'create_role_for_member_update_test',
      test: async () => {
        const { message, roleId } = await test_create_role(currentTenant.id);
        updateTestRoleId.current = roleId;
        return message;
      },
    },
    {
      name: 'add_owner_as_member_to_tenant',
      test: () => test_add_owner_to_tenant_by_email(currentTenant.id, user.email, createdRoleId.current),
    },
    {
      name: 'update_member_role',
      test: () => test_update_member_role(currentTenant.id, user.email, updateTestRoleId.current),
    },
    {
      name: 'remove_member_from_tenant',
      test: () => test_remove_member_from_tenant(currentTenant.id, user.email),
    },

    // Authorization and edge cases
    { name: 'is_tenant_member_unauthorized', test: test_is_tenant_member_unauthorized },
    { name: 'is_tenant_member', test: () => test_is_tenant_member(currentTenant.id) },
    { name: 'get_tenant_members', test: () => test_get_tenant_members(currentTenant.id) },
    {
      name: 'add_member_non_existing_user',
      test: () => test_add_member_to_tenant_by_email_non_existing_user(currentTenant.id, createdRoleId.current),
    },
    {
      name: 'create_role_empty_name',
      test: () => test_create_role_with_permissions_empty_role_name(currentTenant.id),
    },
    { name: 'create_duplicate_tenant', test: test_create_duplicate_tenant },
    { name: 'create_duplicate_role', test: () => test_create_duplicate_role(currentTenant.id) },

    // Cleanup tests
    { name: 'cleanup_created_tenant', test: () => test_delete_tenant(createdTenantId.current) },
    { name: 'cleanup_created_role', test: () => test_delete_role(createdRoleId.current) },
    { name: 'cleanup_update_test_role', test: () => test_delete_role(updateTestRoleId.current) },
    { name: 'cleanup_permission_test_role', test: () => test_delete_role(permissionTestRoleId.current) },
  ], [currentTenant, user]);

  const runTest = useCallback(async (name, testFn) => {
    try {
      console.log(`Running test: ${name}`);
      const result = await testFn();
      updateTestResult(name, 'success', typeof result === 'string' ? result : JSON.stringify(result));
    } catch (error) {
      updateTestResult(name, 'error', t(error.message));
    }
  }, [updateTestResult, t]);

  const retryTest = useCallback(async (testName) => {
    const testToRetry = tests.find(t => t.name === testName);
    if (testToRetry) {
      updateTestResult(testName, 'running');
      await runTest(testName, testToRetry.test);
    }
  }, [tests, updateTestResult, runTest]);

  const runTests = useCallback(async () => {
    setRunning(true);

    setTestResults(tests.map(({ name }) => ({ name, status: 'running', details: '' })));

    console.log('Running tests for tenant:', user, currentTenant);
    if (!user || !currentTenant) {
      toast.error('You must be logged in and have a tenant selected to run the tests.');
      setTestResults(
        tests.map(({ name }) => ({
          name,
          status: 'error',
          details: 'User not logged in or no tenant selected',
        }))
      );
      setRunning(false);
      return;
    }

    for (const { name, test } of tests) {
      await runTest(name, test);
    }

    setRunning(false);
    toast.success('All tests completed!');
  }, [user, currentTenant, tests, runTest]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Automated Database Function Tests</h1>
        <Button onClick={runTests} disabled={running}>
          {running ? 'Running Tests...' : 'Rerun Tests'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="font-semibold">{result.name}</div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${result.status === 'success' ? 'bg-green-200 text-green-800' : result.status === 'error' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
                    {result.status}
                  </span>
                  {result.status === 'error' && (
                    <Button variant="ghost" size="icon" onClick={() => retryTest(result.name)}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                  <span className="text-sm text-gray-600">{result.details}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestDbAutomation;