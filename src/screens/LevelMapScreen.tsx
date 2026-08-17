import React, { useCallback, useMemo, useRef } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { IconButton } from '../components/GameActions';
import { PressableScale } from '../components/PressableScale';
import type { RootStackParamList } from '../navigation/types';
import { LEVELS } from '../game/levels';
import { loadProgress } from '../storage/mmkv';
import { colors } from '../theme/colors';
import { hp, screen, wp } from '../utils/responsive';

const SET_SIZE = LEVELS.length; // 12 levels per set
const NODE = wp(58);
const ROW_H = hp(92);

type NodeState = 'locked' | 'current' | 'cleared';

function nodeState(index: number, unlockedMax: number): NodeState {
  if (index > unlockedMax) return 'locked';
  if (index === unlockedMax) return 'current';
  return 'cleared';
}

function setTitle(setIndex: number): string {
  const names = ['Desert Dunes', 'Sunset Sands', 'Moonlit Oasis', 'Crystal Caves', 'Golden Coast'];
  return names[setIndex % names.length];
}

export function LevelMapScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'LevelMap'>>();
  const scrollRef = useRef<ScrollView>(null);
  const [unlockedMax, setUnlockedMax] = React.useState(() => loadProgress().level);

  useFocusEffect(
    useCallback(() => {
      setUnlockedMax(loadProgress().level);
    }, []),
  );

  const focusIndex = route.params?.focusLevel ?? unlockedMax;

  const totalLevels = useMemo(() => {
    const sets = Math.max(1, Math.ceil((unlockedMax + 1) / SET_SIZE));
    // Show full current set + next locked set peek (like Candy Crush)
    return Math.max(SET_SIZE, sets * SET_SIZE + SET_SIZE);
  }, [unlockedMax]);

  const nodes = useMemo(() => {
    const list: { index: number; x: number; y: number; state: NodeState; set: number }[] = [];
    const padX = wp(28);
    const usable = screen.width - padX * 2 - NODE;
    for (let i = 0; i < totalLevels; i += 1) {
      const row = i; // bottom-up: level 0 near bottom
      const zigzag = i % 2 === 0 ? 0.22 : 0.78;
      const x = padX + usable * zigzag;
      // Render from top of scroll: highest level at y=0, level 0 at bottom
      const y = (totalLevels - 1 - i) * ROW_H + hp(40);
      list.push({
        index: i,
        x,
        y,
        state: nodeState(i, unlockedMax),
        set: Math.floor(i / SET_SIZE),
      });
    }
    return list;
  }, [totalLevels, unlockedMax]);

  const contentH = totalLevels * ROW_H + hp(160);

  const scrollToFocus = useCallback(() => {
    const idx = Math.min(Math.max(focusIndex, 0), totalLevels - 1);
    const y = (totalLevels - 1 - idx) * ROW_H - screen.height * 0.35;
    scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: true });
  }, [focusIndex, totalLevels]);

  useFocusEffect(
    useCallback(() => {
      const t = setTimeout(scrollToFocus, 80);
      return () => clearTimeout(t);
    }, [scrollToFocus]),
  );

  const playLevel = (index: number, state: NodeState) => {
    if (state === 'locked') {
      Alert.alert('Locked', 'Clear earlier levels to unlock this one.');
      return;
    }
    navigation.navigate('Game', { levelIndex: index });
  };

  const pathD = useMemo(() => {
    if (nodes.length < 2) return '';
    // Draw path in visual order (top to bottom = high index → low)
    const ordered = [...nodes].sort((a, b) => a.y - b.y);
    let d = `M ${ordered[0].x + NODE / 2} ${ordered[0].y + NODE / 2}`;
    for (let i = 1; i < ordered.length; i += 1) {
      const prev = ordered[i - 1];
      const cur = ordered[i];
      const midY = (prev.y + cur.y) / 2 + NODE / 2;
      d += ` Q ${prev.x + NODE / 2} ${midY} ${cur.x + NODE / 2} ${cur.y + NODE / 2}`;
    }
    return d;
  }, [nodes]);

  const setHeaders = useMemo(() => {
    const headers: { set: number; y: number; label: string }[] = [];
    for (let s = 0; s * SET_SIZE < totalLevels; s += 1) {
      const firstInSet = s * SET_SIZE;
      const node = nodes.find((n) => n.index === firstInSet);
      if (!node) continue;
      headers.push({
        set: s,
        y: node.y - hp(36),
        label: `SET ${s + 1} · ${setTitle(s)}`,
      });
    }
    return headers;
  }, [nodes, totalLevels]);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#5eb8ff', '#87ceeb', '#f0c36a', '#e0a04a']} style={StyleSheet.absoluteFill} />
      <View style={styles.hillA} />
      <View style={styles.hillB} />

      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <IconButton onPress={() => navigation.navigate('Home')}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
          </Svg>
        </IconButton>
        <Text style={styles.title}>LEVEL MAP</Text>
        <View style={{ width: wp(44) }} />
      </View>

      <Text style={styles.subtitle}>Level {unlockedMax + 1} ready · tap cleared levels to replay</Text>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={{ height: contentH, paddingBottom: insets.bottom + hp(24) }}
        showsVerticalScrollIndicator={false}
      >
        <Svg width={screen.width} height={contentH} style={StyleSheet.absoluteFill}>
          <Path
            d={pathD}
            stroke="rgba(255,255,255,0.55)"
            strokeWidth={8}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d={pathD}
            stroke="rgba(255, 210, 80, 0.85)"
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="10 8"
          />
        </Svg>

        {setHeaders.map((h) => (
          <View key={`set-${h.set}`} style={[styles.setBanner, { top: h.y, left: wp(24), right: wp(24) }]}>
            <Text style={styles.setText}>{h.label}</Text>
          </View>
        ))}

        {nodes.map((n) => {
          const label = n.index + 1;
          const isLocked = n.state === 'locked';
          const isCurrent = n.state === 'current';
          const isCleared = n.state === 'cleared';
          return (
            <PressableScale
              key={n.index}
              disabled={isLocked}
              onPress={() => playLevel(n.index, n.state)}
              style={[
                styles.node,
                {
                  left: n.x,
                  top: n.y,
                  width: NODE,
                  height: NODE,
                  borderRadius: NODE / 2,
                },
                isLocked && styles.nodeLocked,
                isCurrent && styles.nodeCurrent,
                isCleared && styles.nodeCleared,
              ]}
              scaleTo={isLocked ? 1 : 0.92}
            >
              {isLocked ? (
                <Svg width={22} height={22} viewBox="0 0 24 24">
                  <Path
                    d="M7 11V8a5 5 0 0110 0v3M6 11h12v10H6V11z"
                    fill="none"
                    stroke="#c8d0dc"
                    strokeWidth="2"
                  />
                </Svg>
              ) : (
                <>
                  <Text style={[styles.nodeNum, isCurrent && styles.nodeNumCurrent]}>{label}</Text>
                  {isCleared ? (
                    <View style={styles.starMark}>
                      <Text style={styles.starMarkText}>★</Text>
                    </View>
                  ) : null}
                </>
              )}
            </PressableScale>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#87ceeb',
  },
  hillA: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: screen.width * 0.7,
    height: hp(180),
    borderRadius: 999,
    backgroundColor: 'rgba(224, 160, 74, 0.55)',
  },
  hillB: {
    position: 'absolute',
    bottom: -60,
    right: -50,
    width: screen.width * 0.75,
    height: hp(200),
    borderRadius: 999,
    backgroundColor: 'rgba(200, 130, 50, 0.5)',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(12),
    zIndex: 2,
  },
  title: {
    color: '#0a1628',
    fontWeight: '900',
    fontSize: wp(20),
    letterSpacing: 1.5,
  },
  subtitle: {
    textAlign: 'center',
    color: 'rgba(10,22,40,0.75)',
    fontWeight: '700',
    fontSize: wp(12),
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: wp(16),
  },
  scroll: {
    flex: 1,
  },
  setBanner: {
    position: 'absolute',
    zIndex: 1,
    paddingVertical: hp(8),
    paddingHorizontal: wp(14),
    borderRadius: 999,
    backgroundColor: 'rgba(10, 22, 40, 0.72)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
  },
  setText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: wp(12),
    letterSpacing: 1,
  },
  node: {
    position: 'absolute',
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  nodeLocked: {
    backgroundColor: 'rgba(40, 55, 80, 0.75)',
    borderColor: 'rgba(180,190,210,0.4)',
    opacity: 0.85,
  },
  nodeCurrent: {
    backgroundColor: colors.gradientBlue,
    borderColor: '#FFE566',
    borderWidth: 4,
  },
  nodeCleared: {
    backgroundColor: colors.coinGreen,
    borderColor: '#ffffff',
  },
  nodeNum: {
    color: '#fff',
    fontWeight: '900',
    fontSize: wp(18),
  },
  nodeNumCurrent: {
    fontSize: wp(20),
  },
  starMark: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  starMarkText: {
    color: '#FFE566',
    fontSize: wp(14),
    fontWeight: '900',
  },
});
