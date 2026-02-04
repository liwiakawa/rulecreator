import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { GitBranch, Layers, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ConditionGroup, ConditionRule, OPERATOR_CONFIG, VARIABLE_CONFIG } from '@/app/types';

const flattenRules = (group?: ConditionGroup): ConditionRule[] => {
  if (!group) return [];
  const acc: ConditionRule[] = [];
  const walk = (node: ConditionGroup) => {
    node.rules.forEach((rule) => {
      if ('rules' in rule) walk(rule);
      else acc.push(rule);
    });
  };
  walk(group);
  return acc;
};

export const ConditionNode = memo(({ data, selected }: NodeProps) => {
  const conditions = data?.conditions as ConditionGroup | undefined;
  const count = flattenRules(conditions).length;
  const logic = conditions?.operator || 'AND';
  const preview = flattenRules(conditions).slice(0, 2);

  return (
    <div
      className={cn(
        'px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-[24px] bg-white border-2 w-72 group transition-all duration-300 relative',
        selected ? 'border-indigo-500 shadow-indigo-100 scale-[1.02]' : 'border-slate-200/80 hover:border-indigo-400'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className={cn(
          'w-4 h-4 border-2 border-slate-200 !-top-2 shadow-sm transition-all',
          selected ? 'bg-indigo-600 border-white scale-125 shadow-indigo-200' : 'bg-white'
        )}
      />

      <div className="flex items-center gap-4 mb-4">
        <div
          className={cn(
            'w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110',
            selected ? 'bg-indigo-600 -rotate-3' : 'bg-indigo-600 shadow-indigo-100'
          )}
        >
          <GitBranch size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Warunki Logiczne</h3>
            <div
              className={cn(
                'px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter',
                logic === 'OR' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'
              )}
            >
              {logic}
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate mt-1">
            {count} warunków
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        {preview.length > 0 ? (
          preview.map((item, idx) => {
            const variable = VARIABLE_CONFIG[item.field];
            const op = OPERATOR_CONFIG[item.op];
            const value = item.ref
              ? VARIABLE_CONFIG[item.ref]?.label || item.ref
              : Array.isArray(item.value)
              ? `${item.value[0]}-${item.value[1]}`
              : item.value === undefined
              ? item.op === 'is_true'
                ? 'TRUE'
                : item.op === 'is_false'
                ? 'FALSE'
                : '—'
              : String(item.value);

            return (
              <div
                key={`${item.field}-${idx}`}
                className="px-3 py-2 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between group/item hover:bg-white transition-all"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Filter size={10} className="text-indigo-500 shrink-0" />
                  <span className="text-[10px] font-bold text-slate-700 truncate tracking-tight">
                    {variable?.label || item.field}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <span className="text-[9px] font-black text-slate-400">{op?.label?.split(' ')[0] || item.op}</span>
                  <span className="text-[10px] font-black text-indigo-600 tracking-tighter bg-indigo-50 px-1.5 py-0.5 rounded">
                    {value}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-3 py-2.5 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between opacity-60 italic">
            <div className="flex items-center gap-2">
              <Layers size={12} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Brak reguł</span>
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className={cn(
          'w-4 h-4 border-2 border-white !-bottom-2 shadow-md transition-all',
          selected ? 'bg-indigo-600 scale-125' : 'bg-indigo-500'
        )}
      />

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-4 -right-4"
          >
            <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-xl border-2 border-white">
              <GitBranch size={14} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
