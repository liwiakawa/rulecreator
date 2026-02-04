import { TriggerRule, DEFAULT_RULE } from '@/app/types';
import { rulesRepository } from '@/app/repositories/rulesRepository';

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

const mapRowToRule = (row: { rule?: TriggerRule; rule_id?: string; name?: string; enabled?: boolean }): TriggerRule => {
  const fallback = row.rule || createEmptyRule();
  return {
    ...fallback,
    id: row.rule_id || fallback.id,
    name: row.name || fallback.name,
    enabled: row.enabled ?? fallback.enabled,
  } as TriggerRule;
};

export const ruleService = {
  createEmptyRule,
  normalizeRuleId,
  async loadRules(): Promise<TriggerRule[]> {
    const rows = await rulesRepository.list();
    if (rows.length === 0) {
      return [{ ...DEFAULT_RULE, id: 'steps_reminder_evening' } as TriggerRule];
    }
    return rows.map(mapRowToRule);
  },
  async save(rule: TriggerRule): Promise<void> {
    await rulesRepository.upsert(rule);
  },
  async remove(ruleId: string): Promise<void> {
    await rulesRepository.remove(ruleId);
  },
  async generateFromPrompt(prompt: string): Promise<TriggerRule> {
    return rulesRepository.generateRule(prompt);
  },
};
