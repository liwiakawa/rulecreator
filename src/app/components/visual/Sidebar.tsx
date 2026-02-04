import React from 'react';
import { Zap, Bell, AlertCircle, BookHeart, Lightbulb, Clock, GitBranch, Search, Filter, Info, Moon, Heart, Footprints, Droplets, Activity, LayoutGrid, Sparkles } from 'lucide-react';
import { TriggerType, ActionType } from '@/app/types';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export const Sidebar = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState<'all' | 'triggers' | 'logic' | 'actions'>('all');

  const onDragStart = (event: React.DragEvent, nodeType: string, payload?: any) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    if (payload) {
        event.dataTransfer.setData('application/payload', JSON.stringify(payload));
    }
    event.dataTransfer.effectAllowed = 'move';
    
    // Create a ghost image for better UX
    const dragIcon = document.createElement('div');
    dragIcon.className = 'bg-white text-slate-900 px-5 py-3 rounded-2xl shadow-2xl text-[12px] font-black uppercase tracking-widest border border-slate-200/80 backdrop-blur-md z-[9999] flex items-center gap-3 ring-1 ring-slate-900/5';
    dragIcon.innerHTML = `<span class="text-indigo-600">${payload?.label || payload?.type?.replace(/_/g, ' ') || nodeType}</span>`;
    document.body.appendChild(dragIcon);
    event.dataTransfer.setDragImage(dragIcon, 0, 0);
    setTimeout(() => document.body.removeChild(dragIcon), 0);
  };

  const categories = [
    { id: 'all', label: 'Wszystkie', icon: <LayoutGrid size={12} /> },
    { id: 'triggers', label: 'Wyzwalacze', icon: <Zap size={12} /> },
    { id: 'logic', label: 'Logika', icon: <GitBranch size={12} /> },
    { id: 'actions', label: 'Akcje', icon: <Bell size={12} /> },
  ] as const;

  return (
    <div className="w-full lg:w-[320px] bg-white lg:border-r border-slate-200/60 flex flex-col h-full overflow-hidden shadow-[1px_0_0_rgba(0,0,0,0.05)] z-20 relative">
      {/* Header */}
      <div className="p-6 pb-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
                <h2 className="text-[11px] font-black text-slate-400 tracking-[0.2em] uppercase mb-1">Biblioteka</h2>
                <h3 className="text-[18px] font-black text-slate-900 tracking-tight uppercase leading-none">Bloki Reguł</h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group hover:border-indigo-100 hover:text-indigo-600 transition-all cursor-pointer">
                <Sparkles size={18} className="transition-transform group-hover:rotate-12" />
            </div>
        </div>

        <div className="space-y-4">
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Search size={14} />
                </div>
                <input 
                    type="text" 
                    placeholder="Szukaj bloku..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-[20px] text-[12px] font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-300 focus:ring-[6px] focus:ring-indigo-500/5 outline-none transition-all shadow-inner"
                />
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap border",
                            activeCategory === cat.id
                                ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200"
                                : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-slate-200"
                        )}
                    >
                        {cat.icon}
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-10 custom-scrollbar">
        
        {/* Triggers Section */}
        {(activeCategory === 'all' || activeCategory === 'triggers') && (
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-3 mb-5 px-1">
                    <div className="w-5 h-5 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                    </div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Wyzwalacze</h3>
                </div>
                <div className="space-y-3">
                    <DraggableItem 
                        label="Dane Snu" 
                        icon={<Moon size={16} />} 
                        color="indigo"
                        description="Synchronizacja zakończona"
                        onDragStart={(e) => onDragStart(e, 'trigger', { type: 'sleep_data_synced' as TriggerType, label: 'Dane Snu Zsynchronizowane' })}
                    />
                    <DraggableItem 
                        label="Dziennik" 
                        icon={<Activity size={16} />} 
                        color="indigo"
                        description="Wypełnienie logu dnia"
                        onDragStart={(e) => onDragStart(e, 'trigger', { type: 'daily_log_completed' as TriggerType, label: 'Dziennik Uzupełniony' })}
                    />
                    <DraggableItem 
                        label="Trening" 
                        icon={<Footprints size={16} />} 
                        color="indigo"
                        description="Aktywność zakończona"
                        onDragStart={(e) => onDragStart(e, 'trigger', { type: 'workout_completed' as TriggerType, label: 'Trening Ukończony' })}
                    />
                    <DraggableItem 
                        label="Stres" 
                        icon={<Zap size={16} />} 
                        color="indigo"
                        description="Wykryto wysokie napięcie"
                        onDragStart={(e) => onDragStart(e, 'trigger', { type: 'high_stress_detected' as TriggerType, label: 'Wysoki Stres Wykryty' })}
                    />
                    <DraggableItem 
                        label="Nawodnienie" 
                        icon={<Droplets size={16} />} 
                        color="indigo"
                        description="Osiągnięto dzienny cel"
                        onDragStart={(e) => onDragStart(e, 'trigger', { type: 'hydration_goal_reached' as TriggerType, label: 'Cel Nawodnienia' })}
                    />
                </div>
            </section>
        )}

        {/* Logic Section */}
        {(activeCategory === 'all' || activeCategory === 'logic') && (
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-3 mb-5 px-1">
                    <div className="w-5 h-5 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    </div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Logika & Czas</h3>
                </div>
                <div className="space-y-3">
                    <DraggableItem 
                        label="Warunek" 
                        icon={<GitBranch size={16} />} 
                        color="blue"
                        description="Operacje logiczne AND/OR"
                        onDragStart={(e) => onDragStart(e, 'condition', { logic: 'AND', count: 0 })}
                    />
                    <DraggableItem 
                        label="Limit" 
                        icon={<Clock size={16} />} 
                        color="orange"
                        description="Harmonogram i Cooldown"
                        onDragStart={(e) => onDragStart(e, 'constraint', { 
                            cooldown: { mode: 'fixed', value: 12, unit: 'hours' }, 
                            scheduleEnabled: false 
                        })}
                    />
                </div>
            </section>
        )}

        {/* Actions Section */}
        {(activeCategory === 'all' || activeCategory === 'actions') && (
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-3 mb-5 px-1">
                    <div className="w-5 h-5 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    </div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Akcje</h3>
                </div>
                <div className="space-y-3">
                    <DraggableItem 
                        label="Powiadomienie" 
                        icon={<Bell size={16} />} 
                        color="emerald"
                        description="Powiadomienie Push"
                        onDragStart={(e) => onDragStart(e, 'action', { type: 'notification' as ActionType, label: 'Nowe powiadomienie' })}
                    />
                    <DraggableItem 
                        label="Analiza" 
                        icon={<Lightbulb size={16} />} 
                        color="amber"
                        description="Generuj zdrowotny Insight"
                        onDragStart={(e) => onDragStart(e, 'action', { type: 'add_insight' as ActionType, label: 'Ciekawostka o zdrowiu' })}
                    />
                </div>
            </section>
        )}

      </div>
      
      {/* Sidebar Footer */}
      <div className="p-5 bg-slate-50/50 border-t border-slate-100">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/60 shadow-sm flex items-start gap-3">
              <div className="mt-0.5 text-indigo-500">
                  <Info size={14} />
              </div>
              <div>
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight mb-1">Jak edytować?</p>
                  <p className="text-[9px] font-medium text-slate-400 leading-snug">
                      Kliknij w umieszczony blok na płótnie, aby otworzyć Inspektor Parametrów po prawej stronie.
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
};

