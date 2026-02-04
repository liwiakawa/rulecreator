import React from 'react';
import { supabase, supabaseConfigMissing } from '@/lib/supabaseClient';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/app/components/ui/input-otp';
import { Mail, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthGateProps {
  children: React.ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const [loading, setLoading] = React.useState(true);
  const [session, setSession] = React.useState<any>(null);
  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [stage, setStage] = React.useState<'email' | 'code'>('email');
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const sendCode = async () => {
    setError(null);
    setInfo(null);
    if (!supabase) return;
    if (!email) {
      setError('Podaj adres e-mail.');
      return;
    }
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (signInError) {
      setError(signInError.message);
      return;
    }
    setStage('code');
    setInfo('Wysłaliśmy kod OTP na email.');
  };

  const verifyCode = async () => {
    setError(null);
    if (!supabase) return;
    if (!email || code.length < 6) {
      setError('Wpisz pełny kod OTP.');
      return;
    }
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });
    if (verifyError) {
      setError(verifyError.message);
      return;
    }
    setInfo('Zalogowano.');
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">
        Ładowanie...
      </div>
    );
  }

  if (supabaseConfigMissing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700 p-8">
        <div className="max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-xl">
          <h2 className="text-lg font-black text-slate-900 mb-2">Brak konfiguracji Supabase</h2>
          <p className="text-sm text-slate-500 mb-4">
            Ustaw zmienne środowiskowe <span className="font-mono">VITE_SUPABASE_URL</span> i{' '}
            <span className="font-mono">VITE_SUPABASE_ANON_KEY</span>, aby włączyć logowanie OTP.
          </p>
          <p className="text-xs text-slate-400">Po dodaniu kluczy odśwież aplikację.</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
              <Mail size={18} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900">Zaloguj się</h1>
              <p className="text-xs text-slate-500">Email OTP dla dostępu do edytora</p>
            </div>
          </div>

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
                className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all"
              >
                Wyślij kod OTP
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
                className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all"
              >
                Zweryfikuj
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
        </div>
      </div>
    );
  }

  const emailValue = session.user?.email || 'Zalogowany';
  const initial = emailValue[0]?.toUpperCase() || 'U';

  return <div className="relative">{children}</div>;
};
