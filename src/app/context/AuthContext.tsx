import React from 'react';
import { Session } from '@supabase/supabase-js';
import { authService } from '@/app/services/authService';
import { roleService } from '@/app/services/roleService';
import { UserRole } from '@/app/auth/types';
import { supabaseConfigMissing } from '@/lib/supabaseClient';

export type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated' | 'missing_config' | 'error';

interface AuthContextValue {
  session: Session | null;
  role: UserRole | null;
  status: AuthStatus;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  canManageInvites: boolean;
  refreshRole: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = React.useState<Session | null>(null);
  const [role, setRole] = React.useState<UserRole | null>(null);
  const [status, setStatus] = React.useState<AuthStatus>(supabaseConfigMissing ? 'missing_config' : 'loading');

  const refreshRole = React.useCallback(async () => {
    if (!session) {
      setRole(null);
      return;
    }
    setStatus('loading');
    try {
      const nextRole = await roleService.getRole(session.user.id);
      setRole(nextRole);
      setStatus('authenticated');
    } catch (_err) {
      setRole(null);
      setStatus('authenticated');
    }
  }, [session]);

  React.useEffect(() => {
    if (supabaseConfigMissing) return;
    let cancelled = false;

    authService
      .getSession()
      .then((current) => {
        if (cancelled) return;
        setSession(current);
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('error');
      });

    const subscription = authService.onAuthStateChange((nextSession) => {
      setSession(nextSession);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    if (supabaseConfigMissing) {
      setStatus('missing_config');
      return;
    }

    if (!session) {
      setRole(null);
      setStatus('unauthenticated');
      return;
    }

    let cancelled = false;
    setStatus('loading');

    roleService
      .getRole(session.user.id)
      .then((nextRole) => {
        if (cancelled) return;
        setRole(nextRole);
        setStatus('authenticated');
      })
      .catch(() => {
        if (cancelled) return;
        setRole(null);
        setStatus('authenticated');
      });

    return () => {
      cancelled = true;
    };
  }, [session]);

  const signOut = React.useCallback(async () => {
    await authService.signOut();
  }, []);

  const value: AuthContextValue = {
    session,
    role,
    status,
    isAdmin: role === 'admin' || role === 'super_admin',
    isSuperAdmin: role === 'super_admin',
    canManageInvites: role === 'invites' || role === 'super_admin',
    refreshRole,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
