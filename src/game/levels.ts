import type { BottleState, LevelDef, ThemeId } from './types';
import { EMPTY } from './types';
import type { LiquidColor } from '../theme/colors';

export const TUBE_CAPACITY = 5;

function E(): BottleState {
  return [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY];
}

/** Bottom → top. Pads / trims to capacity 5. */
function b(...layers: LiquidColor[]): BottleState {
  const out: BottleState = [...layers];
  while (out.length < TUBE_CAPACITY) out.push(EMPTY);
  return out.slice(0, TUBE_CAPACITY) as BottleState;
}

/** Bottom → top (index 0 = bottom). Each color count is a multiple of 5. */
export const LEVELS: LevelDef[] = [
  {
    id: 1,
    theme: 'day',
    capacity: TUBE_CAPACITY,
    bottles: [
      b('PINK', 'PINK', 'GREEN', 'GREEN', 'PINK'),
      b('GREEN', 'GREEN', 'PINK', 'PINK', 'GREEN'),
      E(),
    ],
  },
  {
    id: 2,
    theme: 'day',
    capacity: TUBE_CAPACITY,
    bottles: [
      b('BLUE', 'ORANGE', 'BLUE', 'ORANGE', 'BLUE'),
      b('ORANGE', 'BLUE', 'ORANGE', 'BLUE', 'ORANGE'),
      E(),
    ],
  },
  {
    id: 3,
    theme: 'day',
    capacity: TUBE_CAPACITY,
    bottles: [
      b('PINK', 'PURPLE', 'ORANGE', 'PINK', 'PURPLE'),
      b('ORANGE', 'PINK', 'PURPLE', 'ORANGE', 'PINK'),
      b('PURPLE', 'ORANGE', 'PINK', 'PURPLE', 'ORANGE'),
      E(),
      E(),
    ],
  },
  {
    id: 4,
    theme: 'dusk',
    capacity: TUBE_CAPACITY,
    bottles: [
      b('GREEN', 'BLUE', 'ORANGE', 'PURPLE', 'PINK'),
      b('PINK', 'GREEN', 'BLUE', 'ORANGE', 'PURPLE'),
      b('PURPLE', 'PINK', 'GREEN', 'BLUE', 'ORANGE'),
      b('ORANGE', 'PURPLE', 'PINK', 'GREEN', 'BLUE'),
      b('BLUE', 'ORANGE', 'PURPLE', 'PINK', 'GREEN'),
      E(),
      E(),
    ],
  },
  {
    id: 5,
    theme: 'dusk',
    capacity: TUBE_CAPACITY,
    bottles: [
      b('YELLOW', 'RED', 'CYAN', 'YELLOW', 'RED'),
      b('CYAN', 'YELLOW', 'RED', 'CYAN', 'YELLOW'),
      b('RED', 'CYAN', 'YELLOW', 'RED', 'CYAN'),
      E(),
      E(),
    ],
  },
  {
    id: 6,
    theme: 'night',
    capacity: TUBE_CAPACITY,
    bottles: [
      b('PURPLE', 'GREEN', 'PINK', 'BLUE', 'ORANGE'),
      b('ORANGE', 'PURPLE', 'GREEN', 'PINK', 'BLUE'),
      b('BLUE', 'ORANGE', 'PURPLE', 'GREEN', 'PINK'),
      b('PINK', 'BLUE', 'ORANGE', 'PURPLE', 'GREEN'),
      b('GREEN', 'PINK', 'BLUE', 'ORANGE', 'PURPLE'),
      E(),
      E(),
    ],
  },
  {
    id: 7,
    theme: 'night',
    capacity: TUBE_CAPACITY,
    bottles: [
      b('RED', 'GREEN', 'BLUE', 'YELLOW', 'PURPLE'),
      b('PURPLE', 'RED', 'GREEN', 'BLUE', 'YELLOW'),
      b('YELLOW', 'PURPLE', 'RED', 'GREEN', 'BLUE'),
      b('BLUE', 'YELLOW', 'PURPLE', 'RED', 'GREEN'),
      b('GREEN', 'BLUE', 'YELLOW', 'PURPLE', 'RED'),
      E(),
      E(),
    ],
  },
  {
    id: 8,
    theme: 'day',
    capacity: TUBE_CAPACITY,
    bottles: [
      b('CYAN', 'PINK', 'LIME', 'ORANGE', 'CYAN'),
      b('ORANGE', 'CYAN', 'PINK', 'LIME', 'ORANGE'),
      b('LIME', 'ORANGE', 'CYAN', 'PINK', 'LIME'),
      b('PINK', 'LIME', 'ORANGE', 'CYAN', 'PINK'),
      E(),
      E(),
    ],
  },
  {
    id: 9,
    theme: 'dusk',
    capacity: TUBE_CAPACITY,
    bottles: [
      b('RED', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE'),
      b('PURPLE', 'RED', 'ORANGE', 'YELLOW', 'GREEN'),
      b('BLUE', 'PURPLE', 'RED', 'ORANGE', 'YELLOW'),
      b('GREEN', 'BLUE', 'PURPLE', 'RED', 'ORANGE'),
      b('YELLOW', 'GREEN', 'BLUE', 'PURPLE', 'RED'),
      b('ORANGE', 'YELLOW', 'GREEN', 'BLUE', 'PURPLE'),
      E(),
      E(),
    ],
  },
  {
    id: 10,
    theme: 'night',
    capacity: TUBE_CAPACITY,
    bottles: [
      b('LIME', 'CYAN', 'PINK', 'ORANGE', 'PURPLE'),
      b('PURPLE', 'LIME', 'CYAN', 'PINK', 'ORANGE'),
      b('ORANGE', 'PURPLE', 'LIME', 'CYAN', 'PINK'),
      b('PINK', 'ORANGE', 'PURPLE', 'LIME', 'CYAN'),
      b('CYAN', 'PINK', 'ORANGE', 'PURPLE', 'LIME'),
      E(),
      E(),
    ],
  },
  {
    id: 11,
    theme: 'day',
    capacity: TUBE_CAPACITY,
    bottles: [
      b('GREEN', 'RED', 'BLUE', 'YELLOW', 'ORANGE'),
      b('PURPLE', 'GREEN', 'RED', 'BLUE', 'YELLOW'),
      b('ORANGE', 'PURPLE', 'GREEN', 'RED', 'BLUE'),
      b('YELLOW', 'ORANGE', 'PURPLE', 'GREEN', 'RED'),
      b('BLUE', 'YELLOW', 'ORANGE', 'PURPLE', 'GREEN'),
      b('RED', 'BLUE', 'YELLOW', 'ORANGE', 'PURPLE'),
      E(),
      E(),
    ],
  },
  {
    id: 12,
    theme: 'dusk',
    capacity: TUBE_CAPACITY,
    bottles: [
      b('DARK_BLUE', 'COFFEE', 'GRAY', 'LIGHT_GREEN', 'PINK'),
      b('PINK', 'DARK_BLUE', 'COFFEE', 'GRAY', 'LIGHT_GREEN'),
      b('LIGHT_GREEN', 'PINK', 'DARK_BLUE', 'COFFEE', 'GRAY'),
      b('GRAY', 'LIGHT_GREEN', 'PINK', 'DARK_BLUE', 'COFFEE'),
      b('COFFEE', 'GRAY', 'LIGHT_GREEN', 'PINK', 'DARK_BLUE'),
      E(),
      E(),
    ],
  },
];

export function cloneBottles(bottles: BottleState[]): BottleState[] {
  return bottles.map((bottle) => [...bottle] as BottleState);
}

export function getLevel(index: number): LevelDef {
  const base = LEVELS[index % LEVELS.length];
  const themeCycle: ThemeId[] = ['day', 'dusk', 'night'];
  return {
    ...base,
    id: index + 1,
    capacity: TUBE_CAPACITY,
    theme: themeCycle[index % themeCycle.length],
    bottles: cloneBottles(base.bottles),
  };
}
