import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { TriggerRule, ConditionGroup } from '@/app/types';
import { ConditionNode } from '@/app/components/ConditionBuilder';
import { ConstraintsBuilder } from '@/app/components/ConstraintsBuilder';
import { ActionBuilder } from '@/app/components/ActionBuilder';
import { cn } from '@/lib/utils';

interface NodeInspectorProps {
  nodeId: string;
  rule: TriggerRule;
  onChange: (rule: TriggerRule) => void;
  onClose: () => void;
}

const SECTION_LABELS: Record<string, string> = {
  trigger: 'Podstawowe informacje',
  condition: 'Warunki logiczne',
  constraint: 'Ograniczenia czasowe',
  action: 'Akcje',
};

export const NodeInspector = ({ nodeId, rule, onChange, onClose }: NodeInspectorProps) => {
  const section = SECTION_LABELS[nodeId] || 'Inspektor';

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className={cn(
        'bg-white border-l border-slate-200/60 flex flex-col shadow-[-12px_0_30px_rgba(0,0,0,0.04)] z-20',
        'fixed inset-x-0 bottom-0 max-h-[80vh] rounded-t-3xl md:static md:h-full md:max-h-none md:w-[360px]'
      )}
    >
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1">{section}</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Edytuj konfigurację</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {nodeId === 'trigger' && (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ID (snake_case)</label>
              <input
                type="text"
                value={rule.id}
                onChange={(e) => onChange({ ...rule, id: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nazwa</label>
              <input
                type="text"
                value={rule.name}
                onChange={(e) => onChange({ ...rule, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priorytet (1-100)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={rule.priority}
                onChange={(e) =>
                  onChange({
                    ...rule,
                    priority: Math.min(100, Math.max(1, parseInt(e.target.value, 10) || 1)),
                  })
                }
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
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
          </div>
        )}

        {nodeId === 'condition' && (
          <ConditionNode
            node={rule.conditions}
            isRoot
            onChange={(updated) => onChange({ ...rule, conditions: updated as ConditionGroup })}
            onRemove={() => {}}
          />
        )}

        {nodeId === 'constraint' && (
          <ConstraintsBuilder
            cooldown={rule.cooldown}
            schedule={rule.schedule}
            onChange={(updates) => onChange({ ...rule, ...updates })}
          />
        )}

        {nodeId === 'action' && (
          <ActionBuilder
            actions={rule.actions}
            onChange={(actions) => onChange({ ...rule, actions })}
            backgroundEnabled={rule.backgroundEnabled}
          />
        )}
      </div>
    </motion.div>
  );
};
