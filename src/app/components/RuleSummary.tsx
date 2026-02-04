import React from 'react';
import {
  TriggerRule,
  ConditionGroup,
  ConditionRule,
  VARIABLE_CONFIG,
  OPERATOR_CONFIG,
  ACTION_CONFIG,
} from '@/app/types';

const describeRule = (rule: ConditionRule) => {
  const variable = VARIABLE_CONFIG[rule.field];
  const operator = OPERATOR_CONFIG[rule.op];
  const base = `${variable?.label || rule.field} ${operator?.label || rule.op}`;

  if (rule.ref) {
    const refLabel = VARIABLE_CONFIG[rule.ref]?.label || rule.ref;
    return `${base} ${refLabel}`;
  }

  if (operator?.valueKind === 'none') {
    return base;
  }

  if (Array.isArray(rule.value)) {
    return `${base} ${rule.value[0]} - ${rule.value[1]}`;
  }

  return `${base} ${rule.value ?? ''}`.trim();
};

const describeGroup = (group: ConditionGroup): string => {
  const connector = group.operator === 'AND' ? 'oraz' : 'lub';
  const parts = group.rules.map((item) => {
    if ('rules' in item) {
      return `(${describeGroup(item)})`;
    }
    return describeRule(item);
  });
  return parts.join(` ${connector} `);
};

const dayLabel = (day: number) => {
  const map: Record<number, string> = {
    1: 'poniedziałek',
    2: 'wtorek',
    3: 'środa',
    4: 'czwartek',
    5: 'piątek',
    6: 'sobota',
    7: 'niedziela',
  };
  return map[day] || String(day);
};

const describeSchedule = (rule: TriggerRule) => {
  if (!rule.schedule) return 'Bez ograniczeń czasowych';
  const days = rule.schedule.days?.length
    ? `W dni: ${rule.schedule.days.map(dayLabel).join(', ')}`
    : 'W każdy dzień';
  const hours = rule.schedule.hours
    ? `w godzinach ${rule.schedule.hours.from}:00–${rule.schedule.hours.to}:00`
    : 'przez całą dobę';
  const weekends = rule.schedule.excludeWeekends ? ', z wykluczeniem weekendów' : '';
  return `${days}, ${hours}${weekends}.`;
};

const describeActions = (rule: TriggerRule) => {
  return rule.actions
    .map((action) => {
      const config = ACTION_CONFIG[action.type];
      if (action.type === 'notification') {
        return `Wyślij powiadomienie „${action.title || 'bez tytułu'}”`;
      }
      if (action.type === 'in_app_alert') {
        return `Pokaż alert „${action.title || 'bez tytułu'}” (${action.style || 'info'})`;
      }
      if (action.type === 'add_memory') {
        return `Dodaj memory (${action.category})`;
      }
      if (action.type === 'add_insight') {
        return `Dodaj insight „${action.title || 'bez tytułu'}” (${action.priority || 'medium'})`;
      }
      return config.label;
    })
    .join('. ');
};

export const RuleSummary: React.FC<{ rules: TriggerRule[] }> = ({ rules }) => {
  return (
    <div className="space-y-6 text-sm text-slate-700">
      {rules.map((rule) => (
        <div key={rule.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-black text-slate-900">{rule.name}</div>
              <div className="text-xs text-slate-400 font-mono">{rule.id}</div>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${rule.enabled ? 'text-emerald-600' : 'text-slate-400'}`}>
              {rule.enabled ? 'Aktywna' : 'Wyłączona'}
            </span>
          </div>

          <div className="space-y-2">
            <p>
              <span className="font-semibold">Jeśli</span> {describeGroup(rule.conditions)},{' '}
              <span className="font-semibold">to</span> {describeActions(rule)}.
            </p>
            <p>
              <span className="font-semibold">Ograniczenia:</span> cooldown {rule.cooldown || 'brak'}. {describeSchedule(rule)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
