import { supabase } from '@/lib/supabaseClient';
import { AuthError, AuthOtpType, Session } from '@supabase/supabase-js';

const getClient = () => {
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
};

export const authRepository = {
  async getSession(): Promise<Session | null> {
    const client = getClient();
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data.session;
  },
  onAuthStateChange(callback: (session: Session | null) => void) {
    const client = getClient();
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
    return data.subscription;
  },
  async signInWithOtp(email: string, shouldCreateUser: boolean): Promise<AuthError | null> {
    const client = getClient();
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { shouldCreateUser },
    });
    return error ?? null;
  },
  async verifyOtp(email: string, token: string, type: AuthOtpType = 'email'): Promise<AuthError | null> {
    const client = getClient();
    const { error } = await client.auth.verifyOtp({
      email,
      token,
      type,
    });
    return error ?? null;
  },
  async signOut(): Promise<AuthError | null> {
    const client = getClient();
    const { error } = await client.auth.signOut();
    return error ?? null;
  },
};
