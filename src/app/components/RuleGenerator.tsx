import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { TriggerRule } from '@/app/types';
import { Sparkles } from 'lucide-react';

interface RuleGeneratorProps {
  onGenerate: (rule: TriggerRule) => void;
}

export const RuleGenerator: React.FC<RuleGeneratorProps> = ({ onGenerate }) => {
  const [prompt, setPrompt] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);
    setInfo(null);
    if (!supabase) {
      setError('Supabase nie jest skonfigurowany.');
      return;
    }
    if (!prompt.trim()) {
      setError('Opisz regułę, którą chcesz wygenerować.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-rule', {
        body: { prompt },
      });

      if (fnError) {
        throw fnError;
      }

      const rule = data?.rule || data;
      if (!rule || typeof rule !== 'object') {
        throw new Error('Nie udało się odczytać reguły z odpowiedzi.');
      }

      onGenerate(rule as TriggerRule);
      setInfo('Reguła wygenerowana.');
      setPrompt('');
    } catch (err: any) {
      setError(err.message || 'Błąd generowania reguły');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
          <Sparkles size={16} />
        </div>
        <div>
          <h3 className="font-black text-slate-900">Generator reguł (OpenRouter)</h3>
          <p className="text-xs text-slate-500">Opisz regułę słownie, a LLM wygeneruje JSON.</p>
        </div>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={6}
        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all resize-none"
        placeholder="Np. Jeśli jest po 18:00 i użytkownik ma mniej niż 3000 kroków, wyślij powiadomienie z linkiem do /home."
      />

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all disabled:opacity-60"
      >
        {loading ? 'Generuję...' : 'Wygeneruj regułę'}
      </button>

      {(error || info) && (
        <div className={`text-xs font-medium rounded-2xl px-4 py-3 ${error ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
          {error || info}
        </div>
      )}

      <p className="text-[11px] text-slate-400">
        Funkcja wymaga wdrożenia Supabase Edge Function <span className="font-mono">generate-rule</span> oraz ustawienia sekretu
        <span className="font-mono">OPENROUTER_API_KEY</span>.
      </p>
    </div>
  );
};
