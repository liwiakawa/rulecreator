import React from 'react';
import { Schedule, DAY_LABELS } from '@/app/types';
import { Clock, Calendar, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface ConstraintsBuilderProps {
  cooldown?: string;
  schedule?: Schedule;
  onChange: (updates: { cooldown?: string; schedule?: Schedule }) => void;
}

const parseCooldown = (value?: string) => {
  if (!value) return { amount: 24, unit: 'h' as const };
  const match = value.match(/^(\d+)([mhd])$/);
  if (!match) return { amount: 24, unit: 'h' as const };
  return { amount: parseInt(match[1], 10), unit: match[2] as 'm' | 'h' | 'd' };
};

const formatCooldown = (amount: number, unit: 'm' | 'h' | 'd') => `${amount}${unit}`;

export const ConstraintsBuilder: React.FC<ConstraintsBuilderProps> = ({ cooldown, schedule, onChange }) => {
  const cooldownEnabled = !!cooldown;
  const cooldownData = parseCooldown(cooldown);

  const scheduleEnabled = !!schedule;
  const days = schedule?.days || [];
  const hours = schedule?.hours;
  const isAllDay = !hours;

  const toggleCooldown = () => {
    if (cooldownEnabled) {
      onChange({ cooldown: undefined });
    } else {
      onChange({ cooldown: '24h' });
    }
  };

  const updateCooldownAmount = (val: number) => {
    onChange({ cooldown: formatCooldown(Math.max(1, val), cooldownData.unit) });
  };

  const updateCooldownUnit = (unit: 'm' | 'h' | 'd') => {
    onChange({ cooldown: formatCooldown(cooldownData.amount, unit) });
  };

  const toggleSchedule = () => {
    if (scheduleEnabled) {
      onChange({ schedule: undefined });
    } else {
      onChange({
        schedule: {
          hours: { from: 9, to: 21 },
          days: [1, 2, 3, 4, 5],
          excludeWeekends: false,
        },
      });
    }
  };

  const toggleDay = (day: number) => {
    const newDays = days.includes(day) ? days.filter((d) => d !== day) : [...days, day];
    onChange({ schedule: { ...schedule!, days: newDays } });
  };

  const setDayPreset = (preset: 'all' | 'weekdays' | 'weekend') => {
    let newDays: number[] = [];
    if (preset === 'all') newDays = [1, 2, 3, 4, 5, 6, 7];
    if (preset === 'weekdays') newDays = [1, 2, 3, 4, 5];
    if (preset === 'weekend') newDays = [6, 7];
    onChange({ schedule: { ...schedule!, days: newDays } });
  };

  const updateHours = (field: 'from' | 'to', value: number) => {
    const safeValue = Math.min(23, Math.max(0, value));
    onChange({
      schedule: {
        ...schedule!,
        hours: { ...(schedule?.hours || { from: 9, to: 21 }), [field]: safeValue },
      },
    });
  };

  const toggleAllDay = () => {
    if (!schedule) return;
    if (isAllDay) {
      onChange({ schedule: { ...schedule, hours: { from: 9, to: 21 } } });
    } else {
      const { hours: _hours, ...rest } = schedule;
      onChange({ schedule: { ...rest } });
    }
  };

  const toggleExcludeWeekends = () => {
    onChange({ schedule: { ...schedule!, excludeWeekends: !schedule?.excludeWeekends } });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 items-stretch">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-2 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <Clock size={16} />
            </div>
            <span className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Cooldown</span>
          </div>
          <button
            onClick={toggleCooldown}
            className={cn(
              'px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto',
              cooldownEnabled
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-100'
                : 'bg-slate-100 text-slate-400 border border-slate-200'
            )}
          >
            {cooldownEnabled ? 'Aktywny' : 'Wyłączony'}
            <div className={cn('w-2 h-2 rounded-full', cooldownEnabled ? 'bg-white' : 'bg-slate-300')} />
          </button>
        </div>

        <div
          className={cn(
            'bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-200 shadow-[0_20px_40px_rgba(0,0,0,0.04)] flex flex-col relative overflow-hidden group hover:border-indigo-300 transition-all duration-500 min-h-[240px] md:min-h-[300px]',
            !cooldownEnabled && 'opacity-40 grayscale-[0.2] pointer-events-none'
          )}
        >
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col gap-6">
            <div className="flex items-center justify-center pt-2">
              <div className="relative group/input w-full max-w-[220px]">
                <div className="flex items-center border border-slate-200 rounded-3xl overflow-hidden shadow-sm group-focus-within/input:ring-4 group-focus-within/input:ring-indigo-600/5 group-focus-within/input:border-indigo-600 transition-all bg-white h-16">
                  <input
                    type="number"
                    min={1}
                    className="w-full px-5 py-2 text-2xl font-black text-slate-900 outline-none text-center bg-transparent"
                    value={cooldownData.amount}
                    onChange={(e) => updateCooldownAmount(parseInt(e.target.value, 10) || 1)}
                  />
                  <div className="border-l border-slate-100 bg-slate-50/50 h-full flex items-center justify-center w-20 shrink-0 relative hover:bg-slate-100 transition-colors cursor-pointer group/select">
                    <select
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      value={cooldownData.unit}
                      onChange={(e) => updateCooldownUnit(e.target.value as 'm' | 'h' | 'd')}
                    >
                      <option value="m">Min</option>
                      <option value="h">Godz</option>
                      <option value="d">Dni</option>
                    </select>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[10px] font-black text-slate-800 uppercase">
                        {cooldownData.unit === 'm' ? 'Min' : cooldownData.unit === 'h' ? 'Godz' : 'Dni'}
                      </span>
                      <span className="text-[10px] text-slate-400">▼</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { val: 1, u: 'h', label: '1 Godzina' },
                { val: 12, u: 'h', label: '12 Godzin' },
                { val: 1, u: 'd', label: '1 Dzień' },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => onChange({ cooldown: formatCooldown(preset.val, preset.u as any) })}
                  className="py-3 px-1 text-[10px] font-black uppercase tracking-widest bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-300 hover:bg-white hover:text-indigo-600 hover:shadow-md transition-all text-slate-500 leading-tight text-center"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="mt-auto flex items-start gap-3 text-[11px] text-slate-500 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 leading-relaxed">
              <Info size={16} className="mt-0.5 shrink-0 text-indigo-400" />
              <p>Minimalny czas, jaki musi upłynąć od ostatniego wykonania reguły.</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-2 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <Calendar size={16} />
            </div>
            <span className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Harmonogram</span>
          </div>
          <button
            onClick={toggleSchedule}
            className={cn(
              'px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto',
              scheduleEnabled
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-100'
                : 'bg-slate-100 text-slate-400 border border-slate-200'
            )}
          >
            {scheduleEnabled ? 'Aktywny' : 'Wyłączony'}
            <div className={cn('w-2 h-2 rounded-full', scheduleEnabled ? 'bg-white' : 'bg-slate-300')} />
          </button>
        </div>

        <div
          className={cn(
            'bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-200 shadow-[0_20px_40px_rgba(0,0,0,0.04)] flex flex-col relative overflow-hidden group hover:border-indigo-300 transition-all duration-500 min-h-[260px] md:min-h-[300px]',
            !scheduleEnabled && 'opacity-40 grayscale-[0.2] pointer-events-none'
          )}
        >
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dni tygodnia</span>
                <div className="h-1 w-8 bg-indigo-500 rounded-full" />
              </div>

              <div className="flex flex-wrap bg-slate-50 p-1 rounded-2xl border border-slate-200">
                <button
                  onClick={() => setDayPreset('weekdays')}
                  className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl hover:bg-white hover:shadow-sm text-slate-500 hover:text-indigo-600 transition-all"
                >
                  Pn-Pt
                </button>
                <button
                  onClick={() => setDayPreset('weekend')}
                  className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl hover:bg-white hover:shadow-sm text-slate-500 hover:text-indigo-600 transition-all"
                >
                  Weekend
                </button>
                <button
                  onClick={() => setDayPreset('all')}
                  className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl hover:bg-white hover:shadow-sm text-slate-500 hover:text-indigo-600 transition-all"
                >
                  Wszystkie
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {Object.entries(DAY_LABELS).map(([key, data]) => {
                const dayKey = Number(key);
                const isSelected = days.includes(dayKey);
                return (
                  <button
                    key={key}
                    onClick={() => toggleDay(dayKey)}
                    className={cn(
                      'h-10 rounded-2xl text-[11px] font-black flex items-center justify-center transition-all duration-300 border-2',
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-lg shadow-indigo-100'
                        : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200 hover:text-indigo-600'
                    )}
                  >
                    {data.short}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px w-full bg-slate-100 my-2 relative">
            <div className="absolute inset-x-0 top-0 border-t border-dashed border-slate-200" />
          </div>

          <div className="space-y-4 pt-4 mt-auto">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Okno czasowe</span>
                <div className="h-1 w-8 bg-indigo-500 rounded-full" />
              </div>
              <button
                onClick={toggleAllDay}
                className={cn(
                  'text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl border transition-all flex items-center gap-2 shadow-sm',
                  isAllDay
                    ? 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-100'
                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-white'
                )}
              >
                Cała doba
                {isAllDay && <CheckCircle2 size={12} />}
              </button>
            </div>

            {!isAllDay ? (
              <div className="flex items-center gap-3 bg-slate-50/80 p-2 rounded-3xl border border-slate-100 shadow-inner">
                <div className="relative flex-1 group/time bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden h-14">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/time:text-indigo-500 transition-colors pointer-events-none">
                    <Clock size={16} />
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={hours?.from ?? 9}
                    onChange={(e) => updateHours('from', parseInt(e.target.value, 10) || 0)}
                    className="w-full pl-10 pr-4 py-1 text-base font-black text-slate-900 outline-none text-center h-full tracking-tight"
                  />
                </div>
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                  <span className="text-[10px] font-black text-slate-300">➜</span>
                </div>
                <div className="relative flex-1 group/time bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden h-14">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/time:text-indigo-500 transition-colors pointer-events-none">
                    <Clock size={16} />
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={hours?.to ?? 21}
                    onChange={(e) => updateHours('to', parseInt(e.target.value, 10) || 0)}
                    className="w-full pl-10 pr-4 py-1 text-base font-black text-slate-900 outline-none text-center h-full tracking-tight"
                  />
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-14 bg-indigo-50/50 border-2 border-dashed border-indigo-200 rounded-3xl text-[11px] font-black uppercase tracking-widest text-indigo-700 flex items-center justify-center gap-3 shadow-sm"
              >
                <CheckCircle2 size={18} className="text-indigo-600" />
                Aktywne przez całą dobę (24H)
              </motion.div>
            )}

            <button
              type="button"
              onClick={toggleExcludeWeekends}
              className={cn(
                'w-full text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-2xl border transition-all flex items-center justify-center gap-2 shadow-sm',
                schedule?.excludeWeekends
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-white'
              )}
            >
              {schedule?.excludeWeekends ? 'Wyklucz weekendy' : 'Uwzględnij weekendy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
