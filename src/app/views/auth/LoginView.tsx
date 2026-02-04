import React from 'react';
import { Mail } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/app/components/ui/input-otp';
import { cn } from '@/lib/utils';
import { authService } from '@/app/services/authService';
import { AuthLayout } from './AuthLayout';
import { supabaseConfigMissing } from '@/lib/supabaseClient';
import { MissingConfigScreen } from './AuthScreens';

export const LoginView: React.FC = () => {
  if (supabaseConfigMissing) {
    return <MissingConfigScreen />;
  }
  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [stage, setStage] = React.useState<'email' | 'code'>('email');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  const sendCode = async () => {
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError('Podaj adres e-mail.');
      return;
    }
    setLoading(true);
    try {
      await authService.sendLoginCode(email.trim());
      setStage('code');
      setInfo('Wysłaliśmy kod OTP na email.');
    } catch (err: any) {
      setError(err?.message || 'Nie udało się wysłać kodu.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setError(null);
    if (!email || code.length < 6) {
      setError('Wpisz pełny kod OTP.');
      return;
    }
    setLoading(true);
    try {
      await authService.verifyCode(email.trim(), code.trim());
      setInfo('Zalogowano.');
    } catch (err: any) {
      setError(err?.message || 'Nie udało się zweryfikować kodu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Zaloguj się"
      subtitle="Dostęp tylko dla zaproszonych administratorów"
      icon={<Mail size={18} />}
    >
      {stage === 'email' && (
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
          />
          <button
            onClick={sendCode}
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all disabled:opacity-60"
          >
            {loading ? 'Wysyłam...' : 'Wyślij kod OTP'}
          </button>
        </div>
      )}

      {stage === 'code' && (
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kod OTP</label>
          <InputOTP maxLength={6} value={code} onChange={(val) => setCode(val)}>
            <InputOTPGroup className="gap-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <InputOTPSlot key={idx} index={idx} className="h-12 w-12 rounded-xl border-slate-200" />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <button
            onClick={verifyCode}
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all disabled:opacity-60"
          >
            {loading ? 'Weryfikuję...' : 'Zweryfikuj'}
          </button>
          <button
            onClick={() => {
              setStage('email');
              setCode('');
            }}
            className="w-full py-2 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all"
          >
            Zmień email
          </button>
        </div>
      )}

      {(error || info) && (
        <div
          className={cn(
            'text-xs font-medium rounded-2xl px-4 py-3',
            error ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
          )}
        >
          {error || info}
        </div>
      )}
    </AuthLayout>
  );
};
