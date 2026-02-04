import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/app/components/layout/AppHeader';
import { cn } from '@/lib/utils';
import { inviteService } from '@/app/services/inviteService';
import { InviteRecord } from '@/app/auth/types';
import { useAuth } from '@/app/context/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Check, Copy, RefreshCcw, UserPlus, XCircle } from 'lucide-react';

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('pl-PL');
};

const getStatus = (invite: InviteRecord) => {
  if (invite.revoked_at) return { label: 'Anulowane', color: 'text-rose-600 bg-rose-50 border-rose-200' };
  if (invite.used_at) return { label: 'Użyte', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  return { label: 'Aktywne', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
};

export const InvitesView: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [invites, setInvites] = React.useState<InviteRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [workingId, setWorkingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const loadInvites = React.useCallback(async () => {
    setLoading(true);
    try {
      const list = await inviteService.listInvites();
      setInvites(list);
    } catch (err: any) {
      setError(err?.message || 'Nie udało się pobrać zaproszeń.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadInvites();
  }, [loadInvites]);

  const handleCreate = async () => {
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError('Podaj adres e-mail.');
      return;
    }
    setWorkingId('create');
    try {
      const invite = await inviteService.createAdminInvite(email.trim());
      setInvites((prev) => [invite, ...prev]);
      const sent = await inviteService.sendInviteEmail(invite.email, invite.token, invite.role);
      setInfo(sent ? 'Zaproszenie wysłane e-mailem.' : 'Zaproszenie utworzone. Skopiuj link i wyślij ręcznie.');
      setEmail('');
    } catch (err: any) {
      setError(err?.message || 'Nie udało się utworzyć zaproszenia.');
    } finally {
      setWorkingId(null);
    }
  };

  const handleRevoke = async (invite: InviteRecord) => {
    if (invite.revoked_at || invite.used_at) return;
    setWorkingId(invite.id);
    setError(null);
    setInfo(null);
    try {
      await inviteService.revokeInvite(invite.id);
      setInvites((prev) => prev.map((item) => (item.id === invite.id ? { ...item, revoked_at: new Date().toISOString() } : item)));
      setInfo('Zaproszenie zostało anulowane.');
    } catch (err: any) {
      setError(err?.message || 'Nie udało się anulować zaproszenia.');
    } finally {
      setWorkingId(null);
    }
  };

  const handleResend = async (invite: InviteRecord) => {
    if (invite.revoked_at || invite.used_at) return;
    setWorkingId(invite.id);
    setError(null);
    setInfo(null);
    try {
      const sent = await inviteService.sendInviteEmail(invite.email, invite.token, invite.role);
      setInfo(sent ? 'Zaproszenie wysłane ponownie.' : 'Nie udało się wysłać emaila. Skopiuj link ręcznie.');
    } catch (err: any) {
      setError(err?.message || 'Nie udało się wysłać zaproszenia.');
    } finally {
      setWorkingId(null);
    }
  };

  const handleCopy = async (invite: InviteRecord) => {
    const url = `${window.location.origin}/register/${invite.token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(invite.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (_err) {
      setError('Nie udało się skopiować linku.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <AppHeader
        title="Zaproszenia"
        subtitle="Zarządzanie dostępem administratorów"
        right={
          <>
            {auth.isAdmin && (
              <button
                onClick={() => navigate('/rules')}
                className="hidden md:inline-flex px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all"
              >
                Wróć do reguł
              </button>
            )}
            <button
              onClick={auth.signOut}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all"
            >
              Wyloguj
            </button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                <UserPlus size={18} />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">Nowe zaproszenie</h2>
                <p className="text-xs text-slate-500">Zapraszasz użytkownika na rolę admin.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
              />
              <button
                onClick={handleCreate}
                disabled={workingId === 'create'}
                className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all disabled:opacity-60"
              >
                {workingId === 'create' ? 'Wysyłam...' : 'Wyślij zaproszenie'}
              </button>
            </div>

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

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-black text-slate-900">Lista zaproszeń</h2>
                <p className="text-xs text-slate-500">{invites.length} zaproszeń</p>
              </div>
              <button
                onClick={loadInvites}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all"
              >
                Odśwież
              </button>
            </div>

            {loading ? (
              <div className="text-sm text-slate-400">Ładowanie zaproszeń...</div>
            ) : invites.length === 0 ? (
              <div className="text-sm text-slate-400">Brak zaproszeń do wyświetlenia.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Utworzono</TableHead>
                    <TableHead>Użyte</TableHead>
                    <TableHead>Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invites.map((invite) => {
                    const status = getStatus(invite);
                    const isWorking = workingId === invite.id;
                    return (
                      <TableRow key={invite.id}>
                        <TableCell className="font-semibold text-slate-800">{invite.email}</TableCell>
                        <TableCell>
                          <span className={cn('text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border', status.color)}>
                            {status.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">{formatDate(invite.created_at)}</TableCell>
                        <TableCell className="text-xs text-slate-500">{formatDate(invite.used_at)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleCopy(invite)}
                              className={cn(
                                'px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all',
                                copiedId === invite.id
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-white text-slate-500 border-slate-200 hover:text-indigo-600 hover:border-indigo-200'
                              )}
                            >
                              {copiedId === invite.id ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                            <button
                              onClick={() => handleResend(invite)}
                              disabled={isWorking || !!invite.used_at || !!invite.revoked_at}
                              className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-40"
                            >
                              <RefreshCcw size={12} />
                            </button>
                            <button
                              onClick={() => handleRevoke(invite)}
                              disabled={isWorking || !!invite.used_at || !!invite.revoked_at}
                              className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 disabled:opacity-40"
                            >
                              <XCircle size={12} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
