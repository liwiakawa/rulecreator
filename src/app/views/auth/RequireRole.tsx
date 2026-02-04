import React from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { AccessDeniedScreen, LoadingScreen, MissingConfigScreen } from './AuthScreens';
import { LoginView } from './LoginView';
import { UserRole } from '@/app/auth/types';

export const RequireRole: React.FC<{ children: React.ReactNode; allowedRoles: UserRole[] }> = ({
  children,
  allowedRoles,
}) => {
  const auth = useAuth();

  if (auth.status === 'missing_config') {
    return <MissingConfigScreen />;
  }

  if (auth.status === 'error') {
    return <LoadingScreen message="Wystąpił błąd uwierzytelniania." />;
  }

  if (auth.status === 'loading') {
    return <LoadingScreen />;
  }

  if (!auth.session) {
    return <LoginView />;
  }

  if (!auth.role || !allowedRoles.includes(auth.role)) {
    return <AccessDeniedScreen onSignOut={auth.signOut} />;
  }

  return <>{children}</>;
};
