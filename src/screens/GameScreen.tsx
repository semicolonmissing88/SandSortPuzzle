import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  LayoutChangeEvent,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Bottle } from '../components/Bottle';
import { Confetti } from '../components/Confetti';
import {
  GameActions,
  IconButton,
  MenuIcon,
  RestartIcon,
  SettingsGearIcon,
} from '../components/GameActions';
import { GameBackground } from '../components/GameBackground';
import { PourAnimation } from '../components/PourAnimation';
import { PressableScale } from '../components/PressableScale';
import { SettingsModal } from '../components/SettingsModal';
import { useGameController } from '../hooks/useGame';
import type { RootStackParamList } from '../navigation/types';
import { DEFAULT_BOTTLE_SKIN } from '../game/bottleSkins';
import { applyPour, isBottleComplete } from '../game/engine';
import type { BottleState } from '../game/types';
import { EMPTY } from '../game/types';
import { loadProgress, maxPlayableLevel, saveProgress, updateSettings } from '../storage/mmkv';
import { colors } from '../theme/colors';
import type { LiquidColor } from '../theme/colors';
import { bottleMetrics, hp, wp } from '../utils/responsive';
import {
  feedbackBottleFill,
  feedbackInvalid,
  feedbackPour,
  feedbackSelect,
  feedbackWin,
} from '../utils/feedback';

type PourFx = {
  from: number;
  to: number;
  color: LiquidColor;
  amount: number;
  targetFilledBefore: number;
  fromX: number;
  fromY: number;
  toCx: number;
  toTop: number;
  landY: number;
  tipRight: boolean;
  moveMs: number;
  streamMs: number;
  pouringBottle: BottleState;
};

