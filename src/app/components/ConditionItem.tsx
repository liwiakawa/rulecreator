import React, { useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import {
  ConditionRule,
  VARIABLE_CONFIG,
  OPERATOR_CONFIG,
  VariableKey,
  OperatorType,
} from '@/app/types';
import { Trash2, GripVertical, Hash, Settings2 } from 'lucide-react';
import { VariableSelector, OperatorSelector } from './Selectors';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface ConditionItemProps {
  condition: ConditionRule;
  index: number;
  moveCondition: (dragIndex: number, hoverIndex: number) => void;
  onChange: (updated: ConditionRule) => void;
  onRemove: () => void;
}

const getDefaultRef = (current: VariableKey): VariableKey => {
  const keys = Object.keys(VARIABLE_CONFIG) as VariableKey[];
  return keys.find((k) => k !== current) || current;
};

const getDefaultValue = (variable: VariableKey) => {
  if (variable === 'user_plan') return 'free';
  const config = VARIABLE_CONFIG[variable];
  if (config.dataType === 'boolean') return true;
  if (config.dataType === 'string') return '';
  return 0;
};

export const ConditionItem: React.FC<ConditionItemProps> = ({ condition, index, moveCondition, onChange, onRemove }) => {
  const ref = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const variableConfig = VARIABLE_CONFIG[condition.field];
  const operatorConfig = OPERATOR_CONFIG[condition.op];

  const [{ handlerId, isOver }, drop] = useDrop({
    accept: 'condition',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        isOver: monitor.isOver(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveCondition(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'condition',
    item: () => ({ id: condition.uiId || condition.field + index, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drop(ref);
  drag(dragHandleRef);
  preview(ref);

  useEffect(() => {
    const validOperators = Object.entries(OPERATOR_CONFIG)
      .filter(([_, cfg]) => cfg.validFor.includes(variableConfig.dataType))
      .map(([key]) => key as OperatorType);

    if (!validOperators.includes(condition.op)) {
      const safeOp = validOperators[0];
      onChange({ ...condition, op: safeOp, value: undefined, ref: undefined });
    }
  }, [condition.field]);

  useEffect(() => {
    const currentOp = OPERATOR_CONFIG[condition.op];

    if (currentOp.valueKind === 'none') {
      if (condition.value !== undefined || condition.ref !== undefined) {
        onChange({ ...condition, value: undefined, ref: undefined });
      }
      return;
    }

    if (!currentOp.allowRef && condition.ref) {
      onChange({ ...condition, ref: undefined, value: getDefaultValue(condition.field) });
      return;
    }

    if (currentOp.valueKind === 'range') {
      if (!Array.isArray(condition.value)) {
        onChange({ ...condition, value: [0, 1] });
      }
      return;
    }

    if (currentOp.valueKind === 'value') {
      if (condition.value === undefined && !condition.ref) {
        onChange({ ...condition, value: getDefaultValue(condition.field) });
      }
    }
  }, [condition.op]);

  const handleVariableChange = (newVariable: VariableKey) => {
    onChange({
      ...condition,
      field: newVariable,
      value: getDefaultValue(newVariable),
      ref: undefined,
    });
  };

  const handleValueChange = (val: string, idx?: 0 | 1) => {
    if (operatorConfig.valueKind === 'range') {
      const nextRange = Array.isArray(condition.value) ? [...condition.value] : [0, 0];
      const num = parseFloat(val);
      if (!Number.isNaN(num) && idx !== undefined) {
        nextRange[idx] = num;
        onChange({ ...condition, value: nextRange as [number, number] });
      }
      return;
    }

    if (variableConfig.dataType === 'number') {
      const num = parseFloat(val);
      if (Number.isNaN(num)) return;
      onChange({ ...condition, value: num, ref: undefined });
      return;
    }

    onChange({ ...condition, value: val, ref: undefined });
  };

  const toggleValueMode = () => {
    if (!operatorConfig.allowRef) return;

    if (condition.ref) {
      onChange({ ...condition, ref: undefined, value: getDefaultValue(condition.field) });
    } else {
      onChange({ ...condition, ref: getDefaultRef(condition.field), value: undefined });
    }
  };

  const valueKind = operatorConfig.valueKind;
  const isRefMode = !!condition.ref && operatorConfig.allowRef;

  return (
    <motion.div
      ref={ref}
      layout
      data-handler-id={handlerId}
      initial={false}
      className={cn(
        'group relative flex flex-col md:flex-row items-stretch md:items-center gap-4 p-2 pl-4 bg-white border rounded-[28px] transition-all duration-300',
        isDragging
          ? 'opacity-20 scale-95 border-dashed border-indigo-300 z-50 shadow-none'
          : 'border-slate-100 hover:border-indigo-200 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]',
        isOver && !isDragging && 'border-indigo-400 bg-indigo-50/20'
      )}
    >
      <div className="flex items-center gap-3 shrink-0">
        <div
          ref={dragHandleRef}
          className="text-slate-200 cursor-grab active:cursor-grabbing p-2 hover:text-indigo-400 hover:bg-slate-50 rounded-2xl transition-all"
        >
          <GripVertical size={22} strokeWidth={2.5} />
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row items-center gap-2 md:gap-3 p-1">
        <div className="w-full md:w-[240px] relative z-40">
          <VariableSelector value={condition.field} onChange={handleVariableChange} />
        </div>

        <div className="w-full md:w-[200px] relative z-30">
          <OperatorSelector value={condition.op} variable={condition.field} onChange={(op) => onChange({ ...condition, op })} />
        </div>

        <div className="flex-1 w-full flex items-center gap-2 relative z-20">
          <div className="flex-1 h-11 flex items-center gap-1.5 bg-slate-50/50 rounded-xl border border-slate-100 p-1 pr-1.5 transition-all focus-within:bg-white focus-within:border-indigo-200 focus-within:ring-4 focus-within:ring-indigo-500/5">
            {valueKind === 'none' ? (
              <div className="flex-1 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                Bez wartości
              </div>
            ) : isRefMode ? (
              <div className="w-full h-full p-0.5">
                <VariableSelector
                  value={condition.ref as VariableKey}
                  onChange={(refKey) => onChange({ ...condition, ref: refKey, value: undefined })}
                />
              </div>
            ) : valueKind === 'range' ? (
              <div className="flex-1 flex items-center gap-1.5 h-full">
                <div className="relative flex-1 h-full">
                  <input
                    type="number"
                    className="w-full h-full bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all text-center placeholder:text-slate-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={Array.isArray(condition.value) ? condition.value[0] : 0}
                    onChange={(e) => handleValueChange(e.target.value, 0)}
                  />
                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-400 uppercase pointer-events-none">
                    MIN
                  </span>
                </div>
                <div className="w-1.5 h-px bg-slate-300 shrink-0" />
                <div className="relative flex-1 h-full">
                  <input
                    type="number"
                    className="w-full h-full bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all text-center placeholder:text-slate-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={Array.isArray(condition.value) ? condition.value[1] : 0}
                    onChange={(e) => handleValueChange(e.target.value, 1)}
                  />
                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-400 uppercase pointer-events-none">
                    MAX
                  </span>
                </div>
              </div>
            ) : variableConfig.dataType === 'boolean' ? (
              <div className="flex-1 flex items-center gap-2 h-full">
                {[
                  { label: 'Tak', value: true },
                  { label: 'Nie', value: false },
                ].map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => onChange({ ...condition, value: option.value, ref: undefined })}
                    className={cn(
                      'flex-1 h-full rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                      condition.value === option.value
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                        : 'bg-white border border-slate-200 text-slate-400 hover:text-indigo-600'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="relative w-full h-full group/val">
                {condition.field === 'user_plan' ? (
                  <select
                    className="w-full h-full pl-4 pr-10 bg-white border border-slate-200 rounded-lg text-sm font-black text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                    value={(condition.value as string) || 'free'}
                    onChange={(e) => handleValueChange(e.target.value)}
                  >
                    <option value="free">free</option>
                    <option value="premium">premium</option>
                    <option value="pro">pro</option>
                  </select>
                ) : (
                  <input
                    type={variableConfig.dataType === 'number' ? 'number' : 'text'}
                    className="w-full h-full pl-4 pr-16 bg-white border border-slate-200 rounded-lg text-sm font-black text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={condition.value as any}
                    onChange={(e) => handleValueChange(e.target.value)}
                  />
                )}
                <div className="absolute right-1 top-1 bottom-1 flex items-center px-2 bg-slate-50 border border-slate-100 rounded-md pointer-events-none group-focus-within/val:bg-indigo-50 group-focus-within/val:border-indigo-100 transition-colors">
                  <span className="text-[9px] font-black text-slate-500 group-focus-within/val:text-indigo-600 uppercase tracking-tighter">
                    {variableConfig.unit || 'val'}
                  </span>
                </div>
              </div>
            )}

            {operatorConfig.allowRef && valueKind !== 'range' && valueKind !== 'none' && (
              <button
                onClick={toggleValueMode}
                className={cn(
                  'h-full px-2 rounded-lg border transition-all flex items-center justify-center gap-1.5 group/mode shrink-0',
                  isRefMode
                    ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg shadow-indigo-200'
                    : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm'
                )}
                title={isRefMode ? 'Użyj stałej wartości' : 'Porównaj z inną zmienną'}
              >
                {isRefMode ? <Hash size={12} /> : <Settings2 size={12} />}
                <span className="text-[9px] font-black uppercase tracking-tighter">{isRefMode ? 'Ref' : 'Val'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 pr-1 border-t md:border-t-0 md:border-l border-slate-50 pt-2 md:pt-0 md:pl-3">
        <button
          onClick={onRemove}
          className="w-11 h-11 flex items-center justify-center text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
          title="Usuń warunek"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </motion.div>
  );
};
