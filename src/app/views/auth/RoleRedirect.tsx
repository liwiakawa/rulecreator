import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { AccessDeniedScreen, LoadingScreen, MissingConfigScreen } from './AuthScreens';
import { LoginView } from './LoginView';

export const RoleRedirect: React.FC = () => {
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

  if (auth.role === 'invites') {
    return <Navigate to="/invites" replace />;
  }

  if (auth.role === 'admin' || auth.role === 'super_admin') {
    return <Navigate to="/rules" replace />;
  }

  return <AccessDeniedScreen onSignOut={auth.signOut} />;
};
