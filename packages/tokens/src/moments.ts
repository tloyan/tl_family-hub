export type Moment = 'morning' | 'midday' | 'evening' | 'night';

export interface MomentTheme {
  readonly moment: Moment;
  readonly label: string;
  readonly hourRange: readonly [start: number, end: number];
  readonly background: string;
  readonly temperature: 'warm' | 'neutral' | 'soft-warm' | 'soft-cool';
}

export const MOMENT_THEMES: Record<Moment, MomentTheme> = {
  morning: {
    moment: 'morning',
    label: 'Morning',
    hourRange: [6, 12],
    background: '#FFFBF5',
    temperature: 'warm',
  },
  midday: {
    moment: 'midday',
    label: 'Midday',
    hourRange: [12, 17],
    background: '#FAFAFA',
    temperature: 'neutral',
  },
  evening: {
    moment: 'evening',
    label: 'Evening',
    hourRange: [17, 21],
    background: '#FFF8F0',
    temperature: 'soft-warm',
  },
  night: {
    moment: 'night',
    label: 'Night',
    hourRange: [21, 6],
    background: '#0F172A',
    temperature: 'soft-cool',
  },
} as const;

/**
 * Returns the moment theme for a given hour (0-23).
 */
export function getMomentTheme(hour: number): MomentTheme {
  if (hour >= 6 && hour < 12) return MOMENT_THEMES.morning;
  if (hour >= 12 && hour < 17) return MOMENT_THEMES.midday;
  if (hour >= 17 && hour < 21) return MOMENT_THEMES.evening;
  return MOMENT_THEMES.night;
}
