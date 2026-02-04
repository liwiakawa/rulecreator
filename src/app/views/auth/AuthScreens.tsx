import React from 'react';
import { LogOut, ShieldAlert, Settings } from 'lucide-react';

export const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Ładowanie...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">
    {message}
  </div>
);

export const MissingConfigScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700 p-8">
    <div className="max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center">
          <Settings size={18} />
        </div>
        <h2 className="text-lg font-black text-slate-900">Brak konfiguracji Supabase</h2>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Ustaw zmienne środowiskowe <span className="font-mono">VITE_SUPABASE_URL</span> oraz{' '}
        <span className="font-mono">VITE_SUPABASE_ANON_KEY</span>, aby włączyć logowanie.
      </p>
      <p className="text-xs text-slate-400">Po dodaniu kluczy odśwież aplikację.</p>
    </div>
  </div>
);

export const AccessDeniedScreen: React.FC<{ onSignOut: () => void }> = ({ onSignOut }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
    <div className="max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center">
          <ShieldAlert size={18} />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900">Brak dostępu</h2>
          <p className="text-xs text-slate-500">Twoje konto nie ma przypisanej roli administratora.</p>
        </div>
      </div>
      <p className="text-sm text-slate-500">
        Jeśli powinieneś mieć dostęp, poproś super admina o wysłanie zaproszenia.
      </p>
      <button
        onClick={onSignOut}
        className="w-full py-3 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
      >
        <LogOut size={14} /> Wyloguj
      </button>
    </div>
  </div>
);
