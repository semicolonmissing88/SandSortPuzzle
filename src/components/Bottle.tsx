import React, { useEffect, useId, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Mask,
  Path,
  Stop,
} from 'react-native-svg';
import { getBottleSkin, type BottleShapeId } from '../game/bottleSkins';
import { sandTone, type LiquidColor } from '../theme/colors';
import type { BottleState } from '../game/types';
import { EMPTY } from '../game/types';

type Props = {
  bottle: BottleState;
  width: number;
  height: number;
  layerH: number;
  shapeId?: BottleShapeId;
  selected?: boolean;
  hintFrom?: boolean;
  hintTo?: boolean;
  pouring?: boolean;
  receiving?: boolean;
  pourAngle?: number;
  pourShiftX?: number;
  pourShiftY?: number;
  pourZIndex?: number;
  victory?: boolean;
  onPress?: () => void;
};

/** Beaker outline: flared rim, straight cylinder, U-bottom. */
function beakerOutline(w: number, h: number): string {
  const cx = w / 2;
  const left = w * 0.2;
  const right = w * 0.8;
  const lip = w * 0.055;
  const rimY = h * 0.07;
  const neck = rimY + h * 0.03;
  const bot = h * 0.965;
  const botR = (right - left) * 0.5;

  return [
    `M ${cx - (right - left) / 2 - lip} ${rimY}`,
    `Q ${cx - (right - left) / 2 - lip} ${rimY - h * 0.012} ${cx - (right - left) / 2} ${rimY - h * 0.008}`,
    `L ${cx + (right - left) / 2} ${rimY - h * 0.008}`,
    `Q ${cx + (right - left) / 2 + lip} ${rimY - h * 0.012} ${cx + (right - left) / 2 + lip} ${rimY}`,
    `L ${right} ${neck}`,
    `L ${right} ${bot - botR}`,
    `Q ${right} ${bot} ${cx} ${bot}`,
    `Q ${left} ${bot} ${left} ${bot - botR}`,
    `L ${left} ${neck}`,
    `L ${cx - (right - left) / 2 - lip} ${rimY}`,
    'Z',
  ].join(' ');
}

function beakerClip(w: number, h: number): string {
  const cx = w / 2;
  const left = w * 0.22;
  const right = w * 0.78;
  const top = h * 0.095;
  const bot = h * 0.955;
  const botR = (right - left) * 0.48;
  return [
    `M ${left} ${top}`,
    `L ${right} ${top}`,
    `L ${right} ${bot - botR}`,
    `Q ${right} ${bot} ${cx} ${bot}`,
    `Q ${left} ${bot} ${left} ${bot - botR}`,
    'Z',
  ].join(' ');
}

