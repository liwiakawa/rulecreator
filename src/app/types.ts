export type VariableType = 'number' | 'boolean' | 'string';
export type VariableCategory = 'Zdrowie' | 'Czas' | 'Stan Aplikacji' | 'Kontekst Czasu';

export type VariableKey =
  | 'steps'
  | 'steps_goal'
  | 'sleep_hours'
  | 'recovery_percent'
  | 'resting_heart_rate'
  | 'active_calories'
  | 'workout_minutes_today'
  | 'minutes_since_wake_up'
  | 'minutes_since_last_workout'
  | 'minutes_since_app_open'
  | 'habits_completed_today'
  | 'habits_total_today'
  | 'habits_completion_percent'
  | 'journal_written_today'
  | 'breakfast_logged'
  | 'water_glasses'
  | 'user_plan'
  | 'current_hour'
  | 'current_minute'
  | 'day_of_week'
  | 'is_weekend';

export interface VariableDefinition {
  label: string;
  description: string;
  dataType: VariableType;
  category: VariableCategory;
  unit?: string;
  icon?: string;
}

export const VARIABLE_CONFIG: Record<VariableKey, VariableDefinition> = {
  steps: {
    label: 'Kroki dzisiaj',
    description: 'Liczba kroków wykonanych dziś.',
    dataType: 'number',
    category: 'Zdrowie',
    unit: 'kroków',
    icon: 'Footprints',
  },
  steps_goal: {
    label: 'Cel kroków',
    description: 'Dzienne założenie kroków użytkownika.',
    dataType: 'number',
    category: 'Zdrowie',
    unit: 'kroków',
    icon: 'Flag',
  },
  sleep_hours: {
    label: 'Sen (godziny)',
    description: 'Całkowity czas snu z ostatniej nocy.',
    dataType: 'number',
    category: 'Zdrowie',
    unit: 'h',
    icon: 'Moon',
  },
  recovery_percent: {
    label: 'Recovery (%)',
    description: 'Recovery score w skali 0-100.',
    dataType: 'number',
    category: 'Zdrowie',
    unit: '%',
    icon: 'Activity',
  },
  resting_heart_rate: {
    label: 'Tętno spoczynkowe',
    description: 'Resting heart rate (bpm).',
    dataType: 'number',
    category: 'Zdrowie',
    unit: 'bpm',
    icon: 'Heart',
  },
  active_calories: {
    label: 'Spalone kalorie',
    description: 'Aktywne kalorie spalone dzisiaj.',
    dataType: 'number',
    category: 'Zdrowie',
    unit: 'kcal',
    icon: 'Flame',
  },
  workout_minutes_today: {
    label: 'Minuty treningu',
    description: 'Łączny czas treningu w minutach dzisiaj.',
    dataType: 'number',
    category: 'Zdrowie',
    unit: 'min',
    icon: 'Dumbbell',
  },
  minutes_since_wake_up: {
    label: 'Minuty od pobudki',
    description: 'Minuty od momentu pobudki.',
    dataType: 'number',
    category: 'Czas',
    unit: 'min',
    icon: 'Clock',
  },
  minutes_since_last_workout: {
    label: 'Minuty od treningu',
    description: 'Czas od zakończenia ostatniego treningu.',
    dataType: 'number',
    category: 'Czas',
    unit: 'min',
    icon: 'Timer',
  },
  minutes_since_app_open: {
    label: 'Minuty od otwarcia app',
    description: 'Czas od ostatniego otwarcia aplikacji.',
    dataType: 'number',
    category: 'Czas',
    unit: 'min',
    icon: 'Timer',
  },
  habits_completed_today: {
    label: 'Ukończone nawyki',
    description: 'Ile nawyków zostało ukończonych dziś.',
    dataType: 'number',
    category: 'Stan Aplikacji',
    unit: 'szt',
    icon: 'CheckCircle2',
  },
  habits_total_today: {
    label: 'Zaplanowane nawyki',
    description: 'Łączna liczba nawyków zaplanowanych dziś.',
    dataType: 'number',
    category: 'Stan Aplikacji',
    unit: 'szt',
    icon: 'ListChecks',
  },
  habits_completion_percent: {
    label: 'Procent nawyków',
    description: 'Procent ukończonych nawyków dzisiaj.',
    dataType: 'number',
    category: 'Stan Aplikacji',
    unit: '%',
    icon: 'PieChart',
  },
  journal_written_today: {
    label: 'Dziennik wypełniony',
    description: 'Czy użytkownik wypełnił dziennik dziś.',
    dataType: 'boolean',
    category: 'Stan Aplikacji',
    icon: 'NotebookPen',
  },
  breakfast_logged: {
    label: 'Śniadanie zalogowane',
    description: 'Czy śniadanie zostało zalogowane.',
    dataType: 'boolean',
    category: 'Stan Aplikacji',
    icon: 'Coffee',
  },
  water_glasses: {
    label: 'Szklanki wody',
    description: 'Ilość wypitych szklanek wody.',
    dataType: 'number',
    category: 'Stan Aplikacji',
    unit: 'szkl.',
    icon: 'Droplets',
  },
  user_plan: {
    label: 'Plan użytkownika',
    description: 'Plan subskrypcji (np. free, premium).',
    dataType: 'string',
    category: 'Stan Aplikacji',
    icon: 'ShieldCheck',
  },
  current_hour: {
    label: 'Aktualna godzina',
    description: 'Godzina (0-23).',
    dataType: 'number',
    category: 'Kontekst Czasu',
    unit: 'h',
    icon: 'Clock',
  },
  current_minute: {
    label: 'Aktualna minuta',
    description: 'Minuta (0-59).',
    dataType: 'number',
    category: 'Kontekst Czasu',
    unit: 'min',
    icon: 'Clock',
  },
  day_of_week: {
    label: 'Dzień tygodnia',
    description: '1=Pon, 7=Nd.',
    dataType: 'number',
    category: 'Kontekst Czasu',
    unit: '',
    icon: 'Calendar',
  },
  is_weekend: {
    label: 'Weekend',
    description: 'Czy jest sobota/niedziela.',
    dataType: 'boolean',
    category: 'Kontekst Czasu',
    icon: 'Calendar',
  },
};

