import { supabase } from '@/lib/supabaseClient';
import { UserRole } from '@/app/auth/types';

const getClient = () => {
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
};

export const rolesRepository = {
  async getRole(userId: string): Promise<UserRole | null> {
    const client = getClient();
    const { data, error } = await client
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return (data?.role as UserRole | undefined) ?? null;
  },
};
