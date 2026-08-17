import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { sandTone } from '../theme/colors';
import type { LiquidColor } from '../theme/colors';

type Props = {
  visible: boolean;
  color: LiquidColor;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  durationMs?: number;
  startDelayMs?: number;
  amount?: number;
};

type Pt = { x: number; y: number };

function quad(p0: Pt, p1: Pt, p2: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

/**
 * Splash-art sand pour: thick continuous curved ribbon + impact splash.
 * Uses Views (not SVG dash) so it always renders on Android.
 */
export function PourStream({
  visible,
  color,
  fromX,
  fromY,
  toX,
  toY,
  durationMs = 280,
  startDelayMs = 120,
  amount = 1,
}: Props) {
  const tone = sandTone[color];
  const show = useSharedValue(0);

  const blobs = useMemo(() => {
    const p0 = { x: fromX, y: fromY };
    const p2 = { x: toX, y: toY };
    // Arc like the reference pink stream
    const p1 = {
      x: fromX + (toX - fromX) * 0.35,
      y: fromY + (toY - fromY) * 0.45 - 6,
    };
    const count = 18;
    const base = 9 + amount * 1.8;
    return Array.from({ length: count }, (_, i) => {
      const t = i / (count - 1);
      const pt = quad(p0, p1, p2, t);
      // Thick in middle, round at ends — continuous liquid look
      const bulge = Math.sin(t * Math.PI);
      const size = base * (0.55 + bulge * 0.55);
      return {
        id: i,
        x: pt.x,
        y: pt.y,
        size,
        highlight: i % 3 !== 0,
      };
    });
  }, [amount, fromX, fromY, toX, toY]);

  useEffect(() => {
    show.value = 0;
    show.value = withDelay(
      startDelayMs,
      withSequence(
        withTiming(1, { duration: 70, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: Math.max(120, durationMs - 140) }),
        withTiming(0, { duration: 70, easing: Easing.in(Easing.quad) }),
      ),
    );
    return () => cancelAnimation(show);
  }, [durationMs, show, startDelayMs]);

  const streamStyle = useAnimatedStyle(() => ({
    opacity: show.value,
    transform: [{ scaleY: 0.85 + show.value * 0.15 }],
  }));

  const splashStyle = useAnimatedStyle(() => ({
    opacity: show.value * 0.95,
    transform: [{ scale: 0.6 + show.value * 0.55 }],
  }));

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={styles.layer}>
      <Animated.View style={[styles.streamLayer, streamStyle]}>
        {/* Soft glow under stream */}
        {blobs.map((b) => (
          <View
            key={`g-${b.id}`}
            style={[
              styles.blob,
              {
                left: b.x - b.size * 0.7,
                top: b.y - b.size * 0.7,
                width: b.size * 1.4,
                height: b.size * 1.4,
                borderRadius: b.size,
                backgroundColor: tone.spark,
                opacity: 0.28,
              },
            ]}
          />
        ))}
        {/* Core sand ribbon */}
        {blobs.map((b) => (
          <View
            key={`c-${b.id}`}
            style={[
              styles.blob,
              {
                left: b.x - b.size / 2,
                top: b.y - b.size / 2,
                width: b.size,
                height: b.size,
                borderRadius: b.size,
                backgroundColor: b.highlight ? tone.highlight : tone.mid,
                borderColor: tone.spark,
                borderWidth: 0.8,
                shadowColor: tone.spark,
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Impact splash into receiving bottle */}
      <Animated.View style={[styles.splashWrap, { left: toX - 22, top: toY - 14 }, splashStyle]}>
        <View
          style={[
            styles.pool,
            {
              backgroundColor: tone.mid,
              borderColor: tone.highlight,
              shadowColor: tone.spark,
            },
          ]}
        />
        {[
          { x: 8, y: 0, s: 7 },
          { x: 28, y: -2, s: 6 },
          { x: 17, y: -8, s: 5 },
          { x: 4, y: 8, s: 5 },
          { x: 33, y: 7, s: 4.5 },
          { x: 20, y: 4, s: 4 },
        ].map((d, i) => (
          <View
            key={i}
            style={[
              styles.drop,
              {
                left: d.x,
                top: d.y,
                width: d.s,
                height: d.s,
                borderRadius: d.s,
                backgroundColor: i % 2 === 0 ? tone.highlight : tone.mid,
                shadowColor: tone.spark,
              },
            ]}
          />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1100,
    elevation: 1100,
  },
  streamLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  blob: {
    position: 'absolute',
    shadowOpacity: 0.85,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  splashWrap: {
    position: 'absolute',
    width: 44,
    height: 36,
  },
  pool: {
    position: 'absolute',
    left: 8,
    top: 16,
    width: 28,
    height: 11,
    borderRadius: 8,
    borderWidth: 1.2,
    shadowOpacity: 0.95,
    shadowRadius: 8,
  },
  drop: {
    position: 'absolute',
    shadowOpacity: 0.9,
    shadowRadius: 3,
  },
});
