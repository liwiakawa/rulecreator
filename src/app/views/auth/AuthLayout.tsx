import React from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, icon, children, footer }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">{title}</h1>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        {children}
        {footer}
      </div>
    </div>
  );
};
