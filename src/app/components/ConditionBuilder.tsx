import React from 'react';
import { ConditionGroup, ConditionRule } from '@/app/types';
import { ConditionItem } from './ConditionItem';
import { Plus, FolderPlus, Trash2, GitMerge, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ConditionNodeProps {
  node: ConditionGroup | ConditionRule;
  index?: number;
  moveCondition?: (dragIndex: number, hoverIndex: number) => void;
  onChange: (updatedNode: ConditionGroup | ConditionRule) => void;
  onRemove: () => void;
  depth?: number;
  isRoot?: boolean;
}

const isGroup = (node: ConditionGroup | ConditionRule): node is ConditionGroup => {
  return typeof (node as ConditionGroup).operator === 'string' && Array.isArray((node as ConditionGroup).rules);
};

export const ConditionNode: React.FC<ConditionNodeProps> = ({
  node,
  index = 0,
  moveCondition = () => {},
  onChange,
  onRemove,
  depth = 0,
  isRoot = false,
}) => {
  if (!isGroup(node)) {
    return (
      <ConditionItem
        condition={node}
        index={index}
        moveCondition={moveCondition}
        onChange={onChange}
        onRemove={onRemove}
      />
    );
  }

  const handleLogicChange = () => {
    onChange({
      ...node,
      operator: node.operator === 'AND' ? 'OR' : 'AND',
    });
  };

  const addChildCondition = () => {
    const newCondition: ConditionRule = {
      uiId: crypto.randomUUID(),
      field: 'steps',
      op: 'gt',
      value: 5000,
    };
    onChange({
      ...node,
      rules: [...node.rules, newCondition],
    });
  };

  const addChildGroup = () => {
    const newGroup: ConditionGroup = {
      uiId: crypto.randomUUID(),
      operator: 'AND',
      rules: [
        {
          uiId: crypto.randomUUID(),
          field: 'current_hour',
          op: 'gte',
          value: 18,
        },
      ],
    };
    onChange({
      ...node,
      rules: [...node.rules, newGroup],
    });
  };

  const updateChild = (idx: number, updatedChild: ConditionGroup | ConditionRule) => {
    const newRules = [...node.rules];
    newRules[idx] = updatedChild;
    onChange({ ...node, rules: newRules });
  };

  const removeChild = (idx: number) => {
    const newRules = node.rules.filter((_, i) => i !== idx);
    onChange({ ...node, rules: newRules });
  };

  const moveChild = (dragIndex: number, hoverIndex: number) => {
    const dragItem = node.rules[dragIndex];
    const newRules = [...node.rules];
    newRules.splice(dragIndex, 1);
    newRules.splice(hoverIndex, 0, dragItem);
    onChange({ ...node, rules: newRules });
  };

  const isAnd = node.operator === 'AND';

  return (
    <div className={cn('flex flex-col relative', !isRoot && 'ml-4 md:ml-10')}>
      {!isRoot && (
        <div className="absolute -left-6 md:-left-8 top-0 bottom-8 w-px bg-slate-200">
          <div className="absolute top-8 left-0 w-6 md:w-8 h-px bg-slate-200" />
          <div className="absolute -left-[3px] top-8 w-1.5 h-1.5 rounded-full bg-slate-300" />
        </div>
      )}

      <div
        className={cn(
          'rounded-[32px] transition-all duration-500',
          !isRoot &&
            'bg-white border border-slate-200 p-4 md:p-6 mb-4 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:border-indigo-200'
        )}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center">
            <div className="flex items-center h-10 p-1 rounded-2xl bg-slate-100 border border-slate-200 shadow-inner transition-all">
              <button
                onClick={() => node.operator !== 'AND' && handleLogicChange()}
                className={cn(
                  'px-4 h-full text-[10px] font-black uppercase tracking-widest rounded-xl transition-all',
                  isAnd
                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-400 hover:text-slate-600'
                )}
              >
                ORAZ
              </button>
              <button
                onClick={() => node.operator !== 'OR' && handleLogicChange()}
                className={cn(
                  'px-4 h-full text-[10px] font-black uppercase tracking-widest rounded-xl transition-all',
                  !isAnd
                    ? 'bg-white text-amber-600 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-400 hover:text-slate-600'
                )}
              >
                LUB
              </button>
            </div>

            {isRoot && (
              <div className="ml-5 flex items-center gap-2.5 text-slate-400">
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                  <LayoutGrid size={16} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">Logika Główna</span>
              </div>
            )}
          </div>

          <div className="flex-1 h-px bg-gradient-to-r from-slate-200/50 to-transparent mx-2" />

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-50 rounded-2xl border border-slate-200 p-1 shadow-inner relative z-50">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addChildCondition();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all text-[11px] font-black uppercase tracking-tight"
                title="Dodaj warunek"
              >
                <Plus size={14} className="text-indigo-500" />
                <span className="hidden sm:inline">Warunek</span>
              </button>
              <div className="w-px h-5 bg-slate-200 self-center mx-1" />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addChildGroup();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all text-[11px] font-black uppercase tracking-tight"
                title="Dodaj podgrupę"
              >
                <FolderPlus size={14} className="text-indigo-500" />
                <span className="hidden sm:inline">Podgrupa</span>
              </button>
            </div>

            {!isRoot && (
              <button
                onClick={onRemove}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 shadow-sm hover:shadow-rose-100"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {node.rules.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center gap-4 text-slate-400 border-2 border-dashed border-slate-200 rounded-[24px] bg-slate-50/30"
              >
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-100 text-slate-300">
                  <GitMerge size={24} />
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Pusta Grupa</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-1 italic">
                    Dodaj warunek, aby kontynuować budowanie logiki.
                  </p>
                </div>
              </motion.div>
            ) : (
              node.rules.map((child, childIndex) => (
                <motion.div
                  key={child.uiId || `rule-${depth}-${childIndex}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  layout
                >
                  <ConditionNode
                    node={child}
                    index={childIndex}
                    moveCondition={moveChild}
                    onChange={(updated) => updateChild(childIndex, updated)}
                    onRemove={() => removeChild(childIndex)}
                    depth={depth + 1}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
