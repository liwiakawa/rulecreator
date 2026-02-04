import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
const OPENROUTER_MODEL = Deno.env.get('OPENROUTER_MODEL') ?? 'openai/gpt-4o-mini';

const SCHEMA_PROMPT = `Jesteś ekspertem od reguł triggerów dla aplikacji zdrowotnej.
Wygeneruj wyłącznie poprawny JSON według schematu:

interface TriggerRule {
  id: string;                    // snake_case
  name: string;                  // czytelna nazwa
  enabled: boolean;              // aktywna/nie
  priority: number;              // 1-100
  conditions: ConditionGroup;    // warunki
  cooldown?: string;             // "1h", "24h", "7d"
  schedule?: {
    hours?: { from: number; to: number; };
    days?: number[];             // 1=Pon, 7=Nd
    excludeWeekends?: boolean;
  };
  actions: Action[];
  backgroundEnabled?: boolean;
}

ConditionGroup:
{ "operator": "AND"|"OR", "rules": [ConditionRule | ConditionGroup] }

ConditionRule:
{ "field": string, "op": string, "value"?: number|boolean|string|[number,number], "ref"?: string }

Dostępne zmienne:
steps, steps_goal, sleep_hours, recovery_percent, resting_heart_rate,
active_calories, workout_minutes_today, minutes_since_wake_up,
minutes_since_last_workout, minutes_since_app_open,
habits_completed_today, habits_total_today, habits_completion_percent,
journal_written_today, breakfast_logged, water_glasses,
user_plan, current_hour, current_minute, day_of_week, is_weekend

Wartości dla user_plan: free, premium, pro

Operatory:
eq, neq, lt, lte, gt, gte, between, is_true, is_false

Akcje:
1) notification { type: "notification", title: string, body: string, targetView: "/home"|"/journal"|"/habits"|"/nutrition"|"/settings" }
2) in_app_alert { type: "in_app_alert", title: string, body: string, style?: "info"|"warning"|"success", dismissable?: boolean }
3) add_memory { type: "add_memory", category: string, content: string }
4) add_insight { type: "add_insight", category: string, title: string, body: string, priority?: "low"|"medium"|"high" }

Zwróć TYLKO JSON bez komentarzy, bez markdown.`;

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (!OPENROUTER_API_KEY) {
    return new Response(JSON.stringify({ error: 'Missing OPENROUTER_API_KEY' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Missing prompt' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = {
      model: OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: SCHEMA_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 1200,
    };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://localhost',
        'X-Title': 'Trigger Rule Editor',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    const content = result?.choices?.[0]?.message?.content ?? '';
    const cleaned = content.replace(/```json|```/g, '').trim();

    let rule;
    try {
      rule = JSON.parse(cleaned);
    } catch (_err) {
      return new Response(JSON.stringify({ error: 'Invalid JSON from model', raw: content }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ rule }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
