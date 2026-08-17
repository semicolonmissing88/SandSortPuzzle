# Water Sort Puzzle (React Native)

Pixel-perfect style clone of a Water Sort Puzzle mobile game UI — **original artwork/code**, not a copy of copyrighted assets.

## Stack

- Expo 52 + React Native + TypeScript
- React Navigation (native stack)
- Reanimated 3
- Gesture Handler
- React Native SVG
- MMKV (with in-memory fallback if native module unavailable)

## Run

```bash
cd C:\projects\WaterSortPuzzle
npm install
npx expo start
```

Then press `a` for Android emulator / Expo Go, or scan the QR code.

> **MMKV note:** Full MMKV persistence needs a Dev Client / native build. In Expo Go the app falls back to in-memory storage automatically.

## Features

- Home: coins, settings, logo, bottle preview, PLAY, bottom nav
- Gameplay: bottle grid, lift select, pour tilt + stream + bubbles
- Undo / Hint (DFS solver) / Extra bottle
- Level themes: beach / forest / night
- Win modal + confetti
- Progress save (level, coins, hints)

## Structure

```
src/
  components/   Bottle, UI chrome, effects
  screens/      HomeScreen, GameScreen
  navigation/   RootNavigator
  game/         engine, levels, types
  hooks/        useGame
  storage/      MMKV adapter
  theme/        colors
  utils/        responsive sizing
```

## Gameplay

1. Tap a bottle to select (lifts up)
2. Tap a valid target to pour
3. Sort each bottle to a single color
4. Auto-advance on win
