import React, { useState, useRef, useEffect } from 'react';
import { VariableKey, OperatorType, VARIABLE_CONFIG, OPERATOR_CONFIG, VariableCategory } from '@/app/types';
import {
  Moon,
  Heart,
  Footprints,
  Flame,
  Activity,
  Droplets,
  ChevronDown,
  Clock,
  Calendar,
  Flag,
  Dumbbell,
  Timer,
  CheckCircle2,
  ListChecks,
  PieChart,
  NotebookPen,
  Coffee,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Moon,
  Heart,
  Footprints,
  Flame,
  Activity,
  Droplets,
  Clock,
  Calendar,
  Flag,
  Dumbbell,
  Timer,
  CheckCircle2,
  ListChecks,
  PieChart,
  NotebookPen,
  Coffee,
  ShieldCheck,
};

interface VariableSelectorProps {
  value: VariableKey;
  onChange: (metric: VariableKey) => void;
}

export const VariableSelector: React.FC<VariableSelectorProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const groupedVariables = React.useMemo(() => {
    const groups: Partial<Record<VariableCategory, VariableKey[]>> = {};
    (Object.keys(VARIABLE_CONFIG) as VariableKey[]).forEach((key) => {
      const cat = VARIABLE_CONFIG[key].category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat]!.push(key);
    });
    return groups;
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedConfig = VARIABLE_CONFIG[value];
  const SelectedIcon = ICON_MAP[selectedConfig.icon || 'Activity'] || Activity;

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-2 bg-white border rounded-[20px] transition-all outline-none h-[52px] group',
          isOpen
            ? 'border-indigo-600 ring-1 ring-indigo-600 shadow-[0_0_0_1px_#4f46e5]'
            : 'border-slate-200 hover:border-indigo-300'
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0',
              'bg-indigo-600 text-white'
            )}
          >
            <SelectedIcon size={16} />
          </div>
          <span className="font-black text-slate-800 uppercase tracking-tight truncate text-[13px]">
            {selectedConfig.label}
          </span>
        </div>
        <ChevronDown size={14} className={cn('text-slate-300 transition-transform shrink-0', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            className="absolute z-[100] top-full left-0 w-[360px] mt-3 bg-white border border-slate-200 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden max-h-[460px] flex flex-col"
          >
            <div className="p-4 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-1 h-4 bg-indigo-600 rounded-full" />
                <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">Wybierz zmienną</span>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {Object.entries(groupedVariables).map(([category, variables]) => (
                <div key={category} className="border-b border-slate-50 last:border-0">
                  <div className="px-5 py-3 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] sticky top-0 backdrop-blur-md z-10">
                    {category}
                  </div>
                  <div className="p-2 grid grid-cols-1 gap-1">
                    {variables?.map((variableKey) => {
                      const config = VARIABLE_CONFIG[variableKey];
                      const ItemIcon = ICON_MAP[config.icon || 'Activity'] || Activity;
                      const isSelected = value === variableKey;

                      return (
                        <button
                          key={variableKey}
                          onClick={() => {
                            onChange(variableKey);
                            setIsOpen(false);
                          }}
                          className={cn(
                            'w-full text-left p-3 flex items-start gap-4 rounded-2xl transition-all duration-200 group relative',
                            isSelected ? 'bg-indigo-50/80' : 'hover:bg-slate-50'
                          )}
                        >
                          <div
                            className={cn(
                              'mt-0.5 p-2 rounded-xl border transition-all shadow-sm shrink-0',
                              isSelected
                                ? 'bg-indigo-600 border-indigo-700 text-white'
                                : 'bg-white border-slate-100 text-slate-400 group-hover:bg-white group-hover:text-indigo-600'
                            )}
                          >
                            <ItemIcon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className={cn(
                                'text-[13px] font-black uppercase tracking-tight',
                                isSelected ? 'text-indigo-900' : 'text-slate-800'
                              )}
                            >
                              {config.label}
                            </div>
                            <div className="text-[11px] font-medium text-slate-400 leading-tight mt-0.5">
                              {config.description}
                            </div>
                          </div>

                          {isSelected && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-100" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface OperatorSelectorProps {
  value: OperatorType;
  variable: VariableKey;
  onChange: (op: OperatorType) => void;
}

export const OperatorSelector: React.FC<OperatorSelectorProps> = ({ value, variable, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const variableConfig = VARIABLE_CONFIG[variable];
  const dataType = variableConfig.dataType;

  const validOperators = Object.entries(OPERATOR_CONFIG)
    .filter(([_, config]) => config.validFor.includes(dataType))
    .map(([key, config]) => ({ key: key as OperatorType, ...config }));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOp = validOperators.find((op) => op.key === value) || validOperators[0];

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between px-5 py-2 bg-white border rounded-[20px] transition-all outline-none h-[52px] shadow-sm',
          isOpen
            ? 'border-indigo-600 ring-1 ring-indigo-600 shadow-[0_0_0_1px_#4f46e5]'
            : 'border-slate-200 hover:border-indigo-300'
        )}
      >
        <span className="font-black text-slate-800 uppercase tracking-tighter truncate text-[13px]">
          {selectedOp?.label}
        </span>
        <ChevronDown size={14} className={cn('text-slate-300 transition-transform shrink-0', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            className="absolute z-[100] top-full left-0 w-full mt-3 bg-white border border-slate-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden p-2"
          >
            {validOperators.map((op) => {
              const isSelected = value === op.key;
              return (
                <button
                  key={op.key}
                  onClick={() => {
                    onChange(op.key);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-200 flex items-center justify-between group',
                    isSelected
                      ? 'text-indigo-600 bg-indigo-50/80 ring-1 ring-indigo-100'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  )}
                >
                  {op.label}
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-100" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
