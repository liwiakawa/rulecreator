import React, { useRef } from 'react';
import {
  Action,
  ActionType,
  ACTION_CONFIG,
  TARGET_VIEW_OPTIONS,
  PLACEHOLDER_TOKENS,
  AlertStyle,
  ActionPriority,
} from '@/app/types';
import { Bell, AlertCircle, BookHeart, Lightbulb, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Bell,
  AlertCircle,
  BookHeart,
  Lightbulb,
};

interface ActionBuilderProps {
  actions: Action[];
  onChange: (actions: Action[]) => void;
  backgroundEnabled?: boolean;
}

const createDefaultAction = (type: ActionType): Action => {
  switch (type) {
    case 'notification':
      return { type: 'notification', title: '', body: '', targetView: '/home' };
    case 'in_app_alert':
      return { type: 'in_app_alert', title: '', body: '', style: 'info', dismissable: true };
    case 'add_memory':
      return { type: 'add_memory', category: 'health_pattern', content: '' };
    case 'add_insight':
      return { type: 'add_insight', category: 'activity', title: '', body: '', priority: 'medium' };
    default:
      return { type: 'notification', title: '', body: '', targetView: '/home' };
  }
};

export const ActionBuilder: React.FC<ActionBuilderProps> = ({ actions, onChange, backgroundEnabled }) => {
  const addAction = (type: ActionType) => {
    onChange([...actions, createDefaultAction(type)]);
  };

  const updateAction = (idx: number, updates: Partial<Action>) => {
    const next = [...actions];
    next[idx] = { ...next[idx], ...updates } as Action;
    onChange(next);
  };

  const replaceActionType = (idx: number, type: ActionType) => {
    const next = [...actions];
    next[idx] = createDefaultAction(type);
    onChange(next);
  };

  const removeAction = (idx: number) => {
    const next = actions.filter((_, index) => index !== idx);
    onChange(next);
  };

  return (
    <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
      <div className="p-6 md:p-8 border-b border-slate-100 bg-white">
        <div className="flex items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-[#10b981] flex items-center justify-center text-white text-lg font-black shadow-[0_4px_12px_rgba(16,185,129,0.3)] shrink-0">
              04
            </div>
            <div className="flex flex-col">
              <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none">Zdefiniuj Akcje</h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">
                THEN EXECUTE THIS
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(Object.keys(ACTION_CONFIG) as ActionType[]).map((type) => {
              const config = ACTION_CONFIG[type];
              const Icon = ICON_MAP[config.icon];
              const disabled = backgroundEnabled && type !== 'notification';
              return (
                <button
                  key={type}
                  onClick={() => addAction(type)}
                  disabled={disabled}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all',
                    disabled
                      ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                  )}
                >
                  <Icon size={14} />
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>
        {backgroundEnabled && (
          <p className="mt-4 text-[11px] font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            Tryb tła: dostępne są tylko akcje typu notification.
          </p>
        )}
      </div>

      <div className="p-6 space-y-8">
        {actions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">Brak akcji. Dodaj pierwszą akcję powyżej.</div>
        ) : (
          actions.map((action, idx) => (
            <div key={`action-${idx}`} className="border border-slate-100 rounded-3xl p-6 shadow-sm bg-white">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 text-xs font-black">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Akcja #{idx + 1}</p>
                    <p className="text-sm font-bold text-slate-700">{ACTION_CONFIG[action.type].label}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeAction(idx)}
                  className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  title="Usuń akcję"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {(Object.entries(ACTION_CONFIG) as [ActionType, (typeof ACTION_CONFIG)[ActionType]][]).map(([key, config]) => {
                  const Icon = ICON_MAP[config.icon];
                  const isSelected = action.type === key;
                  const disabled = backgroundEnabled && key !== 'notification';

                  return (
                    <button
                      key={key}
                      onClick={() => !disabled && replaceActionType(idx, key)}
                      disabled={disabled}
                      className={cn(
                        'relative p-3 rounded-xl border text-left transition-all hover:shadow-md flex flex-col gap-2 group',
                        disabled
                          ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                          : isSelected
                          ? `bg-${config.color}-50 border-${config.color}-500 ring-1 ring-${config.color}-500`
                          : 'bg-white border-slate-200 hover:border-indigo-200'
                      )}
                    >
                      <div
                        className={cn(
                          'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                          isSelected
                            ? `bg-${config.color}-100 text-${config.color}-700`
                            : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                        )}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-xs">{config.label}</div>
                        <div className="text-[10px] text-slate-500 mt-1 leading-snug">{config.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <ActionForm action={action} onChange={(updates) => updateAction(idx, updates)} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const TemplateInput: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  rows?: number;
}> = ({ label, value, onChange, rows = 3 }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPicker, setShowPicker] = React.useState(false);

  const insertVariable = (token: string) => {
    const variable = `{{${token}}}`;
    const input = textareaRef.current;
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    const newValue = before + variable + after;
    onChange(newValue);

    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
    setShowPicker(false);
  };

  return (
    <div className="space-y-1.5 relative">
      <div className="flex justify-between items-end">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-colors font-medium"
          >
            <Plus size={12} /> Wstaw zmienną
          </button>

          {showPicker && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-slate-200 shadow-xl rounded-lg z-50 max-h-60 overflow-y-auto p-1">
              <div className="px-2 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                Dostępne placeholdery
              </div>
              {PLACEHOLDER_TOKENS.map((token) => (
                <button
                  key={token}
                  onClick={() => insertVariable(token)}
                  className="w-full text-left px-2 py-1.5 hover:bg-indigo-50 rounded flex items-center gap-2 text-xs text-slate-700"
                >
                  <span className="font-medium text-indigo-600 font-mono bg-indigo-50 px-1 rounded">{`{{${token}}}`}</span>
                </button>
              ))}
            </div>
          )}
          {showPicker && <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />}
        </div>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all resize-none shadow-sm placeholder:text-slate-300"
        placeholder="Wpisz tekst wiadomości..."
      />
      <p className="text-xs text-slate-400">Użyj placeholderów, aby spersonalizować wiadomość.</p>
    </div>
  );
};

const ActionForm: React.FC<{
  action: Action;
  onChange: (updates: Partial<Action>) => void;
}> = ({ action, onChange }) => {
  switch (action.type) {
    case 'notification':
      return (
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tytuł</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-sm placeholder:text-slate-300"
              value={action.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="np. Czas na sen!"
            />
          </div>
          <TemplateInput label="Treść" value={action.body} onChange={(val) => onChange({ body: val })} />
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target View</label>
            <div className="relative">
              <select
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-sm appearance-none"
                value={action.targetView || '/home'}
                onChange={(e) => onChange({ targetView: e.target.value as any })}
              >
                {TARGET_VIEW_OPTIONS.map((view) => (
                  <option key={view.value} value={view.value}>
                    {view.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      );

    case 'in_app_alert':
      return (
        <div className="grid grid-cols-1 gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tytuł</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-sm"
                value={action.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Wpisz tytuł..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Styl</label>
              <div className="relative">
                <select
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-sm appearance-none"
                  value={action.style || 'info'}
                  onChange={(e) => onChange({ style: e.target.value as AlertStyle })}
                >
                  <option value="info">Informacja</option>
                  <option value="success">Sukces</option>
                  <option value="warning">Ostrzeżenie</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <TemplateInput label="Wiadomość" value={action.body} onChange={(val) => onChange({ body: val })} />

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dismissable</label>
            <div className="flex gap-4">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => onChange({ dismissable: val })}
                  className={cn(
                    'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all',
                    action.dismissable === val
                      ? 'bg-indigo-600 text-white border-indigo-700'
                      : 'bg-white text-slate-400 border-slate-200 hover:text-indigo-600'
                  )}
                >
                  {val ? 'Tak' : 'Nie'}
                </button>
              ))}
            </div>
          </div>
        </div>
      );

    case 'add_memory':
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategoria</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-sm"
              value={action.category}
              onChange={(e) => onChange({ category: e.target.value })}
              placeholder="np. recovery"
            />
          </div>
          <TemplateInput label="Treść" value={action.content} onChange={(val) => onChange({ content: val })} rows={4} />
        </div>
      );

    case 'add_insight':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategoria</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-sm"
                value={action.category}
                onChange={(e) => onChange({ category: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priorytet</label>
              <div className="relative">
                <select
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-sm appearance-none"
                  value={action.priority || 'medium'}
                  onChange={(e) => onChange({ priority: e.target.value as ActionPriority })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tytuł</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-sm"
              value={action.title}
              onChange={(e) => onChange({ title: e.target.value })}
            />
          </div>
          <TemplateInput label="Treść" value={action.body} onChange={(val) => onChange({ body: val })} rows={3} />
        </div>
      );

    default:
      return <div>Konfiguracja niedostępna.</div>;
  }
};
