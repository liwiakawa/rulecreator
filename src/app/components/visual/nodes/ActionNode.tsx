import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Bell, AlertCircle, BookHeart, Lightbulb, MessageSquare } from 'lucide-react';
import { ACTION_CONFIG, Action, ActionType } from '@/app/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const ActionNode = memo(({ data, selected }: NodeProps) => {
  const actions = (data?.actions as Action[]) || [];
  const first = actions[0];
  const type = (first?.type as ActionType) || 'notification';
  const config = ACTION_CONFIG[type];

  const Icons = {
    notification: Bell,
    in_app_alert: AlertCircle,
    add_memory: BookHeart,
    add_insight: Lightbulb,
  };

  const Icon = Icons[type] || Bell;

  const title =
    first && 'title' in first
      ? (first as any).title
      : first && 'content' in first
      ? (first as any).content
      : undefined;

  const body =
    first && 'body' in first
      ? (first as any).body
      : first && 'content' in first
      ? (first as any).content
      : undefined;

  return (
    <div
      className={cn(
        'px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-[24px] bg-white border-2 w-72 group transition-all duration-300 relative',
        selected ? 'border-emerald-500 shadow-emerald-100 scale-[1.02]' : 'border-slate-200/80 hover:border-emerald-400'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className={cn(
          'w-5 h-5 border-[3px] border-slate-200 !-top-2.5 shadow-sm transition-all cursor-crosshair hover:scale-125 hover:border-emerald-400 hover:bg-emerald-50 active:scale-95',
          selected ? 'bg-emerald-600 border-white scale-110 shadow-emerald-200' : 'bg-white'
        )}
      />

      <div className="flex items-center gap-4 mb-4">
        <div
          className={cn(
            'w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110',
            selected ? 'bg-emerald-600 rotate-6' : 'bg-emerald-600 shadow-emerald-100'
          )}
        >
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1.5">Akcje</h3>
          <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight truncate">
            {config?.label || type}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="px-3 py-2 bg-slate-50/50 rounded-xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight mb-1">Liczba akcji</p>
          <p className="text-[11px] font-bold text-slate-700">{actions.length}</p>
        </div>

        {(title || body) && (
          <div className="px-3 py-2 bg-slate-50/30 rounded-xl border border-slate-100 flex gap-2 items-start">
            <MessageSquare size={10} className="text-slate-400 mt-0.5 shrink-0" />
            <p className="text-[10px] font-medium text-slate-500 italic line-clamp-2 leading-relaxed">
              {title || body}
            </p>
          </div>
        )}

        {actions.length > 1 && (
          <div className="text-[9px] font-black uppercase tracking-widest text-emerald-600">
            + {actions.length - 1} dodatkowych
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-4 -right-4"
          >
            <div className="bg-emerald-600 text-white p-2 rounded-xl shadow-xl border-2 border-white">
              <Icon size={14} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
