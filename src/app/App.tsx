import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/app/context/AuthContext';
import { RuleBuilderView } from '@/app/views/RuleBuilderView';
import { InvitesView } from '@/app/views/InvitesView';
import { RegisterView } from '@/app/views/auth/RegisterView';
import { LoginView } from '@/app/views/auth/LoginView';
import { RequireRole } from '@/app/views/auth/RequireRole';
import { RoleRedirect } from '@/app/views/auth/RoleRedirect';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route path="/register/:token" element={<RegisterView />} />
          <Route path="/" element={<RoleRedirect />} />
          <Route
            path="/rules"
            element={
              <RequireRole allowedRoles={['admin', 'super_admin']}>
                <RuleBuilderView />
              </RequireRole>
            }
          />
          <Route
            path="/invites"
            element={
              <RequireRole allowedRoles={['invites', 'super_admin']}>
                <InvitesView />
              </RequireRole>
            }
          />
          <Route
            path="*"
            element={
              <Navigate to="/" replace />
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
