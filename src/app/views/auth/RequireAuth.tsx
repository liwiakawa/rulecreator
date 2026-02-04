import React from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { AccessDeniedScreen, LoadingScreen, MissingConfigScreen } from './AuthScreens';
import { LoginView } from './LoginView';

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  if (!auth.isAdmin) {
    return <AccessDeniedScreen onSignOut={auth.signOut} />;
  }

  return <>{children}</>;
};
