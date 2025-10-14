import { supabase } from '@/framework/lib/supabase';

export const createTenant = async (name, description) => {
  const { data, error } = await supabase.rpc('create_tenant', {
    p_tenant_name: name,
    p_tenant_description: description,
  });

  if (error) {
    console.error('Error creating tenant:', error);
    throw error;
  }

  return data;
};