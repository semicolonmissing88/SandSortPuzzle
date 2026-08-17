import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import type { BottleShapeId } from '../game/bottleSkins';
import type { BottleState } from '../game/types';
import { EMPTY } from '../game/types';
import { sandTone, type LiquidColor } from '../theme/colors';
import { Bottle } from './Bottle';

export type PourAnimProps = {
  pouringBottle: BottleState;
  width: number;
  height: number;
  layerH: number;
  shapeId?: BottleShapeId;
  color: LiquidColor;
  amount: number;
  /** How many sand layers already in the target before this pour */
  targetFilledBefore: number;
  fromX: number;
  fromY: number;
  toCx: number;
  toTop: number;
  landY: number;
  tipRight: boolean;
  moveMs: number;
  streamMs: number;
};

/** Soft sand column that grows down into the receiving bottle. */
function PourStream({
  x,
  fromY,
  toY,
  color,
  highlight,
  amount,
  startMs,
  durationMs,
}: {
  x: number;
  fromY: number;
  toY: number;
  color: string;
  highlight: string;
  amount: number;
  startMs: number;
  durationMs: number;
}) {
  const p = useSharedValue(0);
  const fullH = Math.max(14, toY - fromY);
  const thick = 10 + amount * 2;

  useEffect(() => {
    p.value = 0;
    p.value = withDelay(
      startMs,
      withTiming(1, { duration: durationMs, easing: Easing.inOut(Easing.cubic) }),
    );
    return () => cancelAnimation(p);
  }, [durationMs, p, startMs]);

  const colStyle = useAnimatedStyle(() => {
    const grow = interpolate(p.value, [0, 0.18, 0.68, 1], [0, 1, 1, 0], Extrapolation.CLAMP);
    const opacity = interpolate(p.value, [0, 0.08, 0.7, 0.92, 1], [0, 1, 1, 0, 0], Extrapolation.CLAMP);
    const w = interpolate(p.value, [0, 0.2, 0.7, 1], [thick * 0.75, thick, thick, thick * 0.65], Extrapolation.CLAMP);
    return {
      height: Math.max(0, fullH * grow),
      width: w,
      left: x - w / 2,
      opacity,
    };
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          styles.streamCore,
          { top: fromY, backgroundColor: color, borderColor: highlight },
          colStyle,
        ]}
      />
    </View>
  );
}

/**
 * Sand visibly rises inside the target bottle while pouring.
 */
