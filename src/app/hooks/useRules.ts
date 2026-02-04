import React from 'react';
import { TriggerRule } from '@/app/types';
import { ruleService } from '@/app/services/ruleService';

interface UseRulesState {
  rules: TriggerRule[];
  activeRuleId: string | null;
  setActiveRuleId: (id: string | null) => void;
  loading: boolean;
  dirtyRuleIds: string[];
  savingRuleIds: string[];
  loadRules: () => Promise<void>;
  updateRule: (rule: TriggerRule) => void;
  insertRule: (rule: TriggerRule) => void;
  addRule: () => TriggerRule;
  duplicateRule: (ruleId: string) => TriggerRule | null;
  saveRule: (rule: TriggerRule) => Promise<void>;
  deleteRule: (ruleId: string) => Promise<void>;
  isDirty: (ruleId: string) => boolean;
  isSaving: (ruleId: string) => boolean;
}

export const useRules = (): UseRulesState => {
  const [rules, setRules] = React.useState<TriggerRule[]>([]);
  const [activeRuleId, setActiveRuleId] = React.useState<string | null>(null);
  const [dirtyRuleIds, setDirtyRuleIds] = React.useState<string[]>([]);
  const [savingRuleIds, setSavingRuleIds] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);

  const markDirty = React.useCallback((ruleId: string) => {
    setDirtyRuleIds((prev) => (prev.includes(ruleId) ? prev : [...prev, ruleId]));
  }, []);

  const clearDirty = React.useCallback((ruleId: string) => {
    setDirtyRuleIds((prev) => prev.filter((id) => id !== ruleId));
  }, []);

  const loadRules = React.useCallback(async () => {
    setLoading(true);
    try {
      const loaded = await ruleService.loadRules();
      setRules(loaded);
      setActiveRuleId(loaded[0]?.id || null);
      setDirtyRuleIds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRule = React.useCallback(
    (rule: TriggerRule) => {
      setRules((prev) => {
        const directIndex = prev.findIndex((r) => r.id === rule.id);
        if (directIndex !== -1) {
          const next = [...prev];
          next[directIndex] = rule;
          return next;
        }
        const fallbackIndex = activeRuleId ? prev.findIndex((r) => r.id === activeRuleId) : -1;
        if (fallbackIndex !== -1) {
          const next = [...prev];
          next[fallbackIndex] = rule;
          return next;
        }
        return prev;
      });
      if (activeRuleId && activeRuleId !== rule.id) {
        setActiveRuleId(rule.id);
      }
      markDirty(rule.id);
    },
    [markDirty, activeRuleId]
  );

  const insertRule = React.useCallback(
    (rule: TriggerRule) => {
      setRules((prev) => [rule, ...prev]);
      setActiveRuleId(rule.id);
      markDirty(rule.id);
    },
    [markDirty]
  );

  const addRule = React.useCallback(() => {
    const newRule = ruleService.createEmptyRule();
    setRules((prev) => [newRule, ...prev]);
    setActiveRuleId(newRule.id);
    markDirty(newRule.id);
    return newRule;
  }, [markDirty]);

  const duplicateRule = React.useCallback(
    (ruleId: string) => {
      const rule = rules.find((r) => r.id === ruleId);
      if (!rule) return null;
      const existing = new Set(rules.map((r) => r.id));
      const newId = ruleService.normalizeRuleId(`${rule.id}_copy`, existing);
      const duplicated: TriggerRule = {
        ...rule,
        id: newId,
        name: `${rule.name} (kopia)`,
      };
      setRules((prev) => [duplicated, ...prev]);
      setActiveRuleId(duplicated.id);
      markDirty(duplicated.id);
      return duplicated;
    },
    [rules, markDirty]
  );

  const saveRule = React.useCallback(async (rule: TriggerRule) => {
    setSavingRuleIds((prev) => [...prev, rule.id]);
    try {
      await ruleService.save(rule);
      clearDirty(rule.id);
    } finally {
      setSavingRuleIds((prev) => prev.filter((id) => id !== rule.id));
    }
  }, [clearDirty]);

  const deleteRule = React.useCallback(async (ruleId: string) => {
    await ruleService.remove(ruleId);
    setRules((prev) => {
      const next = prev.filter((rule) => rule.id !== ruleId);
      setActiveRuleId((current) => (current === ruleId ? next[0]?.id || null : current));
      return next;
    });
  }, []);

  const isDirty = React.useCallback((ruleId: string) => dirtyRuleIds.includes(ruleId), [dirtyRuleIds]);
  const isSaving = React.useCallback((ruleId: string) => savingRuleIds.includes(ruleId), [savingRuleIds]);

  return {
    rules,
    activeRuleId,
    setActiveRuleId,
    loading,
    dirtyRuleIds,
    savingRuleIds,
    loadRules,
    updateRule,
    insertRule,
    addRule,
    duplicateRule,
    saveRule,
    deleteRule,
    isDirty,
    isSaving,
  };
};
