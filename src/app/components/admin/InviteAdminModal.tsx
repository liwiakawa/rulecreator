import React from 'react';
import { UserPlus, Copy, Check } from 'lucide-react';
import { Modal } from '@/app/components/ui/Modal';
import { inviteService } from '@/app/services/inviteService';
import { cn } from '@/lib/utils';

interface InviteAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteAdminModal: React.FC<InviteAdminModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setError(null);
      setInfo(null);
      setInviteUrl(null);
      setCopied(false);
    }
  }, [isOpen]);

  const handleInvite = async () => {
    setError(null);
    setInfo(null);
    setInviteUrl(null);
    if (!email.trim()) {
      setError('Podaj adres e-mail.');
      return;
    }

    setLoading(true);
    try {
      const invite = await inviteService.createAdminInvite(email.trim());
      const link = `${window.location.origin}/register/${invite.token}`;
      setInviteUrl(link);

      const sent = await inviteService.sendInviteEmail(invite.email, invite.token, invite.role);
      setInfo(sent ? 'Zaproszenie wysłane e-mailem.' : 'Zaproszenie utworzone. Skopiuj link i wyślij ręcznie.');
    } catch (err: any) {
      setError(err?.message || 'Nie udało się wysłać zaproszenia.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_err) {
      setError('Nie udało się skopiować linku.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Zaproś admina">
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
            <UserPlus size={18} />
          </div>
          <div>
            <h3 className="font-black text-slate-900">Nowe zaproszenie</h3>
            <p className="text-xs text-slate-500">Tylko super admin może zapraszać kolejnych administratorów.</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
          />
        </div>

        <button
          onClick={handleInvite}
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all disabled:opacity-60"
        >
          {loading ? 'Wysyłam...' : 'Wyślij zaproszenie'}
        </button>

        {inviteUrl && (
          <div className="space-y-2">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Link rejestracyjny</div>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={inviteUrl}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 bg-slate-50"
              />
              <button
                onClick={handleCopy}
                className={cn(
                  'px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all',
                  copied
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-white text-slate-500 border-slate-200 hover:text-indigo-600 hover:border-indigo-200'
                )}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
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
    </Modal>
  );
};
