import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Schedule } from '@/app/types';

export const ConstraintNode = memo(({ data, selected }: NodeProps) => {
  const cooldown = (data?.cooldown as string | undefined) || undefined;
  const schedule = data?.schedule as Schedule | undefined;
  const scheduleEnabled = !!schedule;

  const daysCount = schedule?.days?.length || 0;
  const hoursLabel = schedule?.hours ? `${schedule.hours.from}-${schedule.hours.to}` : '24h';

  return (
    <div
      className={cn(
        'px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-[24px] bg-white border-2 w-72 group transition-all duration-300 relative',
        selected ? 'border-orange-500 shadow-orange-100' : 'border-slate-200/80 hover:border-orange-400'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className={cn(
          'w-5 h-5 border-[3px] border-slate-200 !-top-2.5 shadow-sm transition-all cursor-crosshair hover:scale-125 hover:border-orange-400 hover:bg-orange-50 active:scale-95',
          selected ? 'bg-orange-600 border-white scale-110 shadow-orange-200' : 'bg-white'
        )}
      />

      <div className="flex items-center gap-4 mb-4">
        <div
          className={cn(
            'w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110',
            selected ? 'bg-orange-600 -rotate-6' : 'bg-orange-600 shadow-orange-100'
          )}
        >
          <Clock size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1.5">Ograniczenia</h3>
          <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight truncate">
            {cooldown ? `Cooldown ${cooldown}` : 'Brak cooldown'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="px-3 py-2.5 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between group/item hover:bg-white transition-all">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Cooldown</span>
          </div>
          <span className="text-[11px] font-black text-slate-800 uppercase">{cooldown || 'OFF'}</span>
        </div>

        <div
          className={cn(
            'px-3 py-2.5 rounded-2xl border flex flex-col transition-all',
            scheduleEnabled ? 'bg-indigo-50/50 border-indigo-100 text-indigo-700' : 'bg-slate-50 border-slate-100 text-slate-400'
          )}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center gap-2">
              <div className={cn('w-1.5 h-1.5 rounded-full', scheduleEnabled ? 'bg-indigo-500' : 'bg-slate-300')} />
              <span className="text-[10px] font-black uppercase tracking-tight">Harmonogram</span>
            </div>
            <span className="text-[10px] font-black uppercase">{scheduleEnabled ? 'ON' : 'OFF'}</span>
          </div>
          {scheduleEnabled && (
            <div className="flex items-center justify-between w-full mt-1 pt-1 border-t border-indigo-100/50">
              <span className="text-[8px] font-bold uppercase tracking-tighter">{daysCount} DNI</span>
              <span className="text-[8px] font-bold uppercase tracking-tighter">{hoursLabel}</span>
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className={cn(
          'w-5 h-5 border-[3px] border-white !-bottom-2.5 shadow-lg transition-all cursor-crosshair hover:scale-125 hover:bg-orange-400 active:scale-95',
          selected ? 'bg-orange-600 scale-110' : 'bg-orange-500'
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
            <div className="bg-orange-600 text-white p-2 rounded-xl shadow-xl border-2 border-white">
              <Clock size={14} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
