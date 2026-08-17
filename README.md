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

## Play Store — How to Play screenshots

Phone 9:16 images for the store listing. Download from GitHub: open a file → **Download**.

| # | File | Step |
|---|---|---|
| 1 | [sand-sort-howto-01-goal.png](playstore/howto/sand-sort-howto-01-goal.png) | Goal — one color per bottle |
| 2 | [sand-sort-howto-02-select.png](playstore/howto/sand-sort-howto-02-select.png) | Tap a bottle to select |
| 3 | [sand-sort-howto-03-pour.png](playstore/howto/sand-sort-howto-03-pour.png) | Tap another bottle to pour |
| 4 | [sand-sort-howto-04-match.png](playstore/howto/sand-sort-howto-04-match.png) | Same top color or empty only |
| 5 | [sand-sort-howto-05-stream.png](playstore/howto/sand-sort-howto-05-stream.png) | Mouths touch, sand fills |
| 6 | [sand-sort-howto-06-complete.png](playstore/howto/sand-sort-howto-06-complete.png) | Fill one color to complete |
| 7 | [sand-sort-howto-07-win.png](playstore/howto/sand-sort-howto-07-win.png) | Clear the level; Hint / Undo |

Folder: `playstore/howto/`

