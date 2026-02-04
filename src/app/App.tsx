import React, { useEffect, useMemo, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { RuleEditor } from '@/app/components/RuleEditor';
import VisualRuleEditor from '@/app/components/visual/VisualRuleEditor';
import { JsonPreview } from '@/app/components/JsonPreview';
import { RuleSummary } from '@/app/components/RuleSummary';
import { RuleGenerator } from '@/app/components/RuleGenerator';
import { RuleListPanel } from '@/app/components/RuleListPanel';
import { Modal } from '@/app/components/ui/Modal';
import { Toaster, toast } from 'sonner';
import { TriggerRule, DEFAULT_RULE } from './types';
import { Layout, PenTool, Copy, Check, Code, Plus, Save, Sparkles, Trash2, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthGate } from '@/app/components/AuthGate';
import { supabase } from '@/lib/supabaseClient';
import { checkIsAdmin, deleteRule, fetchRules, upsertRule } from '@/lib/rulesApi';

const createEmptyRule = (): TriggerRule => ({
  id: `new_rule_${Date.now()}`,
  name: 'Nowa reguła',
  enabled: true,
  priority: 50,
  conditions: {
    operator: 'AND',
    rules: [],
  },
  cooldown: '24h',
  actions: [
    {
      type: 'notification',
      title: '',
      body: '',
      targetView: '/home',
    },
  ],
  backgroundEnabled: false,
});

const normalizeRuleId = (base: string, existing: Set<string>) => {
  let next = base;
  let i = 1;
  while (existing.has(next)) {
    next = `${base}_${i}`;
    i += 1;
  }
  return next;
};

export default function App() {
  const [viewMode, setViewMode] = useState<'form' | 'visual'>('form');
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'summary' | 'json'>('summary');
  const [isCopied, setIsCopied] = useState(false);
  const [rules, setRules] = useState<TriggerRule[]>([]);
  const [activeRuleId, setActiveRuleId] = useState<string | null>(null);
  const [dirtyRuleIds, setDirtyRuleIds] = useState<string[]>([]);
  const [savingRuleIds, setSavingRuleIds] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingRules, setLoadingRules] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [showRulePanel, setShowRulePanel] = useState(false);

  const activeRule = useMemo(
    () => (activeRuleId ? rules.find((r) => r.id === activeRuleId) : rules[0]),
    [rules, activeRuleId]
  );

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!session) return;
      setLoadingRules(true);
      try {
        const rows = await fetchRules();
        if (rows.length === 0) {
          const initial = { ...DEFAULT_RULE, id: 'steps_reminder_evening' } as TriggerRule;
          setRules([initial]);
          setActiveRuleId(initial.id);
        } else {
          const loaded = rows.map((row) => {
            const rule = row.rule || createEmptyRule();
            return {
              ...rule,
              id: row.rule_id || rule.id,
              name: row.name || rule.name,
              enabled: row.enabled ?? rule.enabled,
            } as TriggerRule;
          });
          setRules(loaded);
          setActiveRuleId(loaded[0]?.id || null);
        }
      } catch (err: any) {
        toast.error(err.message || 'Nie udało się pobrać reguł');
      } finally {
        setLoadingRules(false);
      }
    };

    load();
  }, [session]);

  useEffect(() => {
    const resolveAdmin = async () => {
      if (!session) return;
      try {
        const admin = await checkIsAdmin(session.user.id);
        setIsAdmin(admin);
      } catch (err: any) {
        setIsAdmin(false);
      }
    };

    resolveAdmin();
  }, [session]);

  const markDirty = (ruleId: string) => {
    setDirtyRuleIds((prev) => (prev.includes(ruleId) ? prev : [...prev, ruleId]));
  };

  const clearDirty = (ruleId: string) => {
    setDirtyRuleIds((prev) => prev.filter((id) => id !== ruleId));
  };

  const handleUpdateRule = (updatedRule: TriggerRule) => {
    setRules((prev) => prev.map((r) => (r.id === updatedRule.id ? updatedRule : r)));
    markDirty(updatedRule.id);
  };

  const handleAddRule = () => {
    const newRule = createEmptyRule();
    setRules((prev) => [newRule, ...prev]);
    setActiveRuleId(newRule.id);
    markDirty(newRule.id);
  };

  const handleDuplicateRule = (ruleId: string) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;
    const existing = new Set(rules.map((r) => r.id));
    const newId = normalizeRuleId(`${rule.id}_copy`, existing);
    const duplicated: TriggerRule = {
      ...rule,
      id: newId,
      name: `${rule.name} (kopia)`,
    };
    setRules((prev) => [duplicated, ...prev]);
    setActiveRuleId(duplicated.id);
    markDirty(duplicated.id);
  };

  const handleGenerateRule = (rule: TriggerRule) => {
    setRules((prev) => [rule, ...prev]);
    setActiveRuleId(rule.id);
    markDirty(rule.id);
    setIsAiModalOpen(false);
    toast.success('Dodano wygenerowaną regułę');
  };

  const saveRule = async (rule: TriggerRule) => {
    if (!isAdmin) {
      toast.error('Tylko admin może zapisywać reguły');
      return;
    }
    setSavingRuleIds((prev) => [...prev, rule.id]);
    try {
      await upsertRule(rule);
      clearDirty(rule.id);
      toast.success('Reguła zapisana');
    } catch (err: any) {
      toast.error(err.message || 'Błąd zapisu');
    } finally {
      setSavingRuleIds((prev) => prev.filter((id) => id !== rule.id));
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!isAdmin) {
      toast.error('Tylko admin może usuwać reguły');
      return;
    }
    if (!window.confirm('Na pewno usunąć tę regułę?')) return;
    try {
      await deleteRule(ruleId);
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      setActiveRuleId((prev) => (prev === ruleId ? rules.find((r) => r.id !== ruleId)?.id || null : prev));
      toast.success('Reguła usunięta');
    } catch (err: any) {
      toast.error(err.message || 'Nie udało się usunąć reguły');
    }
  };

  const copyToClipboard = async () => {
    const text = JSON.stringify(rules, null, 2);

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        toast.success('JSON skopiowany do schowka');
        setTimeout(() => setIsCopied(false), 2000);
        return;
      } catch (err) {
        // fall through
      }
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '0';
      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        setIsCopied(true);
        toast.success('JSON skopiowany');
        setTimeout(() => setIsCopied(false), 2000);
        return;
      }
    } catch (err) {
      // ignore
    }

    const jsonContainer = document.getElementById('live-json-output');
    const pre = jsonContainer?.querySelector('pre');

    if (pre) {
      const range = document.createRange();
      range.selectNodeContents(pre);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      toast.info('Zaznaczono tekst. Użyj Ctrl+C aby skopiować.');
    } else {
      toast.error('Nie udało się skopiować. Spróbuj zaznaczyć tekst ręcznie.');
    }
  };

  const activeIsDirty = activeRule ? dirtyRuleIds.includes(activeRule.id) : false;
  const activeIsSaving = activeRule ? savingRuleIds.includes(activeRule.id) : false;

  return (
    <DndProvider backend={HTML5Backend}>
      <AuthGate>
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col overflow-hidden">
          <Toaster position="bottom-right" />

          <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0 z-10 relative shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="font-semibold text-slate-900 leading-tight">Edytor Reguł</h1>
                <p className="text-xs text-slate-500">Trigger Rule Builder</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setShowRulePanel((prev) => !prev)}
                className="lg:hidden p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm"
                title="Reguły"
              >
                <List size={18} />
              </button>

              <div className="hidden md:flex items-center gap-2">
                <span
                  className={cn(
                    'text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border',
                    isAdmin ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-slate-400 border-slate-200'
                  )}
                >
                  {isAdmin ? 'Admin' : 'Read-only'}
                </span>
              </div>

              <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex">
                <button
                  onClick={() => setViewMode('form')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    viewMode === 'form' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <PenTool size={14} /> <span className="hidden md:inline">Edytor</span>
                </button>
                <button
                  onClick={() => setViewMode('visual')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    viewMode === 'visual'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Layout size={14} /> <span className="hidden md:inline">Wizualny</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsAiModalOpen(true)}
                  className="p-1.5 md:p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm"
                  title="Generator AI"
                >
                  <Sparkles size={18} />
                </button>

                <button
                  onClick={copyToClipboard}
                  className={cn(
                    'flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border',
                    isCopied
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700'
                  )}
                >
                  {isCopied ? <Check size={14} /> : <Copy size={14} />}
                  <span className="hidden lg:inline">{isCopied ? 'Skopiowano JSON' : 'Kopiuj JSON'}</span>
                  <span className="lg:hidden">Kopiuj</span>
                </button>

                <button
                  onClick={() => setIsJsonModalOpen(true)}
                  className="p-1.5 md:p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm"
                  title="Podgląd"
                >
                  <Code size={18} />
                </button>

                {activeRule && (
                  <button
                    onClick={() => saveRule(activeRule)}
                    disabled={!activeIsDirty || activeIsSaving || !isAdmin}
                    className={cn(
                      'flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border',
                      !isAdmin
                        ? 'bg-slate-100 text-slate-400 border-slate-200'
                        : activeIsSaving
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : activeIsDirty
                        ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    )}
                  >
                    <Save size={14} />
                    <span className="hidden lg:inline">
                      {activeIsSaving ? 'Zapis...' : activeIsDirty ? 'Zapisz' : 'Zapisano'}
                    </span>
                  </button>
                )}

                {activeRule && (
                  <button
                    onClick={() => handleDeleteRule(activeRule.id)}
                    disabled={!isAdmin}
                    className={cn(
                      'p-1.5 md:p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm',
                      !isAdmin && 'opacity-40 cursor-not-allowed'
                    )}
                    title="Usuń regułę"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          </header>

          <div className="flex flex-1 overflow-hidden">
            <RuleListPanel
              rules={rules}
              activeRuleId={activeRuleId}
              onSelect={(id) => {
                setActiveRuleId(id);
                setShowRulePanel(false);
              }}
              onAdd={() => {
                handleAddRule();
                setShowRulePanel(false);
              }}
              onDuplicate={handleDuplicateRule}
              onDelete={handleDeleteRule}
              isAdmin={isAdmin}
              userEmail={session?.user?.email || null}
              onSignOut={async () => {
                if (!supabase) return;
                await supabase.auth.signOut();
              }}
              className={cn('hidden lg:flex', showRulePanel && 'flex fixed inset-0 z-40 w-full')}
            />

            <main className="flex-1 overflow-hidden relative">
              {loadingRules ? (
                <div className="flex-1 flex items-center justify-center text-slate-400">Ładowanie reguł...</div>
              ) : viewMode === 'form' ? (
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50">
                  <div className="max-w-4xl mx-auto">
                    {activeRule ? (
                      <RuleEditor key={activeRule.id} rule={activeRule} onChange={handleUpdateRule} />
                    ) : (
                      <div className="text-center py-20 text-slate-400">
                        <p>Brak reguł. Dodaj nową regułę, aby rozpocząć.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-hidden bg-slate-100 relative">
                  {activeRule && <VisualRuleEditor rule={activeRule} onChange={handleUpdateRule} />}
                </div>
              )}
            </main>
          </div>

          <Modal isOpen={isJsonModalOpen} onClose={() => setIsJsonModalOpen(false)} title="Podgląd reguł">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setPreviewMode('summary')}
                className={cn(
                  'px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all',
                  previewMode === 'summary'
                    ? 'bg-indigo-600 text-white border-indigo-700'
                    : 'bg-white text-slate-400 border-slate-200'
                )}
              >
                Opis
              </button>
              <button
                onClick={() => setPreviewMode('json')}
                className={cn(
                  'px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all',
                  previewMode === 'json'
                    ? 'bg-indigo-600 text-white border-indigo-700'
                    : 'bg-white text-slate-400 border-slate-200'
                )}
              >
                JSON
              </button>
            </div>
            <div id="live-json-output">
              {previewMode === 'summary' ? <RuleSummary rules={rules} /> : <JsonPreview data={rules} />}
            </div>
          </Modal>

          <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title="Generator reguł">
            <RuleGenerator onGenerate={handleGenerateRule} />
          </Modal>
        </div>
      </AuthGate>
    </DndProvider>
  );
}
