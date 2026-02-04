import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Sparkles, ShieldCheck, Hash, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const TriggerNode = memo(({ data, selected }: NodeProps) => {
  const name = (data?.name as string) || 'Nowa reguła';
  const id = (data?.id as string) || 'rule_id';
  const enabled = data?.enabled ?? true;
  const priority = data?.priority ?? 50;
  const backgroundEnabled = !!data?.backgroundEnabled;

  return (
    <div
      className={cn(
        'px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-[24px] bg-white border-2 w-72 group transition-all duration-300 relative',
        selected ? 'border-indigo-500 shadow-indigo-100 scale-[1.02]' : 'border-slate-200/80 hover:border-indigo-400'
      )}
    >
      <div className="flex items-center gap-4 mb-4">
        <div
          className={cn(
            'w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110',
            selected ? 'bg-indigo-600 rotate-3' : 'bg-indigo-600 shadow-indigo-100'
          )}
        >
          <Sparkles size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1.5">Reguła</h3>
          <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight truncate">{name}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="px-3 py-2.5 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between group/item hover:bg-white transition-all">
          <div className="flex items-center gap-2">
            <ShieldCheck size={12} className="text-indigo-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Status</span>
          </div>
          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
            <div className={cn('w-1 h-1 rounded-full', enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300')} />
            {enabled ? 'Aktywna' : 'Off'}
          </span>
        </div>

        <div className="px-3 py-2 bg-slate-50/30 rounded-xl border border-slate-100 flex items-center gap-2">
          <Hash size={10} className="text-slate-400" />
          <p className="text-[10px] font-bold text-slate-500 tracking-tight uppercase truncate">{id}</p>
        </div>

        <div className="px-3 py-2 bg-slate-50/30 rounded-xl border border-slate-100 flex items-center gap-2">
          <Gauge size={10} className="text-slate-400" />
          <p className="text-[10px] font-bold text-slate-500 tracking-tight uppercase">Priority: {priority}</p>
        </div>

        {backgroundEnabled && (
          <div className="px-3 py-2 bg-indigo-50 rounded-xl border border-indigo-100 text-[10px] font-black uppercase tracking-widest text-indigo-700">
            Background ON
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className={cn(
          'w-5 h-5 border-[3px] border-white !-bottom-2.5 shadow-lg transition-all cursor-crosshair hover:scale-125 hover:bg-indigo-400 active:scale-95',
          selected ? 'bg-indigo-600 scale-110' : 'bg-indigo-500'
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
              <Sparkles size={14} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
