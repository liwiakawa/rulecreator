import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/app/components/ui/input-otp';
import { cn } from '@/lib/utils';
import { authService } from '@/app/services/authService';
import { inviteService } from '@/app/services/inviteService';
import { AuthLayout } from './AuthLayout';
import { useAuth } from '@/app/context/AuthContext';
import { supabaseConfigMissing } from '@/lib/supabaseClient';
import { MissingConfigScreen } from './AuthScreens';

export const RegisterView: React.FC = () => {
  if (supabaseConfigMissing) {
    return <MissingConfigScreen />;
  }
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const auth = useAuth();
  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [stage, setStage] = React.useState<'email' | 'code'>('email');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  const sendCode = async () => {
    setError(null);
    setInfo(null);
    if (!token) {
      setError('Brak tokenu zaproszenia.');
      return;
    }
    if (!email.trim()) {
      setError('Podaj adres e-mail.');
      return;
    }

    setLoading(true);
    try {
      const isValid = await inviteService.validateInvite(token, email.trim());
      if (!isValid) {
        setError('Zaproszenie nie pasuje do tego adresu e-mail.');
        return;
      }
      await authService.sendRegistrationCode(email.trim());
      setStage('code');
      setInfo('Wysłaliśmy kod OTP na email.');
    } catch (err: any) {
      setError(err?.message || 'Nie udało się rozpocząć rejestracji.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setError(null);
    if (!token) {
      setError('Brak tokenu zaproszenia.');
      return;
    }
    if (!email || code.length < 6) {
      setError('Wpisz pełny kod OTP.');
      return;
    }
    setLoading(true);
    try {
      await authService.verifyCode(email.trim(), code.trim());
      await inviteService.acceptInvite(token);
      await auth.refreshRole();
      setInfo('Rejestracja zakończona.');
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Nie udało się zweryfikować kodu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Rejestracja" 
      subtitle="Zaproszenie administratora"
      icon={<ShieldCheck size={18} />}
      footer={
        <div className="text-[11px] text-slate-400">
          Masz konto? <button className="text-indigo-600 font-bold" onClick={() => navigate('/login')}>Zaloguj się</button>
        </div>
      }
    >
      {stage === 'email' && (
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email z zaproszenia</label>
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

      {!token && (
        <div className="text-xs font-medium rounded-2xl px-4 py-3 bg-rose-50 text-rose-600 border border-rose-200">
          Brak tokenu zaproszenia. Skontaktuj się z super adminem.
        </div>
      )}
    </AuthLayout>
  );
};
