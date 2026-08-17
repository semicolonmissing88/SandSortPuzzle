import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { colors } from '../theme/colors';
import { hp, screen, wp } from '../utils/responsive';

const { width: W, height: H } = screen;

const SANDS = [
  colors.sand.gold,
  colors.sand.roseGold,
  colors.sand.teal,
  colors.sand.emerald,
  colors.sand.amethyst,
] as const;

function SandGrain({ delay, color }: { delay: number; color: string }) {
  const y = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 120 }),
          withTiming(1, { duration: 380 }),
          withTiming(0, { duration: 120 }),
        ),
        -1,
        false,
      ),
    );
    y.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(28, { duration: 620, easing: Easing.in(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, opacity, y]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }));

  return <Animated.View style={[styles.drop, { backgroundColor: color }, style]} />;
}

export function AppLoader() {
  const bob = useSharedValue(0);
  const pulse = useSharedValue(0.92);

  useEffect(() => {
    bob.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0.92, { duration: 700 })),
      -1,
      false,
    );
  }, [bob, pulse]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value * -8 }, { scale: pulse.value }],
  }));

  return (
    <View style={styles.root}>
      <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="splashSky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#5eb8ff" />
            <Stop offset="0.45" stopColor="#87ceeb" />
            <Stop offset="0.7" stopColor="#c4a574" />
            <Stop offset="1" stopColor="#d4a84b" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={W} height={H} fill="url(#splashSky)" />
        <Ellipse cx={W * 0.18} cy={H * 0.14} rx={55} ry={55} fill="#ffe566" opacity={0.35} />
        <Circle cx={W * 0.18} cy={H * 0.14} r={30} fill="#ffd93b" />
        <Path
          d={`M0 ${H * 0.62} Q ${W * 0.3} ${H * 0.52} ${W * 0.55} ${H * 0.64} Q ${W * 0.8} ${H * 0.74} ${W} ${H * 0.6} L ${W} ${H} L 0 ${H} Z`}
          fill="#c9953a"
        />
        <Path
          d={`M0 ${H * 0.78} Q ${W * 0.4} ${H * 0.7} ${W} ${H * 0.82} L ${W} ${H} L 0 ${H} Z`}
          fill="#e0b04a"
        />
      </Svg>

      <Animated.View style={[styles.logoWrap, logoStyle]}>
        <View style={styles.tube}>
          <View style={[styles.sandFill, { backgroundColor: colors.sand.gold }]} />
          <View style={styles.tubeShine} />
        </View>
      </Animated.View>

      <Text style={styles.titleSand}>SAND</Text>
      <Text style={styles.titleSort}>SORT</Text>
      <Text style={styles.titlePuzzle}>PUZZLE</Text>
      <Text style={styles.sub}>Loading desert sands…</Text>

      <View style={styles.dots}>
        {SANDS.map((c, i) => (
          <SandGrain key={c} delay={i * 120} color={c} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: hp(40),
  },
  logoWrap: {
    width: wp(100),
    height: wp(160),
    marginBottom: hp(18),
    alignItems: 'center',
  },
  tube: {
    width: wp(56),
    height: wp(140),
    borderRadius: wp(18),
    borderWidth: 2.5,
    borderColor: 'rgba(220,235,255,0.7)',
    backgroundColor: 'rgba(180,210,255,0.12)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  sandFill: {
    height: '78%',
    width: '100%',
  },
  tubeShine: {
    ...StyleSheet.absoluteFillObject,
    width: '28%',
    left: '12%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  titleSand: {
    color: '#ffffff',
    fontSize: wp(42),
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  titleSort: {
    marginTop: -hp(6),
    color: colors.sand.gold,
    fontSize: wp(42),
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  titlePuzzle: {
    marginTop: -hp(2),
    color: '#ffffff',
    fontSize: wp(20),
    fontWeight: '800',
    letterSpacing: 6,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  sub: {
    marginTop: hp(12),
    color: '#ffffff',
    fontWeight: '700',
    fontSize: wp(13),
    opacity: 0.85,
  },
  dots: {
    marginTop: hp(28),
    height: 40,
    width: wp(100),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  drop: {
    width: 12,
    height: 12,
    borderRadius: 99,
  },
});
