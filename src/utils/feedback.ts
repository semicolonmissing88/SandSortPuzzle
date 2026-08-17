import { Vibration } from 'react-native';
import { loadProgress } from '../storage/mmkv';

type Sfx = 'pour' | 'select' | 'invalid' | 'win' | 'fill';

/** Sounds removed — vibration only. */
export async function playSfx(_name: Sfx): Promise<void> {}

export function vibrate(pattern: 'light' | 'medium' | 'success' | 'error' = 'light'): void {
  if (!loadProgress().settings.vibration) return;
  try {
    if (pattern === 'light') Vibration.vibrate(28);
    else if (pattern === 'medium') Vibration.vibrate(45);
    else if (pattern === 'success') Vibration.vibrate([0, 40, 50, 40, 50, 70]);
    else Vibration.vibrate([0, 60, 40, 60]);
  } catch {
    // ignore
  }
}

export function feedbackPour(): void {
  vibrate('medium');
}

export function feedbackBottleFill(): void {
  vibrate('success');
}

export function feedbackSelect(): void {
  vibrate('light');
}

export function feedbackInvalid(): void {
  vibrate('error');
}

export function feedbackWin(): void {
  vibrate('success');
}

export async function preloadSfx(): Promise<void> {}
