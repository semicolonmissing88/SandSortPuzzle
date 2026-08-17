/** Audio disabled — stubs kept so call sites stay unchanged. */

export type MusicTrack = 'menu' | 'game';

export async function playMusicTrack(_track: MusicTrack): Promise<void> {}
export async function unlockAndPlayMusic(_track?: MusicTrack): Promise<void> {}
export async function playMenuMusic(): Promise<void> {}
export async function playGameMusic(): Promise<void> {}
export async function startMusic(): Promise<void> {}
export async function pauseMusic(): Promise<void> {}
export async function stopMusic(): Promise<void> {}
export async function duckMusic(_factor?: number, _ms?: number): Promise<void> {}
export async function setMusicEnabled(_enabled: boolean): Promise<void> {}
export function bindMusicToAppState(): () => void {
  return () => {};
}