export function GameScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Game'>>();
  const levelIndex = route.params?.levelIndex ?? 0;

  const game = useGameController(levelIndex);
  const { snapshot } = game;
  const metrics = useMemo(() => bottleMetrics(snapshot.bottles.length), [snapshot.bottles.length]);

  const [pourFx, setPourFx] = useState<PourFx | null>(null);
  const [winVisible, setWinVisible] = useState(false);
  const [pauseVisible, setPauseVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(() => loadProgress().settings);
  const [toast, setToast] = useState<string | null>(null);
  const bottleSkin = DEFAULT_BOTTLE_SKIN;
  const layouts = useRef<Record<number, { x: number; y: number; w: number; h: number }>>({});
  const boardOrigin = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const max = maxPlayableLevel();
    if (levelIndex > max) {
      navigation.replace('LevelMap', { focusLevel: max });
      return;
    }
    game.loadLevel(levelIndex);
  }, [levelIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  };

  const onBottleLayout = (index: number, e: LayoutChangeEvent) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    layouts.current[index] = { x, y, w: width, h: height };
  };

  const onBoardLayout = (e: LayoutChangeEvent) => {
    boardOrigin.current = { x: e.nativeEvent.layout.x, y: e.nativeEvent.layout.y };
  };

  const completeLevel = useCallback(() => {
    const progress = loadProgress();
    progress.coins += 50;
    if (snapshot.levelIndex >= progress.level) {
      progress.level = snapshot.levelIndex + 1;
    }
    saveProgress(progress);
    setWinVisible(true);
    feedbackWin();
  }, [snapshot.levelIndex]);

  const handleBottle = async (index: number) => {
    const result = game.selectBottle(index);
    if (result.type === 'select' || result.type === 'reselect') {
      feedbackSelect();
      return;
    }
    if (result.type === 'deselect') {
      feedbackSelect();
      return;
    }
    if (result.type === 'invalid' || result.type === 'empty') {
      const msg =
        result.type === 'empty'
          ? 'Empty tube'
          : result.reason === 'color-mismatch'
            ? 'Top colors must match'
            : result.reason === 'target-full'
              ? 'Tube is full'
              : result.reason === 'already-sorted'
                ? 'Already sorted'
                : "Can't pour there";
      showToast(msg);
      feedbackInvalid();
      return;
    }
    if (result.type !== 'pour' || !result.pour) return;

    feedbackPour();

    const fromL = layouts.current[result.pour.from];
    const toL = layouts.current[result.pour.to];
    const amount = Math.max(1, result.pour.amount);
    const moveMs = 420;
    const streamMs = 900 + amount * 220;
    const settleMs = 200;
    const pourMs = moveMs + streamMs + settleMs;

    if (fromL && toL) {
      const fromCx = fromL.x + fromL.w / 2;
      const toCx = toL.x + toL.w / 2;
      const tipRight = toCx >= fromCx;
      const filled = snapshot.bottles[result.pour.to].filter((s) => s !== EMPTY).length;
      // Land on current sand surface — stream only fills empty space above
      const landY = Math.max(
        toL.y + metrics.bottleH * 0.12,
        Math.min(
          toL.y + metrics.bottleH * 0.93 - filled * metrics.layerH,
          toL.y + metrics.bottleH * 0.9,
        ),
      );

      setPourFx({
        from: result.pour.from,
        to: result.pour.to,
        color: result.pour.color,
        amount,
        targetFilledBefore: filled,
        fromX: fromL.x,
        fromY: fromL.y,
        toCx,
        toTop: toL.y,
        landY,
        tipRight,
        moveMs,
        streamMs,
        pouringBottle: [...snapshot.bottles[result.pour.from]] as BottleState,
      });
    }

    const nextBoard = applyPour(snapshot.bottles, result.pour.from, result.pour.to);
    const bottleJustFilled =
      !isBottleComplete(snapshot.bottles[result.pour.to]) &&
      isBottleComplete(nextBoard[result.pour.to]);

    await new Promise((r) => setTimeout(r, pourMs));
    setPourFx(null);
    const won = game.finishPour();
    if (won || result.won) {
      completeLevel();
      return;
    }
    if (bottleJustFilled) feedbackBottleFill();
  };

  const goToMap = () => {
    setWinVisible(false);
    const next = snapshot.levelIndex + 1;
    navigation.navigate('LevelMap', { focusLevel: next });
  };

  return (
    <View style={styles.root}>
      <GameBackground theme={snapshot.theme} />
      <Confetti visible={winVisible} />

      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <IconButton onPress={() => setSettingsOpen(true)}>
          <SettingsGearIcon />
        </IconButton>
        <IconButton onPress={() => setPauseVisible(true)}>
          <MenuIcon />
        </IconButton>
        <View style={styles.levelBlock}>
          <Text style={styles.levelTitle}>Level {snapshot.levelId}</Text>
          <View style={styles.levelStars}>
            {[0, 1, 2].map((i) => (
              <Text key={i} style={styles.levelStar}>
                ★
              </Text>
            ))}
          </View>
        </View>
        <IconButton
          onPress={() =>
            Alert.alert('Reset Level?', 'Start this level over?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Reset', onPress: () => game.reset() },
            ])
          }
        >
          <RestartIcon />
        </IconButton>
        <IconButton
          badge={snapshot.hintLeft}
          onPress={() => {
            const move = game.hint();
            if (!move) showToast(snapshot.hintLeft <= 0 ? 'No hints left' : 'No move found');
            else setTimeout(() => game.setHintMove(null), 2500);
          }}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Path d="M9 21h6M12 3a6 6 0 00-3 11v2h6v-2a6 6 0 00-3-11z" fill={colors.yellow} />
          </Svg>
        </IconButton>
      </View>

      <Pressable
        style={styles.boardWrap}
        onLayout={onBoardLayout}
        onPress={() => game.clearSelection()}
      >
        <View
          style={[
            styles.board,
            {
              gap: metrics.gap,
              maxWidth: metrics.cols * metrics.bottleW + (metrics.cols - 1) * metrics.gap + 8,
            },
          ]}
          pointerEvents="box-none"
        >
          {snapshot.bottles.map((bottle, index) => {
            const pouring = pourFx?.from === index;
            const receiving = pourFx?.to === index;

            return (
              <View
                key={`b-${index}`}
                collapsable={false}
                onLayout={(e) => onBottleLayout(index, e)}
              >
                {/* Source hidden in grid; shown face-locked via overlay */}
                <View style={{ opacity: pouring ? 0 : 1 }}>
                  <Bottle
                    bottle={bottle}
                    width={metrics.bottleW}
                    height={metrics.bottleH}
                    layerH={metrics.layerH}
                    shapeId={bottleSkin}
                    selected={snapshot.selected === index}
                    hintFrom={snapshot.hintMove?.[0] === index}
                    hintTo={snapshot.hintMove?.[1] === index}
                    receiving={receiving}
                    victory={isBottleComplete(bottle)}
                    onPress={() => handleBottle(index)}
                  />
                </View>
              </View>
            );
          })}

          {pourFx ? (
            <PourAnimation
              pouringBottle={pourFx.pouringBottle}
              width={metrics.bottleW}
              height={metrics.bottleH}
              layerH={metrics.layerH}
              shapeId={bottleSkin}
              color={pourFx.color}
              amount={pourFx.amount}
              targetFilledBefore={pourFx.targetFilledBefore}
              fromX={pourFx.fromX}
              fromY={pourFx.fromY}
              toCx={pourFx.toCx}
              toTop={pourFx.toTop}
              landY={pourFx.landY}
              tipRight={pourFx.tipRight}
              moveMs={pourFx.moveMs}
              streamMs={pourFx.streamMs}
            />
          ) : null}
        </View>
      </Pressable>

      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <GameActions
          undoLeft={snapshot.undoLeft}
          hintLeft={snapshot.hintLeft}
          onUndo={() => {
            if (!game.undo()) showToast('Nothing to undo');
          }}
          onHint={() => {
            const move = game.hint();
            if (!move) showToast(snapshot.hintLeft <= 0 ? 'No hints left' : 'No move found');
            else {
              setTimeout(() => game.setHintMove(null), 2500);
            }
          }}
        />
      </View>

      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      <Modal transparent visible={winVisible} animationType="fade">
        <View style={styles.modalBackdrop}>
          {/* Day desert wash behind glass card */}
          <LinearGradient
            colors={['#5eb8ff', '#87ceeb', '#e0b04a']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.daySun} />
          <View style={styles.modalScrim} />
          <View style={styles.winModal}>
            <Text style={styles.winTitle}>LEVEL CLEARED!</Text>
            <View style={styles.starsRow}>
              {['★', '★', '★'].map((s, i) => (
                <Text key={i} style={[styles.star, i === 1 && styles.starBig]}>
                  {s}
                </Text>
              ))}
            </View>
            <View style={styles.coinRow}>
              <View style={styles.coinIcon} />
              <Text style={styles.coinsEarned}>Coins Earned: 50</Text>
            </View>
            <View style={styles.modalActionsCol}>
              <PressableScale onPress={goToMap} style={styles.ctaWrap}>
                <LinearGradient
                  colors={[colors.gradientBlue, colors.gradientPurple]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.ctaBtn}
                >
                  <Text style={styles.btnWhite}>Continue</Text>
                </LinearGradient>
              </PressableScale>
              <PressableScale
                style={styles.menuBtn}
                onPress={() => {
                  setWinVisible(false);
                  navigation.navigate('Home');
                }}
              >
                <Text style={styles.btnWhite}>Main Menu</Text>
              </PressableScale>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={pauseVisible} animationType="fade">
        <View style={styles.pauseBackdrop}>
          <LinearGradient
            colors={['#061018', '#0a1a38', '#122848']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.moon} />
          <View style={styles.starDotA} />
          <View style={styles.starDotB} />
          <View style={styles.starDotC} />
          <View style={styles.pauseModal}>
            <Text style={styles.pauseTitle}>PAUSE</Text>
            <PressableScale style={styles.pauseBtn} onPress={() => setPauseVisible(false)}>
              <Text style={styles.pauseBtnText}>Resume</Text>
            </PressableScale>
            <PressableScale
              style={styles.pauseBtn}
              onPress={() => {
                setPauseVisible(false);
                navigation.navigate('LevelMap', { focusLevel: snapshot.levelIndex });
              }}
            >
              <Text style={styles.pauseBtnText}>Quit to Map</Text>
              <View style={styles.quitGlint} />
            </PressableScale>
          </View>
        </View>
      </Modal>

      <SettingsModal
        visible={settingsOpen}
        settings={settings}
          onChange={(patch) => {
            const next = updateSettings(patch);
            setSettings(next.settings);
          }}
        onClose={() => setSettingsOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    paddingHorizontal: wp(12),
  },
  levelBlock: {
    flex: 1,
    alignItems: 'center',
  },
  levelTitle: {
    textAlign: 'center',
    color: '#ffffff',
    fontSize: wp(24),
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  levelStars: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  levelStar: {
    color: colors.sand.gold,
    fontSize: wp(14),
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  boardWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(8),
    paddingBottom: hp(8),
    overflow: 'visible',
  },
  board: {
    position: 'relative',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'center',
    overflow: 'visible',
  },
  actions: {
    paddingHorizontal: wp(14),
    paddingTop: 10,
  },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: hp(120),
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(10,20,40,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  toastText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: wp(13),
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    overflow: 'hidden',
  },
  daySun: {
    position: 'absolute',
    top: hp(80),
    left: wp(40),
    width: wp(90),
    height: wp(90),
    borderRadius: 999,
    backgroundColor: '#ffd93b',
    opacity: 0.85,
  },
  modalScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,8,20,0.35)',
  },
  winModal: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 22,
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
  },
  winTitle: {
    color: '#ffffff',
    fontSize: wp(26),
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  star: {
    color: colors.sand.gold,
    fontSize: wp(36),
    textShadowColor: 'rgba(180,120,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  starBig: {
    fontSize: wp(44),
    marginTop: -6,
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 22,
  },
  coinIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.sand.gold,
    borderWidth: 2,
    borderColor: '#E5B800',
  },
  coinsEarned: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: wp(15),
  },
  modalActionsCol: {
    width: '100%',
    gap: 10,
  },
  ctaWrap: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  ctaBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 999,
  },
  menuBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: colors.gradientPurple,
    alignItems: 'center',
  },
  btnWhite: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  pauseBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    overflow: 'hidden',
  },
  moon: {
    position: 'absolute',
    top: hp(90),
    right: wp(48),
    width: wp(56),
    height: wp(56),
    borderRadius: 999,
    backgroundColor: '#f0f4ff',
    shadowColor: '#fff',
    shadowOpacity: 0.7,
    shadowRadius: 16,
  },
  starDotA: {
    position: 'absolute',
    top: hp(70),
    left: wp(60),
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  starDotB: {
    position: 'absolute',
    top: hp(140),
    left: wp(120),
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#fff',
    opacity: 0.8,
  },
  starDotC: {
    position: 'absolute',
    top: hp(110),
    right: wp(100),
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#fff',
    opacity: 0.7,
  },
  pauseModal: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 22,
    padding: 28,
    backgroundColor: 'rgba(12,20,40,0.62)',
    borderWidth: 1.5,
    borderColor: 'rgba(180,200,255,0.32)',
    alignItems: 'center',
    gap: 14,
  },
  pauseTitle: {
    color: '#ffffff',
    fontSize: wp(32),
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 8,
  },
  pauseBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(40,48,64,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  pauseBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
  quitGlint: {
    position: 'absolute',
    top: 4,
    right: 18,
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
});