export type OperatorType =
  | 'eq'
  | 'neq'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'between'
  | 'is_true'
  | 'is_false';

export interface OperatorDefinition {
  label: string;
  validFor: VariableType[];
  valueKind: 'value' | 'range' | 'none';
  allowRef: boolean;
}

export const OPERATOR_CONFIG: Record<OperatorType, OperatorDefinition> = {
  eq: { label: 'Równe (=)', validFor: ['number', 'boolean', 'string'], valueKind: 'value', allowRef: true },
  neq: { label: 'Różne (!=)', validFor: ['number', 'boolean', 'string'], valueKind: 'value', allowRef: true },
  lt: { label: 'Mniejsze niż (<)', validFor: ['number'], valueKind: 'value', allowRef: true },
  lte: { label: 'Mniejsze lub równe (<=)', validFor: ['number'], valueKind: 'value', allowRef: true },
  gt: { label: 'Większe niż (>)', validFor: ['number'], valueKind: 'value', allowRef: true },
  gte: { label: 'Większe lub równe (>=)', validFor: ['number'], valueKind: 'value', allowRef: true },
  between: { label: 'Pomiędzy', validFor: ['number'], valueKind: 'range', allowRef: false },
  is_true: { label: 'Jest prawdą', validFor: ['boolean'], valueKind: 'none', allowRef: false },
  is_false: { label: 'Jest fałszem', validFor: ['boolean'], valueKind: 'none', allowRef: false },
};

export type ConditionRule = {
  field: VariableKey;
  op: OperatorType;
  value?: number | boolean | string | [number, number];
  ref?: VariableKey;
  uiId?: string;
};

export interface ConditionGroup {
  operator: 'AND' | 'OR';
  rules: Array<ConditionRule | ConditionGroup>;
  uiId?: string;
}

export type ActionType = 'notification' | 'in_app_alert' | 'add_memory' | 'add_insight';
export type ActionPriority = 'low' | 'medium' | 'high';
export type AlertStyle = 'info' | 'warning' | 'success';

export type NotificationAction = {
  type: 'notification';
  title: string;
  body: string;
  targetView?: TargetView;
};

