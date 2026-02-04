import { supabase } from './supabaseClient';
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

export const fetchRules = async () => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('rules')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data || []) as RuleRow[];
};

export const upsertRule = async (rule: TriggerRule) => {
  if (!supabase) throw new Error('Supabase not configured');
  const payload = {
    rule_id: rule.id,
    name: rule.name,
    enabled: rule.enabled,
    rule,
  };
  const { data, error } = await supabase
    .from('rules')
    .upsert(payload, { onConflict: 'rule_id' })
    .select()
    .single();
  if (error) throw error;
  return data as RuleRow;
};

export const deleteRule = async (ruleId: string) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from('rules').delete().eq('rule_id', ruleId);
  if (error) throw error;
};

export const checkIsAdmin = async (userId: string) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.from('admin_users').select('user_id').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return !!data;
};