const DraggableItem = ({ label, icon, color, description, onDragStart }: { label: string, icon: React.ReactNode, color: string, description?: string, onDragStart: (e: React.DragEvent) => void }) => {
    const colorVariants: Record<string, { bg: string, text: string, hoverBorder: string, iconBg: string }> = {
        indigo: { bg: 'hover:bg-indigo-50/50', text: 'text-indigo-600', hoverBorder: 'hover:border-indigo-200', iconBg: 'bg-indigo-600' },
        blue: { bg: 'hover:bg-blue-50/50', text: 'text-blue-600', hoverBorder: 'hover:border-blue-200', iconBg: 'bg-blue-600' },
        orange: { bg: 'hover:bg-orange-50/50', text: 'text-orange-600', hoverBorder: 'hover:border-orange-200', iconBg: 'bg-orange-600' },
        emerald: { bg: 'hover:bg-emerald-50/50', text: 'text-emerald-600', hoverBorder: 'hover:border-emerald-200', iconBg: 'bg-emerald-600' },
        rose: { bg: 'hover:bg-rose-50/50', text: 'text-rose-600', hoverBorder: 'hover:border-rose-200', iconBg: 'bg-rose-600' },
        amber: { bg: 'hover:bg-amber-50/50', text: 'text-amber-600', hoverBorder: 'hover:border-amber-200', iconBg: 'bg-amber-600' },
    };

    const variant = colorVariants[color] || colorVariants.indigo;

    return (
        <motion.div 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
                "group flex items-center gap-4 p-3.5 bg-white border border-slate-100 rounded-[20px] cursor-grab transition-all duration-200 active:cursor-grabbing hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)]",
                variant.bg,
                variant.hoverBorder
            )}
            draggable
            onDragStart={onDragStart}
        >
            <div className={cn(
                "p-2.5 rounded-xl shrink-0 transition-all text-white shadow-lg",
                variant.iconBg,
                "shadow-[0_4px_12px_rgba(0,0,0,0.1)] group-hover:scale-110"
            )}>
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <span className="text-[12px] font-black text-slate-800 block uppercase tracking-tight leading-none mb-1 group-hover:text-slate-900 transition-colors">{label}</span>
                {description && (
                    <p className="text-[10px] font-bold text-slate-400 tracking-tight truncate group-hover:text-slate-500 transition-colors">
                        {description}
                    </p>
                )}
            </div>
        </motion.div>
    )
}
