import { supabase } from '@/framework/lib/supabase';

export const createGroup = async (name, description) => {
  const { data, error } = await supabase.rpc('create_group', {
    p_group_name: name,
    p_group_description: description,
  });

  if (error) {
    console.error('Error creating group:', error);
    throw error;
  }

  return data;
};