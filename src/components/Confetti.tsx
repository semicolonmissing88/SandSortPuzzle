import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { hp, wp } from '../utils/responsive';

type Particle = { id: number; x: number; color: string; delay: number; size: number };

const PARTICLES: Particle[] = Array.from({ length: 10 }).map((_, i) => ({
  id: i,
  x: (i / 10) * wp(300) - wp(150),
  color: Object.values(colors.liquids)[i % 10],
  delay: (i % 8) * 40,
  size: wp(6 + (i % 5)),
}));

function ConfettiPiece({ p }: { p: Particle }) {
  const y = useSharedValue(-20);
  const rot = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    y.value = withDelay(
      p.delay,
      withTiming(hp(420), { duration: 1600 + (p.id % 5) * 120, easing: Easing.out(Easing.quad) }),
    );
    rot.value = withDelay(
      p.delay,
      withRepeat(withTiming(360, { duration: 900 }), -1, false),
    );
    opacity.value = withDelay(
      p.delay + 1100,
      withTiming(0, { duration: 500 }),
    );
  }, [opacity, p.delay, p.id, rot, y]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: p.x + Math.sin(p.id) * 20 },
      { translateY: y.value },
      { rotate: `${rot.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          width: p.size,
          height: p.size * 1.4,
          backgroundColor: p.color,
          borderRadius: 2,
        },
        style,
      ]}
    />
  );
}

export function Confetti({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <View pointerEvents="none" style={styles.wrap}>
      {PARTICLES.map((p) => (
        <ConfettiPiece key={p.id} p={p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: hp(120),
    zIndex: 50,
  },
  piece: {
    position: 'absolute',
    top: 0,
  },
});
