import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/app/context/AuthContext';
import { RuleBuilderView } from '@/app/views/RuleBuilderView';
import { RegisterView } from '@/app/views/auth/RegisterView';
import { LoginView } from '@/app/views/auth/LoginView';
import { RequireAuth } from '@/app/views/auth/RequireAuth';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route path="/register/:token" element={<RegisterView />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <RuleBuilderView />
              </RequireAuth>
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