export type InAppAlertAction = {
  type: 'in_app_alert';
  title: string;
  body: string;
  style?: AlertStyle;
  dismissable?: boolean;
};

export type AddMemoryAction = {
  type: 'add_memory';
  category: string;
  content: string;
};

export type AddInsightAction = {
  type: 'add_insight';
  category: string;
  title: string;
  body: string;
  priority?: ActionPriority;
};

export type Action = NotificationAction | InAppAlertAction | AddMemoryAction | AddInsightAction;

export interface Schedule {
  hours?: {
    from: number;
    to: number;
  };
  days?: number[];
  excludeWeekends?: boolean;
}

export interface TriggerRule {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  conditions: ConditionGroup;
  cooldown?: string;
  schedule?: Schedule;
  actions: Action[];
  backgroundEnabled?: boolean;
}

export type TargetView = '/home' | '/journal' | '/habits' | '/nutrition' | '/settings';

export const TARGET_VIEW_OPTIONS: Array<{ value: TargetView; label: string }> = [
  { value: '/home', label: 'Dashboard' },
  { value: '/journal', label: 'Dziennik' },
  { value: '/habits', label: 'Nawyki' },
  { value: '/nutrition', label: 'Żywienie' },
  { value: '/settings', label: 'Ustawienia' },
];

export const PLACEHOLDER_TOKENS = [
  'steps',
  'steps_goal',
  'remaining_steps',
  'remaining_steps_minutes',
  'remaining_steps_km',
  'steps_percent',
  'habits_completed_today',
  'habits_total_today',
  'habits_remaining',
  'habits_percent',
  'recovery_percent',
  'recovery_status',
  'sleep_hours',
  'current_time',
];

export const BACKGROUND_VARIABLES: VariableKey[] = [
  'steps',
  'steps_goal',
  'current_hour',
  'current_minute',
  'day_of_week',
  'is_weekend',
];

export const BACKGROUND_ACTIONS: ActionType[] = ['notification'];

export const DAY_LABELS: Record<number, { short: string; label: string }> = {
  1: { short: 'Pn', label: 'Poniedziałek' },
  2: { short: 'Wt', label: 'Wtorek' },
  3: { short: 'Śr', label: 'Środa' },
  4: { short: 'Cz', label: 'Czwartek' },
  5: { short: 'Pt', label: 'Piątek' },
  6: { short: 'Sb', label: 'Sobota' },
  7: { short: 'Nd', label: 'Niedziela' },
};

export const ACTION_CONFIG: Record<ActionType, {
  label: string;
  description: string;
  icon: string;
  color: string;
}> = {
  notification: {
    label: 'Push Notification',
    description: 'Wyślij powiadomienie push do użytkownika.',
    icon: 'Bell',
    color: 'indigo',
  },
  in_app_alert: {
    label: 'In-App Alert',
    description: 'Pokaż alert wewnątrz aplikacji.',
    icon: 'AlertCircle',
    color: 'amber',
  },
  add_memory: {
    label: 'Add to Memory',
    description: 'Dodaj wpis do pamięci AI.',
    icon: 'BookHeart',
    color: 'emerald',
  },
  add_insight: {
    label: 'Add Insight',
    description: 'Dodaj insight na dashboardzie.',
    icon: 'Lightbulb',
    color: 'rose',
  },
};

export const DEFAULT_RULE: TriggerRule = {
  id: 'steps_reminder_evening',
  name: 'Przypomnienie o krokach wieczorem',
  enabled: true,
  priority: 70,
  conditions: {
    operator: 'AND',
    rules: [
      { field: 'current_hour', op: 'gte', value: 18 },
      { field: 'current_hour', op: 'lte', value: 21 },
      { field: 'steps', op: 'lt', ref: 'steps_goal' },
      { field: 'is_weekend', op: 'is_false' },
    ],
  },
  cooldown: '24h',
  actions: [
    {
      type: 'notification',
      title: 'Cel kroków zagrożony',
      body: 'Brakuje Ci {{remaining_steps}} kroków. Może krótki spacer?',
      targetView: '/home',
    },
  ],
  backgroundEnabled: false,
};
