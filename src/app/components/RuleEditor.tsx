import React from 'react';
import {
  TriggerRule,
  BACKGROUND_ACTIONS,
  BACKGROUND_VARIABLES,
  VARIABLE_CONFIG,
  ConditionGroup,
} from '@/app/types';
import { ConditionNode } from './ConditionBuilder';
import { ActionBuilder } from './ActionBuilder';
import { ConstraintsBuilder } from './ConstraintsBuilder';
import { Info, Hash, ShieldCheck, Gauge, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface RuleEditorProps {
  rule: TriggerRule;
  onChange: (rule: TriggerRule) => void;
}

const isSnakeCase = (value: string) => /^[a-z][a-z0-9_]*$/.test(value);

const collectVariables = (group: ConditionGroup): Set<string> => {
  const acc = new Set<string>();
  const walk = (node: ConditionGroup) => {
    node.rules.forEach((rule) => {
      if ('rules' in rule) walk(rule);
      else {
        acc.add(rule.field);
        if (rule.ref) acc.add(rule.ref);
      }
    });
  };
  walk(group);
  return acc;
};

export const RuleEditor: React.FC<RuleEditorProps> = ({ rule, onChange }) => {
  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...rule, id: e.target.value });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...rule, name: e.target.value });
  };

  const backgroundVariables = Array.from(collectVariables(rule.conditions));
  const invalidBackgroundVariables = backgroundVariables.filter(
    (key) => !BACKGROUND_VARIABLES.includes(key as any)
  );
  const invalidBackgroundActions = rule.actions.filter((action) => !BACKGROUND_ACTIONS.includes(action.type));

  const StepHeader = ({
    number,
    title,
    subtitle,
    color = 'indigo',
  }: {
    number: string;
    title: string;
    subtitle: string;
    color?: string;
  }) => (
    <div className="p-5 border-b border-slate-100 bg-white flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shadow-lg shadow-indigo-500/10',
            `bg-${color}-600 text-white`
          )}
        >
          {number}
        </div>
        <div>
          <h3 className="font-bold text-slate-900 leading-tight">{title}</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse" />
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Krok Konfiguracyjny</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-10 pb-32 max-w-5xl mx-auto px-4 md:px-0">
      <div className="fixed left-1/2 md:left-[calc(50%-28rem)] top-32 bottom-32 w-px bg-gradient-to-b from-indigo-500 via-slate-200 to-emerald-500 hidden xl:block opacity-30" />

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 overflow-hidden relative z-40"
      >
        <StepHeader number="01" title="Podstawowe Informacje" subtitle="RULE METADATA" />

        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gradient-to-b from-white to-slate-50/30">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
              <Hash size={12} /> ID Reguły (snake_case)
            </label>
            <input
              type="text"
              value={rule.id}
              onChange={handleIdChange}
              className={cn(
                'w-full px-4 py-3 bg-white border rounded-xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 shadow-sm',
                !isSnakeCase(rule.id) && 'border-rose-300 focus:border-rose-400'
              )}
              placeholder="np. steps_reminder_evening"
            />
            {!isSnakeCase(rule.id) && (
              <p className="text-[10px] font-semibold text-rose-500">ID powinno być w snake_case.</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
              <ShieldCheck size={12} className="text-emerald-500" /> Nazwa Reguły
            </label>
            <input
              type="text"
              value={rule.name}
              onChange={handleNameChange}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 shadow-sm"
              placeholder="np. Przypomnienie o krokach"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
              <Gauge size={12} className="text-amber-500" /> Priorytet (1-100)
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={rule.priority}
              onChange={(e) => onChange({ ...rule, priority: Math.min(100, Math.max(1, parseInt(e.target.value, 10) || 1)) })}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 shadow-sm"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
              <Sparkles size={12} className="text-indigo-500" /> Status
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onChange({ ...rule, enabled: !rule.enabled })}
                className={cn(
                  'px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border',
                  rule.enabled
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                )}
              >
                {rule.enabled ? 'Aktywna' : 'Wyłączona'}
              </button>
              <button
                onClick={() => onChange({ ...rule, backgroundEnabled: !rule.backgroundEnabled })}
                className={cn(
                  'px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border',
                  rule.backgroundEnabled
                    ? 'bg-indigo-600 text-white border-indigo-700'
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                )}
              >
                {rule.backgroundEnabled ? 'Background ON' : 'Background OFF'}
              </button>
            </div>
            {rule.backgroundEnabled && (invalidBackgroundVariables.length > 0 || invalidBackgroundActions.length > 0) && (
              <div className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                <p className="font-semibold">Tryb tła ma ograniczenia:</p>
                {invalidBackgroundVariables.length > 0 && (
                  <p>
                    Niedozwolone zmienne: {invalidBackgroundVariables.map((key) => VARIABLE_CONFIG[key as any]?.label || key).join(', ')}
                  </p>
                )}
                {invalidBackgroundActions.length > 0 && <p>Niedozwolone akcje: tylko notification w tle.</p>}
              </div>
            )}
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 overflow-hidden relative z-30"
      >
        <StepHeader number="02" title="Ograniczenia Czasowe" subtitle="WHEN IT CAN RUN" />
        <div className="p-6 md:p-8 bg-slate-50/20">
          <ConstraintsBuilder
            cooldown={rule.cooldown}
            schedule={rule.schedule}
            onChange={(updates) => onChange({ ...rule, ...updates })}
          />
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 overflow-hidden relative z-20"
      >
        <StepHeader number="03" title="Warunki Logiczne" subtitle="CHECK THESE DATA POINTS" />
        <div className="p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Info size={16} />
            </div>
            <p className="text-[11px] font-medium text-indigo-700/80 leading-relaxed">
              Buduj złożone drzewa decyzyjne. Grupuj elementy, aby tworzyć zaawansowaną logikę <strong>ORAZ / LUB</strong>.
            </p>
          </div>

          <ConditionNode
            node={rule.conditions}
            isRoot
            onChange={(updatedRoot) => onChange({ ...rule, conditions: updatedRoot as ConditionGroup })}
            onRemove={() => {}}
          />
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 overflow-hidden relative z-10"
      >
        <StepHeader number="04" title="Zdefiniuj Akcje" subtitle="THEN EXECUTE THIS" color="emerald" />
        <div className="p-6 md:p-8 bg-gradient-to-b from-white to-emerald-50/20">
          <ActionBuilder
            actions={rule.actions}
            onChange={(actions) => onChange({ ...rule, actions })}
            backgroundEnabled={rule.backgroundEnabled}
          />
        </div>
      </motion.section>
    </div>
  );
};