function RisingFill({
  bottleLeft,
  bottleTop,
  bottleW,
  bottleH,
  layerH,
  color,
  startLayers,
  amount,
  startMs,
  durationMs,
}: {
  bottleLeft: number;
  bottleTop: number;
  bottleW: number;
  bottleH: number;
  layerH: number;
  color: LiquidColor;
  startLayers: number;
  amount: number;
  startMs: number;
  durationMs: number;
}) {
  const p = useSharedValue(0);
  const tone = sandTone[color];
  const fillTop = bottleH * 0.11;
  const fillBottom = bottleH * 0.93;
  const capacity = 5;
  const unit = (fillBottom - fillTop) / capacity;
  const sandW = bottleW * 0.56;
  const leftPad = (bottleW - sandW) / 2;

  const baseH = startLayers * unit;
  const addH = amount * unit;

  useEffect(() => {
    p.value = 0;
    p.value = withDelay(
      startMs,
      withTiming(1, { duration: durationMs, easing: Easing.out(Easing.cubic) }),
    );
    return () => cancelAnimation(p);
  }, [durationMs, p, startMs]);

  const fillStyle = useAnimatedStyle(() => {
    const h = baseH + addH * interpolate(p.value, [0, 1], [0, 1], Extrapolation.CLAMP);
    const opacity = interpolate(p.value, [0, 0.05, 0.9, 1], [0, 0.95, 0.95, 0], Extrapolation.CLAMP);
    return {
      height: Math.max(0, h),
      opacity,
      bottom: bottleH - fillBottom,
    };
  });

  return (
    <View
      pointerEvents="none"
      style={[
        styles.fillClip,
        {
          left: bottleLeft + leftPad,
          top: bottleTop,
          width: sandW,
          height: bottleH,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.risingSand,
          {
            backgroundColor: tone.mid,
            borderTopColor: tone.highlight,
          },
          fillStyle,
        ]}
      />
    </View>
  );
}

function drainTop(bottle: BottleState, n: number): BottleState {
  const next = [...bottle] as BottleState;
  let left = n;
  for (let i = next.length - 1; i >= 0 && left > 0; i -= 1) {
    if (next[i] !== EMPTY) {
      next[i] = EMPTY;
      left -= 1;
    }
  }
  return next;
}

/**
 * Pour demo motion:
 * 1) Source mouth moves until it touches target mouth
 * 2) Tips to pour
 * 3) Stream + target fill rises
 * 4) As source empties, bottle lifts up from behind
 */
export function PourAnimation({
  pouringBottle,
  width,
  height,
  layerH,
  shapeId,
  color,
  amount,
  targetFilledBefore,
  fromX,
  fromY,
  toCx,
  toTop,
  landY,
  tipRight,
  moveMs,
  streamMs,
}: PourAnimProps) {
  const tone = sandTone[color];
  const tipDeg = tipRight ? 58 : -58;
  const rimY = height * 0.07;

  // Mouths touch — source rim sits on target rim
  const fromMouthX = fromX + width / 2;
  const fromMouthY = fromY + rimY;
  const touchX = toCx + (tipRight ? -width * 0.02 : width * 0.02);
  const touchY = toTop + rimY - 2;

  // After tip, keep lifting the bottle up while sand drains
  const liftExtra = height * 0.22;

  const streamStart = Math.round(moveMs * 0.55);
  const t = useSharedValue(0);
  const lift = useSharedValue(0);

  const [visualBottle, setVisualBottle] = useState(pouringBottle);

  useEffect(() => {
    t.value = 0;
    lift.value = 0;
    t.value = withTiming(1, {
      duration: moveMs,
      easing: Easing.inOut(Easing.cubic),
    });
    lift.value = withDelay(
      streamStart,
      withTiming(1, { duration: streamMs, easing: Easing.out(Easing.cubic) }),
    );
    return () => {
      cancelAnimation(t);
      cancelAnimation(lift);
    };
  }, [lift, moveMs, streamMs, streamStart, t]);

  // Drain source layers one-by-one so emptying is visible
  useEffect(() => {
    setVisualBottle(pouringBottle);
    if (amount <= 0) return;
    const step = Math.max(120, Math.floor(streamMs / amount));
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= amount; i += 1) {
      timers.push(
        setTimeout(() => {
          setVisualBottle(drainTop(pouringBottle, i));
        }, streamStart + step * i),
      );
    }
    return () => timers.forEach(clearTimeout);
  }, [amount, pouringBottle, streamMs, streamStart]);

  const targetLeft = useMemo(() => toCx - width / 2, [toCx, width]);

  const anchorStyle = useAnimatedStyle(() => {
    const mx = interpolate(t.value, [0, 1], [fromMouthX, touchX], Extrapolation.CLAMP);
    const my = interpolate(t.value, [0, 1], [fromMouthY, touchY], Extrapolation.CLAMP);
    // As it empties, rise up from behind the target
    const up = interpolate(lift.value, [0, 1], [0, -liftExtra], Extrapolation.CLAMP);
    return { left: mx, top: my + up };
  });

  const tipStyle = useAnimatedStyle(() => {
    const rot = interpolate(t.value, [0.28, 0.92], [0, tipDeg], Extrapolation.CLAMP);
    // Slight extra tip while draining
    const extra = interpolate(lift.value, [0, 1], [0, tipRight ? 6 : -6], Extrapolation.CLAMP);
    return { transform: [{ rotate: `${rot + extra}deg` }] };
  });

  const streamFromY = touchY + 4;
  const streamToY = Math.max(streamFromY + 18, Math.min(landY, toTop + height * 0.88));

  return (
    <View pointerEvents="none" style={styles.layer}>
      {/* Target fill rises under the stream */}
      <RisingFill
        bottleLeft={targetLeft}
        bottleTop={toTop}
        bottleW={width}
        bottleH={height}
        layerH={layerH}
        color={color}
        startLayers={targetFilledBefore}
        amount={amount}
        startMs={streamStart}
        durationMs={streamMs}
      />

      <Animated.View style={[styles.anchor, anchorStyle]}>
        <Animated.View style={tipStyle}>
          <View style={[styles.bottleWrap, { width, height, left: -width / 2, top: -rimY }]}>
            <Bottle
              bottle={visualBottle}
              width={width}
              height={height}
              layerH={layerH}
              shapeId={shapeId}
              pourZIndex={1000}
            />
          </View>
        </Animated.View>
      </Animated.View>

      <PourStream
        x={toCx}
        fromY={streamFromY}
        toY={streamToY}
        color={tone.mid}
        highlight={tone.highlight}
        amount={amount}
        startMs={streamStart}
        durationMs={streamMs}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1200,
    elevation: 1200,
  },
  anchor: {
    position: 'absolute',
    width: 0,
    height: 0,
    zIndex: 1210,
  },
  bottleWrap: {
    position: 'absolute',
  },
  streamCore: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
  },
  fillClip: {
    position: 'absolute',
    overflow: 'hidden',
    zIndex: 1100,
  },
  risingSand: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 3,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
});
