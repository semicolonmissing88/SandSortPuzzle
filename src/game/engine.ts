import type { LiquidColor } from '../theme/colors';
import type { BottleState, PourEvent } from './types';
import { EMPTY } from './types';

export function getTopColor(bottle: BottleState): { color: typeof EMPTY | LiquidColor; index: number } {
  for (let i = bottle.length - 1; i >= 0; i -= 1) {
    if (bottle[i] !== EMPTY) {
      return { color: bottle[i] as LiquidColor, index: i };
    }
  }
  return { color: EMPTY, index: -1 };
}

export function getBottomEmpty(bottle: BottleState): number {
  for (let i = 0; i < bottle.length; i += 1) {
    if (bottle[i] === EMPTY) return i;
  }
  return -1;
}

export function countTopRun(bottle: BottleState, color: LiquidColor): number {
  let n = 0;
  for (let i = bottle.length - 1; i >= 0; i -= 1) {
    if (bottle[i] === EMPTY) continue;
    if (bottle[i] === color) n += 1;
    else break;
  }
  return n;
}

export function emptySpaces(bottle: BottleState): number {
  return bottle.filter((c) => c === EMPTY).length;
}

export function isBottleEmpty(bottle: BottleState): boolean {
  return bottle.every((c) => c === EMPTY);
}

export function isBottleComplete(bottle: BottleState): boolean {
  if (bottle[0] === EMPTY) return false;
  const color = bottle[0];
  return bottle.every((c) => c === color);
}

export function isSolved(bottles: BottleState[]): boolean {
  return bottles.every((b) => isBottleEmpty(b) || isBottleComplete(b));
}

export function isMovePossible(from: BottleState, to: BottleState): boolean {
  const { color: topFrom } = getTopColor(from);
  const { color: topTo } = getTopColor(to);
  if (topFrom === EMPTY) return false;
  // Completed tubes stay locked (standard water-sort).
  if (isBottleComplete(from)) return false;
  if (emptySpaces(to) === 0) return false;
  // Partial pours OK: amount = min(topRun, emptySpaces) in applyPour.
  if (topTo !== EMPTY && topTo !== topFrom) return false;
  return true;
}

export function applyPour(bottles: BottleState[], fromIdx: number, toIdx: number): BottleState[] {
  const next = bottles.map((b) => [...b] as BottleState);
  const from = next[fromIdx];
  const to = next[toIdx];
  const { color } = getTopColor(from);
  if (color === EMPTY) return next;

  const amount = Math.min(countTopRun(from, color), emptySpaces(to));
  for (let n = 0; n < amount; n += 1) {
    const top = getTopColor(from);
    const emptyIdx = getBottomEmpty(to);
    from[top.index] = EMPTY;
    to[emptyIdx] = color;
  }
  return next;
}

export function describePour(bottles: BottleState[], fromIdx: number, toIdx: number): PourEvent | null {
  if (!isMovePossible(bottles[fromIdx], bottles[toIdx])) return null;
  const { color } = getTopColor(bottles[fromIdx]);
  if (color === EMPTY) return null;
  return {
    from: fromIdx,
    to: toIdx,
    color,
    amount: Math.min(countTopRun(bottles[fromIdx], color), emptySpaces(bottles[toIdx])),
  };
}

export function listMoves(bottles: BottleState[]): Array<[number, number]> {
  const moves: Array<[number, number]> = [];
  for (let i = 0; i < bottles.length; i += 1) {
    if (isBottleComplete(bottles[i]) || getTopColor(bottles[i]).color === EMPTY) continue;
    for (let j = 0; j < bottles.length; j += 1) {
      if (i === j) continue;
      if (isMovePossible(bottles[i], bottles[j])) moves.push([i, j]);
    }
  }
  return moves;
}

function hash(bottles: BottleState[]): string {
  return bottles.map((b) => b.join(',')).join('|');
}

/** DFS hint — adapted from cemasma/water-sort-puzzle-solver. */
export function findHint(bottles: BottleState[], maxNodes = 20000): [number, number] | null {
  if (isSolved(bottles)) return null;
  const start = bottles.map((b) => [...b] as BottleState);
  const stack: { bottles: BottleState[]; moves: Array<[number, number]> }[] = [
    { bottles: start, moves: [] },
  ];
  const visited = new Set<string>([hash(start)]);
  let nodes = 0;

  while (stack.length && nodes < maxNodes) {
    const cur = stack.pop()!;
    nodes += 1;
    if (isSolved(cur.bottles)) return cur.moves[0] ?? null;

    const options = listMoves(cur.bottles);
    for (let k = options.length - 1; k >= 0; k -= 1) {
      const [i, j] = options[k];
      const next = applyPour(cur.bottles, i, j);
      const h = hash(next);
      if (visited.has(h)) continue;
      visited.add(h);
      stack.push({ bottles: next, moves: [...cur.moves, [i, j]] });
    }
  }

  const any = listMoves(start);
  return any[0] ?? null;
}
