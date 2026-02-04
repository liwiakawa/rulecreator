import React from 'react';
import { TriggerRule } from '@/app/types';
import { cn } from '@/lib/utils';
import { Plus, Copy, Trash2, CheckCircle2, Circle, LogOut, ShieldCheck } from 'lucide-react';

interface RuleListPanelProps {
  rules: TriggerRule[];
  activeRuleId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
  userEmail?: string | null;
  onSignOut?: () => void;
  className?: string;
  adminActions?: React.ReactNode;
}

export const RuleListPanel: React.FC<RuleListPanelProps> = ({
  rules,
  activeRuleId,
  onSelect,
  onAdd,
  onDuplicate,
  onDelete,
  isAdmin,
  userEmail,
  onSignOut,
  className,
  adminActions,
}) => {
  const [query, setQuery] = React.useState('');

  const filtered = rules.filter((rule) => {
    const q = query.toLowerCase();
    return rule.name.toLowerCase().includes(q) || rule.id.toLowerCase().includes(q);
  });

  const emailValue = userEmail || 'Zalogowany';
  const initial = emailValue[0]?.toUpperCase() || 'U';

  return (
    <aside
      className={cn(
        'w-full lg:w-72 xl:w-80 border-r border-slate-200 bg-white h-full min-h-0 flex flex-col overflow-hidden',
        className
      )}
    >
      <div className="p-4 border-b border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Reguły</h2>
            <p className="text-[11px] text-slate-400">{rules.length} łącznie</p>
          </div>
          <button
            onClick={onAdd}
            className="p-2 rounded-xl bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-all"
            title="Dodaj regułę"
          >
            <Plus size={14} />
          </button>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Szukaj..."
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none"
        />

        {!isAdmin && (
          <div className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            Tryb tylko do odczytu — zapisy dostępne tylko dla admina.
          </div>
        )}

        {adminActions && (
          <div className="pt-2 border-t border-slate-100">{adminActions}</div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
        {filtered.map((rule) => {
          const active = rule.id === activeRuleId;
          return (
            <div
              key={rule.id}
              className={cn(
                'rounded-2xl border p-3 transition-all cursor-pointer group',
                active
                  ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                  : 'border-slate-100 bg-white hover:border-indigo-200'
              )}
              onClick={() => onSelect(rule.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {rule.enabled ? (
                      <CheckCircle2 size={12} className="text-emerald-500" />
                    ) : (
                      <Circle size={12} className="text-slate-300" />
                    )}
                    <p className="text-xs font-black text-slate-800 truncate">{rule.name}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono truncate mt-1">{rule.id}</p>
                </div>
                <span className="text-[10px] font-black text-slate-400">P{rule.priority}</span>
              </div>

              <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(rule.id);
                  }}
                  className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600"
                >
                  <Copy size={12} /> Duplikuj
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(rule.id);
                  }}
                  className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600"
                  disabled={!isAdmin}
                >
                  <Trash2 size={12} /> Usuń
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center text-xs text-slate-400 py-6">Brak reguł do wyświetlenia.</div>
        )}
      </div>

      <div className="border-t border-slate-100 p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Zalogowano jako</div>
          <div className="text-[12px] font-bold text-slate-800 truncate">{emailValue}</div>
          {isAdmin && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
              <ShieldCheck size={10} className="text-emerald-500" />
              Admin
            </div>
          )}
        </div>
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600"
          >
            <LogOut size={14} /> Wyloguj
          </button>
        )}
      </div>
    </aside>
  );
};
