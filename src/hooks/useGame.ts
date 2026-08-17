import { useCallback, useMemo, useRef, useState } from 'react';
import {
  applyPour,
  describePour,
  emptySpaces,
  findHint,
  getTopColor,
  isBottleComplete,
  isMovePossible,
  isSolved,
} from '../game/engine';
import { cloneBottles, getLevel } from '../game/levels';
import type { BottleState, PourEvent, ThemeId } from '../game/types';
import { EMPTY } from '../game/types';

export interface GameSnapshot {
  levelIndex: number;
  levelId: number;
  bottles: BottleState[];
  selected: number | null;
  undoLeft: number;
  hintLeft: number;
  extraLeft: number;
  theme: ThemeId;
  capacity: number;
  busy: boolean;
  hintMove: [number, number] | null;
}

export function useGameController(initialLevel = 0) {
  const [levelIndex, setLevelIndex] = useState(initialLevel);
  const [bottles, setBottles] = useState<BottleState[]>(() => getLevel(initialLevel).bottles);
  const [selected, setSelected] = useState<number | null>(null);
  const [undoLeft, setUndoLeft] = useState(5);
  const [hintLeft, setHintLeft] = useState(3);
  const [extraLeft, setExtraLeft] = useState(2);
  const [busy, setBusy] = useState(false);
  const [hintMove, setHintMove] = useState<[number, number] | null>(null);
  const [theme, setTheme] = useState<ThemeId>(getLevel(initialLevel).theme);
  const history = useRef<BottleState[][]>([]);
  const pendingBottles = useRef<BottleState[] | null>(null);
  const pendingWon = useRef(false);

  const capacity = 5;

  const loadLevel = useCallback((index: number) => {
    const level = getLevel(index);
    setLevelIndex(index);
    setBottles(cloneBottles(level.bottles));
    setTheme(level.theme);
    setSelected(null);
    setBusy(false);
    setHintMove(null);
    setUndoLeft(5);
    setHintLeft(3);
    setExtraLeft(2);
    history.current = [];
    pendingBottles.current = null;
    pendingWon.current = false;
  }, []);

  const snapshot: GameSnapshot = useMemo(
    () => ({
      levelIndex,
      levelId: levelIndex + 1,
      bottles,
      selected,
      undoLeft,
      hintLeft,
      extraLeft,
      theme,
      capacity,
      busy,
      hintMove,
    }),
    [levelIndex, bottles, selected, undoLeft, hintLeft, extraLeft, theme, busy, hintMove],
  );

  const selectBottle = useCallback(
    (index: number): { type: string; pour?: PourEvent; won?: boolean; reason?: string } => {
      if (busy) return { type: 'busy' };

      if (selected === null) {
        if (getTopColor(bottles[index]).color === EMPTY) return { type: 'empty' };
        if (isBottleComplete(bottles[index])) {
          return { type: 'invalid', reason: 'already-sorted' };
        }
        setSelected(index);
        setHintMove(null);
        return { type: 'select' };
      }

      if (selected === index) {
        setSelected(null);
        return { type: 'deselect' };
      }

      if (!isMovePossible(bottles[selected], bottles[index])) {
        const { color: fromColor } = getTopColor(bottles[selected]);
        const { color: toColor } = getTopColor(bottles[index]);
        if (toColor === EMPTY) {
          setSelected(null);
          return { type: 'invalid', reason: 'no-space-or-locked' };
        }
        if (fromColor !== toColor) {
          // Keep selection on source so player can try another tube
          return { type: 'invalid', reason: 'color-mismatch' };
        }
        if (emptySpaces(bottles[index]) === 0) {
          return { type: 'invalid', reason: 'target-full' };
        }
        setSelected(index);
        return { type: 'reselect' };
      }

      const pour = describePour(bottles, selected, index);
      if (!pour) return { type: 'invalid' };

      history.current.push(cloneBottles(bottles));
      const next = applyPour(bottles, selected, index);
      // Keep old sand visible while pour anim plays; commit on finishPour
      pendingBottles.current = next;
      pendingWon.current = isSolved(next);
      setSelected(null);
      setBusy(true);
      setHintMove(null);
      return { type: 'pour', pour, won: pendingWon.current };
    },
    [busy, selected, bottles],
  );

  const finishPour = useCallback(() => {
    if (pendingBottles.current) {
      setBottles(pendingBottles.current);
      pendingBottles.current = null;
    }
    setBusy(false);
    return pendingWon.current;
  }, []);

  const checkWin = useCallback(() => isSolved(bottles), [bottles]);

  const undo = useCallback(() => {
    if (busy || undoLeft <= 0 || history.current.length === 0) return false;
    const prev = history.current.pop();
    if (!prev) return false;
    setBottles(prev);
    setSelected(null);
    setUndoLeft((v) => v - 1);
    setHintMove(null);
    return true;
  }, [busy, undoLeft]);

  const reset = useCallback(() => {
    if (busy) return;
    loadLevel(levelIndex);
  }, [busy, loadLevel, levelIndex]);

  const hint = useCallback(() => {
    if (busy || hintLeft <= 0) return null;
    const move = findHint(bottles);
    if (!move) return null;
    setHintLeft((v) => v - 1);
    setHintMove(move);
    return move;
  }, [busy, hintLeft, bottles]);

  const addExtraBottle = useCallback(() => {
    if (busy || extraLeft <= 0) return false;
    setBottles((prev) => [...prev, [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY]]);
    setExtraLeft((v) => v - 1);
    setSelected(null);
    return true;
  }, [busy, extraLeft]);

  const clearSelection = useCallback(() => {
    if (busy) return;
    setSelected(null);
    setHintMove(null);
  }, [busy]);

  return {
    snapshot,
    loadLevel,
    selectBottle,
    finishPour,
    checkWin,
    undo,
    reset,
    hint,
    addExtraBottle,
    clearSelection,
    setHintMove,
  };
}
