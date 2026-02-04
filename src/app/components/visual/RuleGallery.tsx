import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Moon, Droplets, Zap, Activity, Bell, Lightbulb, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TriggerType, ActionType } from '@/app/types';

interface Template {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  nodes: any[];
  edges: any[];
}

const TEMPLATES: Template[] = [
  {
    id: 'sleep-booster',
    title: 'Inteligentny Sen',
    description: 'Jeśli spałeś za krótko, otrzymaj poradę o lepszej higienie snu.',
    icon: <Moon size={20} />,
    color: 'indigo',
    nodes: [
      { id: 't-1', type: 'trigger', position: { x: 100, y: 100 }, data: { type: 'sleep_data_synced', label: 'Dane Snu Zsynchronizowane' } },
      { id: 'c-1', type: 'condition', position: { x: 100, y: 300 }, data: { logic: 'AND', items: [{ metric: 'sleep_hours', operator: 'lt', value: { type: 'static', value: 7 } }] } },
      { id: 'a-1', type: 'action', position: { x: 100, y: 500 }, data: { type: 'add_insight', label: 'Porada dotycząca snu' } },
    ],
    edges: [
      { id: 'e1', source: 't-1', target: 'c-1', animated: true },
      { id: 'e2', source: 'c-1', target: 'a-1', animated: true },
    ]
  },
  {
    id: 'hydration-check',
    title: 'Strażnik Nawodnienia',
    description: 'Powiadomienie push, gdy nie osiągniesz dziennego celu wody.',
    icon: <Droplets size={20} />,
    color: 'blue',
    nodes: [
      { id: 't-1', type: 'trigger', position: { x: 100, y: 100 }, data: { type: 'daily_log_completed', label: 'Log Dnia Wypełniony' } },
      { id: 'c-1', type: 'condition', position: { x: 100, y: 300 }, data: { logic: 'AND', items: [{ metric: 'water_intake', operator: 'lt', value: { type: 'static', value: 2000 } }] } },
      { id: 'a-1', type: 'action', position: { x: 100, y: 500 }, data: { type: 'notification', label: 'Pij więcej wody!' } },
    ],
    edges: [
      { id: 'e1', source: 't-1', target: 'c-1', animated: true },
      { id: 'e2', source: 'c-1', target: 'a-1', animated: true },
    ]
  },
  {
    id: 'stress-relief',
    title: 'Redukcja Stresu',
    description: 'Automatyczna sugestia relaksu przy wykryciu wysokiego tętna.',
    icon: <Zap size={20} />,
    color: 'rose',
    nodes: [
      { id: 't-1', type: 'trigger', position: { x: 100, y: 100 }, data: { type: 'high_stress_detected', label: 'Wysoki Stres Wykryty' } },
      { id: 'a-1', type: 'action', position: { x: 100, y: 300 }, data: { type: 'in_app_alert', label: 'Czas na oddech' } },
    ],
    edges: [
      { id: 'e1', source: 't-1', target: 'a-1', animated: true },
    ]
  }
];

interface RuleGalleryProps {
  onSelect: (nodes: any[], edges: any[]) => void;
  onClose: () => void;
}

export const RuleGallery: React.FC<RuleGalleryProps> = ({ onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[32px] shadow-[0_32px_64px_rgba(0,0,0,0.2)] w-full max-w-2xl overflow-hidden border border-slate-200"
      >
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                    <Sparkles size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Galeria Szablonów</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wybierz punkt wyjścia dla swojej reguły</p>
                </div>
            </div>
            <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors font-black text-[10px] uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-200"
            >
                Zamknij
            </button>
        </div>

        <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
            {TEMPLATES.map((template) => (
                <button
                    key={template.id}
                    onClick={() => {
                        onSelect(template.nodes, template.edges);
                        onClose();
                    }}
                    className="w-full text-left group relative p-6 bg-white border border-slate-100 rounded-[24px] hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all flex items-center gap-6"
                >
                    <div className={cn(
                        "w-16 h-16 rounded-[20px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                        template.color === 'indigo' ? "bg-indigo-50 text-indigo-600" :
                        template.color === 'blue' ? "bg-blue-50 text-blue-600" :
                        "bg-rose-50 text-rose-600"
                    )}>
                        {template.icon}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-1 group-hover:text-indigo-600 transition-colors">
                            {template.title}
                        </h3>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed">
                            {template.description}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <ChevronRight size={20} />
                    </div>
                </button>
            ))}
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100">
            <div className="flex items-center gap-3 text-slate-400">
                <Activity size={16} />
                <p className="text-[11px] font-bold">Więcej szablonów pojawi się wkrótce w bibliotece AI.</p>
            </div>
        </div>
      </motion.div>
    </div>
  );
};
