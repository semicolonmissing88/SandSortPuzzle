import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BottleShapeId } from '../game/bottleSkins';
import { DEFAULT_BOTTLE_SKIN } from '../game/bottleSkins';
import type { ProgressState, SettingsState } from '../game/types';
import { rewardForDay } from '../game/types';

const KEY = 'water-sort-progress';

const DEFAULT_SETTINGS: SettingsState = {
  sound: true,
  music: true,
  vibration: true,
};

const DEFAULTS: ProgressState = {
  level: 0,
  coins: 1250,
  hints: 5,
  undos: 5,
  extras: 2,
  dailyStreakDay: 1,
  lastDailyClaim: null,
  bottleSkin: DEFAULT_BOTTLE_SKIN,
  settings: { ...DEFAULT_SETTINGS },
};

let memory: ProgressState = { ...DEFAULTS, settings: { ...DEFAULT_SETTINGS } };
let hydrated = false;

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function normalize(raw: Partial<ProgressState>): ProgressState {
  return {
    ...DEFAULTS,
    ...raw,
    bottleSkin: (raw.bottleSkin as BottleShapeId) || DEFAULT_BOTTLE_SKIN,
    settings: { ...DEFAULT_SETTINGS, ...(raw.settings ?? {}) },
  };
}

export async function hydrateProgress(): Promise<ProgressState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      memory = normalize(JSON.parse(raw));
    }
  } catch {
    memory = normalize({});
  }
  // One-time: re-enable audio if an older build left toggles off / stuck
  try {
    const audioFix = await AsyncStorage.getItem('audio-fix-v111');
    if (!audioFix) {
      memory.settings = { ...memory.settings, sound: true, music: true };
      await AsyncStorage.setItem(KEY, JSON.stringify(memory));
      await AsyncStorage.setItem('audio-fix-v111', '1');
    }
  } catch {
    // ignore
  }
  hydrated = true;
  return { ...memory, settings: { ...memory.settings } };
}

export function loadProgress(): ProgressState {
  return { ...memory, settings: { ...memory.settings } };
}

export function saveProgress(progress: ProgressState): void {
  memory = normalize(progress);
  void AsyncStorage.setItem(KEY, JSON.stringify(memory));
}

export function isProgressHydrated(): boolean {
  return hydrated;
}

export function hasClaimedDailyToday(): boolean {
  return memory.lastDailyClaim === todayKey();
}

/** Sync streak if user skipped a day (reset to day 1). */
export function syncDailyStreak(): ProgressState {
  const p = loadProgress();
  if (!p.lastDailyClaim) {
    p.dailyStreakDay = 1;
    saveProgress(p);
    return p;
  }
  if (p.lastDailyClaim === todayKey() || p.lastDailyClaim === yesterdayKey()) {
    return p;
  }
  // Missed more than one day → streak resets
  p.dailyStreakDay = 1;
  saveProgress(p);
  return p;
}

export function claimDailyBonus():
  | { ok: true; coins: number; day: number; progress: ProgressState }
  | { ok: false; reason: 'already' } {
  let p = syncDailyStreak();
  if (hasClaimedDailyToday()) {
    return { ok: false, reason: 'already' };
  }

  const day = ((p.dailyStreakDay - 1) % 7) + 1;
  const coins = rewardForDay(day);
  p.coins += coins;
  p.lastDailyClaim = todayKey();
  p.dailyStreakDay = day >= 7 ? 1 : day + 1;
  saveProgress(p);
  return { ok: true, coins, day, progress: loadProgress() };
}

/** UI helper: which day is active / already claimed today. */
export function getDailyUiState(): {
  activeDay: number;
  claimedToday: boolean;
  reward: number;
} {
  const p = syncDailyStreak();
  const claimedToday = hasClaimedDailyToday();
  if (claimedToday) {
    const claimedDay = p.dailyStreakDay === 1 ? 7 : p.dailyStreakDay - 1;
    return { activeDay: claimedDay, claimedToday: true, reward: rewardForDay(claimedDay) };
  }
  const activeDay = ((p.dailyStreakDay - 1) % 7) + 1;
  return { activeDay, claimedToday: false, reward: rewardForDay(activeDay) };
}

export function updateSettings(patch: Partial<SettingsState>): ProgressState {
  const p = loadProgress();
  p.settings = { ...p.settings, ...patch };
  saveProgress(p);
  return loadProgress();
}

export function setBottleSkin(skin: BottleShapeId): ProgressState {
  const p = loadProgress();
  p.bottleSkin = skin;
  saveProgress(p);
  return loadProgress();
}

/** Start over from level 1 — keeps coins / settings / daily streak. */
export function startNewGame(): ProgressState {
  const p = loadProgress();
  p.level = 0;
  saveProgress(p);
  return loadProgress();
}

/** Highest level index the player may open (0-based). */
export function maxPlayableLevel(): number {
  return loadProgress().level;
}
