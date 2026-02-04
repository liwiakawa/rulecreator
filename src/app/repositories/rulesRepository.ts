import { supabase } from '@/lib/supabaseClient';
import { TriggerRule } from '@/app/types';

export interface RuleRow {
  id: string;
  rule_id: string;
  name: string;
  enabled: boolean;
  rule: TriggerRule;
  created_at: string;
  updated_at: string;
}

const getClient = () => {
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
};

export const rulesRepository = {
  async list(): Promise<RuleRow[]> {
    const client = getClient();
    const { data, error } = await client
      .from('rules')
      .select('id, rule_id, name, enabled, rule, created_at, updated_at')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return (data || []) as RuleRow[];
  },
  async upsert(rule: TriggerRule): Promise<RuleRow> {
    const client = getClient();
    const payload = {
      rule_id: rule.id,
      name: rule.name,
      enabled: rule.enabled,
      rule,
    };
    const { data, error } = await client
      .from('rules')
      .upsert(payload, { onConflict: 'rule_id' })
      .select('id, rule_id, name, enabled, rule, created_at, updated_at')
      .single();
    if (error) throw error;
    return data as RuleRow;
  },
  async remove(ruleId: string): Promise<void> {
    const client = getClient();
    const { error } = await client.from('rules').delete().eq('rule_id', ruleId);
    if (error) throw error;
  },
  async generateRule(prompt: string): Promise<TriggerRule> {
    const client = getClient();
    const { data, error } = await client.functions.invoke('generate-rule', {
      body: { prompt },
    });
    if (error) throw error;
    const rule = data?.rule || data;
    if (!rule || typeof rule !== 'object') {
      throw new Error('Nie udało się odczytać reguły z odpowiedzi.');
    }
    return rule as TriggerRule;
  },
};
