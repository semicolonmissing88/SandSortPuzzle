import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';
import { colors } from '../theme/colors';
import { hp, screen, wp } from '../utils/responsive';
import { Bottle } from './Bottle';
import type { BottleState } from '../game/types';
import type { BottleShapeId } from '../game/bottleSkins';
import { DEFAULT_BOTTLE_SKIN } from '../game/bottleSkins';

const { width: W, height: H } = screen;

const PREVIEW: BottleState[] = [
  ['PINK', 'GREEN', 'BLUE', 'ORANGE', 'PURPLE'],
  ['ORANGE', 'PURPLE', 'PINK', 'GREEN', 'EMPTY'],
  ['BLUE', 'ORANGE', 'GREEN', 'EMPTY', 'EMPTY'],
];

export function GameLogo() {
  const bob = useSharedValue(0);

  useEffect(() => {
    bob.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [bob]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value * -6 }],
  }));

  return (
    <Animated.View style={[styles.wrap, logoStyle]}>
      <Text style={styles.sand}>SAND</Text>
      <Text style={styles.sort}>SORT</Text>
      <Text style={styles.puzzle}>PUZZLE</Text>
    </Animated.View>
  );
}

export function HomeBottlePreview({ shapeId = DEFAULT_BOTTLE_SKIN }: { shapeId?: BottleShapeId }) {
  const tilt = useSharedValue(0);
  const pourTx = wp(8);
  const pourTy = -hp(18);

  useEffect(() => {
    tilt.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [tilt]);

  const pourStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pourTx },
      { translateY: pourTy - tilt.value * 4 },
      { rotate: `${-34 - tilt.value * 8}deg` },
    ],
  }));

  const streamStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + tilt.value * 0.4,
    transform: [{ scaleY: 0.9 + tilt.value * 0.15 }],
  }));

  const w = wp(42);
  const h = hp(120);
  const layer = Math.round(h * 0.22);

  return (
    <View style={styles.preview}>
      <View style={[styles.previewBottle, { left: wp(18), transform: [{ rotate: '-4deg' }] }]}>
        <Bottle bottle={PREVIEW[0]} width={w} height={h} layerH={layer} shapeId={shapeId} victory />
      </View>
      <Animated.View style={[styles.previewBottle, { left: wp(88), zIndex: 2 }, pourStyle]}>
        <Bottle bottle={PREVIEW[1]} width={w} height={h} layerH={layer} shapeId={shapeId} pouring pourAngle={0} />
      </Animated.View>
      <View style={[styles.previewBottle, { right: wp(18), transform: [{ rotate: '5deg' }] }]}>
        <Bottle bottle={PREVIEW[2]} width={w} height={h} layerH={layer} shapeId={shapeId} />
      </View>
      <Animated.View style={[styles.stream, streamStyle]} />
    </View>
  );
}

export function HomeBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="homeSky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#4aa8ef" />
            <Stop offset="0.4" stopColor="#7ec8f0" />
            <Stop offset="0.65" stopColor="#c9a86c" />
            <Stop offset="1" stopColor="#d4a84b" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={W} height={H} fill="url(#homeSky)" />
        <Ellipse cx={W * 0.2} cy={H * 0.12} rx={55} ry={55} fill="#ffe566" opacity={0.35} />
        <Circle cx={W * 0.2} cy={H * 0.12} r={30} fill="#ffd93b" />
        <Path
          d={`M0 ${H * 0.62} Q ${W * 0.3} ${H * 0.52} ${W * 0.55} ${H * 0.64} Q ${W * 0.8} ${H * 0.74} ${W} ${H * 0.6} L ${W} ${H} L 0 ${H} Z`}
          fill="#c9953a"
        />
        <Path
          d={`M0 ${H * 0.78} Q ${W * 0.4} ${H * 0.7} ${W} ${H * 0.82} L ${W} ${H} L 0 ${H} Z`}
          fill="#e0b04a"
        />
        {[
          [0.72, 0.18],
          [0.85, 0.28],
          [0.65, 0.32],
        ].map(([x, y], i) => (
          <Circle key={i} cx={W * x} cy={H * y} r={1.5} fill="#fff" opacity={0.35} />
        ))}
      </Svg>
      <View style={styles.vignette} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  sand: {
    fontSize: wp(52),
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
    includeFontPadding: false,
  },
  sort: {
    marginTop: -hp(8),
    fontSize: wp(52),
    fontWeight: '900',
    color: colors.sand.gold,
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
    includeFontPadding: false,
  },
  puzzle: {
    marginTop: -hp(4),
    fontSize: wp(22),
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 6,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  preview: {
    width: wp(260),
    height: hp(170),
    marginVertical: hp(6),
  },
  previewBottle: {
    position: 'absolute',
    bottom: hp(8),
  },
  stream: {
    position: 'absolute',
    left: '56%',
    top: hp(48),
    width: wp(5),
    height: hp(70),
    borderRadius: 4,
    backgroundColor: colors.sand.roseGold,
    shadowColor: colors.sand.roseGold,
    shadowOpacity: 0.7,
    shadowRadius: 8,
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,16,32,0.12)',
  },
});
