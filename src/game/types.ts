import type { LiquidColor } from '../theme/colors';
import type { BottleShapeId } from './bottleSkins';

export const EMPTY = 'EMPTY' as const;
export type Slot = LiquidColor | typeof EMPTY;
export type BottleState = Slot[];

export type ThemeId = 'day' | 'dusk' | 'night';

export interface LevelDef {
  id: number;
  theme: ThemeId;
  capacity: number;
  bottles: BottleState[];
}

export interface SettingsState {
  sound: boolean;
  music: boolean;
  vibration: boolean;
}

export interface ProgressState {
  level: number;
  coins: number;
  hints: number;
  undos: number;
  extras: number;
  /** 1–7 current streak day to claim */
  dailyStreakDay: number;
  /** YYYY-MM-DD of last successful claim */
  lastDailyClaim: string | null;
  /** Selected bottle skin from the 10-shape library */
  bottleSkin: BottleShapeId;
  settings: SettingsState;
}

export interface PourEvent {
  from: number;
  to: number;
  color: LiquidColor;
  amount: number;
}

/** Day 1→7 rewards; then cycle repeats the same way. */
export const DAILY_REWARDS = [5, 10, 20, 40, 60, 80, 100] as const;

export function rewardForDay(day: number): number {
  const idx = ((Math.max(1, day) - 1) % DAILY_REWARDS.length + DAILY_REWARDS.length) % DAILY_REWARDS.length;
  return DAILY_REWARDS[idx];
}
