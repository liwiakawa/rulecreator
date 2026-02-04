import { supabase } from '@/lib/supabaseClient';
import { InviteRecord, UserRole } from '@/app/auth/types';

const getClient = () => {
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
};

export const invitesRepository = {
  async createInvite(email: string, role: UserRole): Promise<InviteRecord> {
    const client = getClient();
    const { data, error } = await client
      .from('invites')
      .insert({ email, role })
      .select('id, email, role, token, invited_by, created_at, used_at, revoked_at')
      .single();
    if (error) throw error;
    return data as InviteRecord;
  },
  async validateInvite(token: string, email: string): Promise<boolean> {
    const client = getClient();
    const { data, error } = await client.rpc('validate_invite', { p_token: token, p_email: email });
    if (error) throw error;
    return Boolean(data);
  },
  async acceptInvite(token: string): Promise<UserRole> {
    const client = getClient();
    const { data, error } = await client.rpc('accept_invite', { p_token: token });
    if (error) throw error;
    return data as UserRole;
  },
  async sendInviteEmail(email: string, token: string, role: UserRole): Promise<boolean> {
    const client = getClient();
    try {
      const { data, error } = await client.functions.invoke('send-invite', {
        body: { email, token, role },
      });
      if (error) throw error;
      return Boolean(data?.sent);
    } catch (_err) {
      return false;
    }
  },
};