export function Bottle({
  bottle,
  width,
  height,
  layerH: _layerH,
  shapeId = 'classic',
  selected,
  hintFrom,
  hintTo,
  pouring,
  receiving,
  pourAngle = 0,
  pourShiftX = 0,
  pourShiftY = 0,
  pourZIndex = 1,
  victory,
  onPress,
}: Props) {
  void _layerH;
  getBottleSkin(shapeId);
  const uid = useId().replace(/:/g, '');

  const lift = useSharedValue(0);
  const rotate = useSharedValue(0);
  const shiftX = useSharedValue(0);
  const shiftY = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    lift.value = withSpring(selected || hintFrom ? 1 : 0, { damping: 14, stiffness: 180 });
  }, [hintFrom, lift, selected]);

  useEffect(() => {
    const dur = pouring ? 55 : 120;
    shiftX.value = withTiming(pouring ? pourShiftX : 0, {
      duration: dur,
      easing: Easing.out(Easing.cubic),
    });
    shiftY.value = withTiming(pouring ? pourShiftY : 0, {
      duration: dur,
      easing: Easing.out(Easing.cubic),
    });
    rotate.value = withTiming(pouring ? pourAngle : 0, {
      duration: pouring ? 55 : 120,
      easing: Easing.out(Easing.cubic),
    });
  }, [pourAngle, pourShiftX, pourShiftY, pouring, rotate, shiftX, shiftY]);

  useEffect(() => {
    if (hintFrom) {
      pulse.value = withRepeat(
        withSequence(withTiming(1, { duration: 420 }), withTiming(0, { duration: 420 })),
        -1,
        false,
      );
    } else {
      pulse.value = withTiming(0, { duration: 200 });
    }
  }, [hintFrom, pulse]);

  const svgW = width;
  const svgH = height;
  const neckPivot = svgH / 2;

  const outline = useMemo(() => beakerOutline(svgW, svgH), [svgW, svgH]);
  const clip = useMemo(() => beakerClip(svgW, svgH), [svgW, svgH]);

  const left = svgW * 0.22;
  const right = svgW * 0.78;
  const cx = svgW / 2;
  const sandW = right - left;
  const rimY = svgH * 0.07;
  const fillTop = svgH * 0.11;
  const fillBottom = svgH * 0.93;
  const capacity = Math.max(1, bottle.length);
  const unit = (fillBottom - fillTop) / capacity;
  const ellipseRy = Math.max(3.5, sandW * 0.12);

  const layers = useMemo(() => {
    const filled: LiquidColor[] = [];
    for (let i = 0; i < bottle.length; i += 1) {
      if (bottle[i] !== EMPTY) filled.push(bottle[i] as LiquidColor);
    }
    return filled;
  }, [bottle]);

  const animStyle = useAnimatedStyle(() => {
    const extra = interpolate(pulse.value, [0, 1], [0, -8]);
    const liftY = pouring ? 0 : interpolate(lift.value, [0, 1], [0, -12]) + extra;
    return {
      zIndex: pouring ? 999 : pourZIndex,
      elevation: pouring ? 40 : 8,
      transform: [
        { translateX: shiftX.value },
        { translateY: liftY + shiftY.value },
        { translateY: -neckPivot },
        { rotate: `${rotate.value}deg` },
        { translateY: neckPivot },
      ],
    };
  });

  const isVictory =
    victory ??
    (bottle.every((s) => s !== EMPTY) && bottle.every((s) => s === bottle[0]));

  const active = selected || hintFrom || hintTo || pouring || receiving || isVictory;
  const rimRx = sandW / 2 + svgW * 0.04;
  const rimRy = Math.max(4, svgW * 0.06);

  return (
    <Pressable onPress={onPress} hitSlop={6}>
      <Animated.View
        style={[
          styles.bottleRoot,
          {
            width: svgW,
            height: svgH + 4,
            shadowColor: '#000',
            shadowOpacity: active ? 0.35 : 0.16,
            shadowRadius: active ? 10 : 5,
          },
          animStyle,
        ]}
      >
        <Svg width={svgW} height={svgH}>
          <Defs>
            <LinearGradient id={`${uid}-glass`} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#ffffff" stopOpacity="0.12" />
              <Stop offset="0.5" stopColor="#ffffff" stopOpacity="0.03" />
              <Stop offset="1" stopColor="#ffffff" stopOpacity="0.1" />
            </LinearGradient>
            {layers.map((color, idx) => {
              const tone = sandTone[color];
              return (
                <LinearGradient
                  key={`g-${idx}-${color}`}
                  id={`${uid}-sand-${idx}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <Stop offset="0" stopColor={tone.deep} stopOpacity="1" />
                  <Stop offset="0.22" stopColor={tone.mid} stopOpacity="1" />
                  <Stop offset="0.5" stopColor={tone.highlight} stopOpacity="1" />
                  <Stop offset="0.78" stopColor={tone.mid} stopOpacity="1" />
                  <Stop offset="1" stopColor={tone.deep} stopOpacity="1" />
                </LinearGradient>
              );
            })}
            <Mask id={`${uid}-mask`} x={0} y={0} width={svgW} height={svgH}>
              <Path d={clip} fill="#FFFFFF" />
            </Mask>
            <ClipPath id={`${uid}-clip`}>
              <Path d={clip} />
            </ClipPath>
          </Defs>

          {/* Empty glass wash */}
          <Path d={clip} fill="#101010" fillOpacity={0.08} />

          <G mask={`url(#${uid}-mask)`} clipPath={`url(#${uid}-clip)`}>
            {layers.map((color, idx) => {
              const tone = sandTone[color];
              const isBottom = idx === 0;
              const isTop = idx === layers.length - 1;
              const yTop = fillBottom - (idx + 1) * unit;
              const yBot = fillBottom - idx * unit;
              const bodyTop = yTop + ellipseRy * 0.35;

              return (
                <G key={`${idx}-${color}`}>
                  {/* Cylinder body */}
                  <Path
                    d={
                      isBottom
                        ? [
                            `M ${left} ${bodyTop}`,
                            `L ${right} ${bodyTop}`,
                            `L ${right} ${fillBottom - sandW * 0.45}`,
                            `Q ${right} ${fillBottom} ${cx} ${fillBottom}`,
                            `Q ${left} ${fillBottom} ${left} ${fillBottom - sandW * 0.45}`,
                            'Z',
                          ].join(' ')
                        : [
                            `M ${left} ${bodyTop}`,
                            `L ${right} ${bodyTop}`,
                            `L ${right} ${yBot + ellipseRy * 0.2}`,
                            `L ${left} ${yBot + ellipseRy * 0.2}`,
                            'Z',
                          ].join(' ')
                    }
                    fill={`url(#${uid}-sand-${idx})`}
                  />
                  {/* 3D elliptical top surface */}
                  <Ellipse
                    cx={cx}
                    cy={yTop + ellipseRy * 0.55}
                    rx={sandW / 2 - 0.5}
                    ry={ellipseRy}
                    fill={tone.mid}
                  />
                  <Ellipse
                    cx={cx}
                    cy={yTop + ellipseRy * 0.4}
                    rx={sandW / 2 * 0.72}
                    ry={ellipseRy * 0.45}
                    fill={tone.highlight}
                    opacity={isTop ? 0.45 : 0.28}
                  />
                </G>
              );
            })}

            {/* Glass shine streaks */}
            <Path
              d={`M ${left + sandW * 0.12} ${fillTop} L ${left + sandW * 0.12} ${fillBottom - 10}`}
              stroke="#ffffff"
              strokeWidth={Math.max(2, svgW * 0.035)}
              strokeLinecap="round"
              opacity={0.55}
            />
            <Path
              d={`M ${right - sandW * 0.1} ${fillTop + 6} L ${right - sandW * 0.1} ${fillBottom - 14}`}
              stroke="#ffffff"
              strokeWidth={Math.max(1.2, svgW * 0.02)}
              strokeLinecap="round"
              opacity={0.35}
            />
          </G>

          {/* Clear thin glass outline */}
          <Path
            d={outline}
            fill={`url(#${uid}-glass)`}
            stroke={isVictory ? '#FFE566' : '#FFFFFF'}
            strokeWidth={active ? 1.8 : 1.4}
            strokeOpacity={0.92}
          />

          {/* Beaker rim flare (ellipse mouth) */}
          <Ellipse
            cx={cx}
            cy={rimY}
            rx={rimRx}
            ry={rimRy}
            fill="#000000"
            fillOpacity={0.22}
          />
          <Ellipse
            cx={cx}
            cy={rimY - 1}
            rx={rimRx}
            ry={rimRy}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2.2}
            strokeOpacity={0.95}
          />
          <Path
            d={`M ${cx - rimRx * 0.78} ${rimY - 1} Q ${cx} ${rimY - rimRy - 1} ${cx + rimRx * 0.78} ${rimY - 1}`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.85}
          />
        </Svg>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bottleRoot: {
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
