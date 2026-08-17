import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  interpolate,
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
import type { ThemeId } from '../game/types';
import { screen } from '../utils/responsive';

const { width: W, height: H } = screen;

function dunePath(baseY: number, phase: number): string {
  const s = Math.sin(phase) * 12;
  return `M${-40} ${baseY + 40}
    Q ${W * 0.18 + s} ${baseY - 50} ${W * 0.38} ${baseY + 10}
    Q ${W * 0.55 - s} ${baseY + 55} ${W * 0.72} ${baseY - 20}
    Q ${W * 0.88 + s * 0.5} ${baseY - 60} ${W + 40} ${baseY + 5}
    L ${W + 40} ${H + 20} L ${-40} ${H + 20} Z`;
}

function dunePathFront(baseY: number, phase: number): string {
  const s = Math.sin(phase + 1.2) * 10;
  return `M${-40} ${baseY + 90}
    Q ${W * 0.25 - s} ${baseY + 30} ${W * 0.5} ${baseY + 80}
    Q ${W * 0.75 + s} ${baseY + 130} ${W + 40} ${baseY + 70}
    L ${W + 40} ${H + 20} L ${-40} ${H + 20} Z`;
}

/** Soft wind drift on dune layers */
function AnimatedDuneLayer({
  fill,
  opacity,
  baseY,
  speed = 1,
  amp = 16,
}: {
  fill: string;
  opacity: number;
  baseY: number;
  speed?: number;
  amp?: number;
}) {
  const wind = useSharedValue(0);
  useEffect(() => {
    wind.value = withRepeat(
      withTiming(1, { duration: 7000 / speed, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [speed, wind]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(wind.value, [0, 1], [-amp, amp]) },
      { translateY: interpolate(wind.value, [0, 0.5, 1], [0, -2.5, 0]) },
    ],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Svg width={W + 80} height={H} style={{ marginLeft: -40 }}>
        <Path d={dunePath(baseY, 0)} fill={fill} opacity={opacity} />
        <Path d={dunePathFront(baseY, 0.8)} fill={fill} opacity={opacity * 0.88} />
      </Svg>
    </Animated.View>
  );
}

function WindMote({
  x,
  y,
  s,
  d,
  color,
  progress,
}: {
  x: number;
  y: number;
  s: number;
  d: number;
  color: string;
  progress: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const p = (progress.value + d) % 1;
    return {
      opacity: interpolate(p, [0, 0.2, 0.8, 1], [0, 0.7, 0.7, 0]),
      transform: [
        { translateX: interpolate(p, [0, 1], [0, W * 0.22]) },
        { translateY: interpolate(p, [0, 1], [0, -H * 0.04]) },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: W * x,
          top: H * y,
          width: s,
          height: s,
          borderRadius: s,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

/** Tiny sand motes drifting in the wind */
function WindMotes({ color = 'rgba(255,230,180,0.45)' }: { color?: string }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 5200, easing: Easing.linear }), -1, false);
  }, [t]);

  const motes = [
    { x: 0.1, y: 0.55, s: 3, d: 0 },
    { x: 0.28, y: 0.62, s: 2.2, d: 0.2 },
    { x: 0.45, y: 0.5, s: 2.6, d: 0.45 },
    { x: 0.62, y: 0.58, s: 2, d: 0.1 },
    { x: 0.78, y: 0.48, s: 2.8, d: 0.35 },
    { x: 0.9, y: 0.64, s: 2.1, d: 0.55 },
    { x: 0.2, y: 0.72, s: 2.4, d: 0.7 },
    { x: 0.55, y: 0.7, s: 1.8, d: 0.85 },
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {motes.map((m, i) => (
        <WindMote key={i} {...m} color={color} progress={t} />
      ))}
    </View>
  );
}

/** Cartoon sun matching splash-style reference: wavy rays + cute blinking face. */
function CartoonSun({
  cx,
  cy,
  size = 108,
  dusk = false,
}: {
  cx: number;
  cy: number;
  size?: number;
  dusk?: boolean;
}) {
  const blink = useSharedValue(1);
  const sway = useSharedValue(0);

  useEffect(() => {
    blink.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2600 }),
        withTiming(0.08, { duration: 90 }),
        withTiming(1, { duration: 120 }),
        withTiming(1, { duration: 1700 }),
        withTiming(0.08, { duration: 80 }),
        withTiming(1, { duration: 100 }),
        withTiming(0.08, { duration: 70 }),
        withTiming(1, { duration: 100 }),
      ),
      -1,
      false,
    );
    sway.value = withRepeat(
      withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [blink, sway]);

  const rayStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(sway.value, [0, 1], [-4, 4])}deg` }],
  }));

  const eyeLidStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: blink.value }],
  }));

  const s = size;
  const half = s / 2;
  const faceR = s * 0.28;
  const rayOuter = s * 0.48;
  const rayInner = s * 0.3;

  // Wavy flame petals around the face
  const rays = Array.from({ length: 14 }, (_, i) => {
    const a0 = (i / 14) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 0.48) / 14) * Math.PI * 2 - Math.PI / 2;
    const aMid = (a0 + a1) / 2;
    const wobble = 1 + (i % 3 === 0 ? 0.1 : i % 2 === 0 ? -0.05 : 0.04);
    const ox = half + Math.cos(aMid) * rayOuter * wobble;
    const oy = half + Math.sin(aMid) * rayOuter * wobble;
    const ix0 = half + Math.cos(a0) * rayInner;
    const iy0 = half + Math.sin(a0) * rayInner;
    const ix1 = half + Math.cos(a1) * rayInner;
    const iy1 = half + Math.sin(a1) * rayInner;
    const c1x = half + Math.cos(a0 + 0.12) * (rayOuter * 0.72);
    const c1y = half + Math.sin(a0 + 0.12) * (rayOuter * 0.72);
    const c2x = half + Math.cos(a1 - 0.12) * (rayOuter * 0.72);
    const c2y = half + Math.sin(a1 - 0.12) * (rayOuter * 0.72);
    return `M ${ix0} ${iy0} Q ${c1x} ${c1y} ${ox} ${oy} Q ${c2x} ${c2y} ${ix1} ${iy1} Z`;
  });

  const faceFill = dusk ? '#ffb35a' : '#FFE566';
  const faceHi = dusk ? '#ffd08a' : '#FFF3A0';
  const rayA = dusk ? '#ff7a3a' : '#FF8A2B';
  const rayB = dusk ? '#ff9a4a' : '#FFB347';
  const uid = dusk ? 'dusk' : 'day';

  const eyeW = faceR * 0.42;
  const eyeH = faceR * 0.52;
  const eyeY = half - faceR * 0.18;
  const eyeGap = faceR * 0.55;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: cx - half,
        top: cy - half,
        width: s,
        height: s,
        zIndex: 3,
      }}
    >
      <Animated.View style={[{ width: s, height: s }, rayStyle]}>
        <Svg width={s} height={s}>
          <Defs>
            <LinearGradient id={`sunFace-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={faceHi} />
              <Stop offset="1" stopColor={faceFill} />
            </LinearGradient>
            <LinearGradient id={`sunRay-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={rayB} />
              <Stop offset="1" stopColor={rayA} />
            </LinearGradient>
          </Defs>
          {/* Soft halo */}
          <Circle cx={half} cy={half} r={rayOuter * 0.92} fill={rayB} opacity={0.22} />
          {rays.map((d, i) => (
            <Path
              key={i}
              d={d}
              fill={`url(#sunRay-${uid})`}
              stroke="#F06A1A"
              strokeWidth={0.8}
              strokeOpacity={0.55}
            />
          ))}
          {/* Face */}
          <Circle cx={half} cy={half} r={faceR} fill={`url(#sunFace-${uid})`} />
          <Circle cx={half} cy={half} r={faceR} fill="none" stroke="#F5C84A" strokeWidth={1.2} />
          {/* Cheeks */}
          <Ellipse cx={half - faceR * 0.55} cy={half + faceR * 0.22} rx={faceR * 0.14} ry={faceR * 0.09} fill="#FF9E7A" opacity={0.45} />
          <Ellipse cx={half + faceR * 0.55} cy={half + faceR * 0.22} rx={faceR * 0.14} ry={faceR * 0.09} fill="#FF9E7A" opacity={0.45} />
          {/* Eyebrows */}
          <Path
            d={`M ${half - eyeGap - eyeW * 0.35} ${eyeY - eyeH * 0.55}
                Q ${half - eyeGap} ${eyeY - eyeH * 0.85} ${half - eyeGap + eyeW * 0.35} ${eyeY - eyeH * 0.55}`}
            stroke="#E8892A"
            strokeWidth={2.2}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d={`M ${half + eyeGap - eyeW * 0.35} ${eyeY - eyeH * 0.55}
                Q ${half + eyeGap} ${eyeY - eyeH * 0.85} ${half + eyeGap + eyeW * 0.35} ${eyeY - eyeH * 0.55}`}
            stroke="#E8892A"
            strokeWidth={2.2}
            fill="none"
            strokeLinecap="round"
          />
          {/* Open smile + tongue */}
          <Path
            d={`M ${half - faceR * 0.42} ${half + faceR * 0.28}
                Q ${half} ${half + faceR * 0.72} ${half + faceR * 0.42} ${half + faceR * 0.28}
                Q ${half} ${half + faceR * 0.48} ${half - faceR * 0.42} ${half + faceR * 0.28} Z`}
            fill="#3A2208"
          />
          <Ellipse
            cx={half}
            cy={half + faceR * 0.48}
            rx={faceR * 0.2}
            ry={faceR * 0.1}
            fill="#FF6B4A"
          />
        </Svg>
      </Animated.View>

      {/* Blinking eyes (oval + pupil + highlight + lashes) */}
      {([-1, 1] as const).map((side) => {
        const ex = half + side * eyeGap - eyeW / 2;
        return (
          <View key={side} style={{ position: 'absolute', left: ex, top: eyeY - eyeH / 2 }}>
            {/* Lashes (stay while blink) */}
            <View style={[styles.lash, { left: eyeW * 0.15, top: -2, transform: [{ rotate: '-25deg' }] }]} />
            <View style={[styles.lash, { left: eyeW * 0.42, top: -3.5 }]} />
            <View style={[styles.lash, { left: eyeW * 0.7, top: -2, transform: [{ rotate: '25deg' }] }]} />
            <Animated.View style={[{ width: eyeW, height: eyeH, alignItems: 'center' }, eyeLidStyle]}>
              <View
                style={{
                  width: eyeW,
                  height: eyeH,
                  borderRadius: eyeW,
                  backgroundColor: '#1A1208',
                  overflow: 'hidden',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Look up-left */}
                <View
                  style={{
                    width: eyeW * 0.38,
                    height: eyeW * 0.38,
                    borderRadius: eyeW,
                    backgroundColor: '#FFFFFF',
                    marginTop: -eyeH * 0.18,
                    marginLeft: -eyeW * 0.12,
                  }}
                />
              </View>
            </Animated.View>
          </View>
        );
      })}
    </View>
  );
}

/** Bright day desert — golden sun, clear sky, warm dunes. */
function DayBg() {
  const sunX = W * 0.18;
  const sunY = H * 0.14;
  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="daySky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#5eb8ff" />
            <Stop offset="0.45" stopColor="#87ceeb" />
            <Stop offset="0.72" stopColor="#c4a574" />
            <Stop offset="1" stopColor="#d4a84b" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={W} height={H} fill="url(#daySky)" />
      </Svg>
      <CartoonSun cx={sunX} cy={sunY} size={Math.min(128, W * 0.34)} />
      <AnimatedDuneLayer fill="#c9953a" opacity={0.95} baseY={H * 0.58} speed={0.85} amp={14} />
      <AnimatedDuneLayer fill="#e0b04a" opacity={1} baseY={H * 0.68} speed={1.15} amp={20} />
      <AnimatedDuneLayer fill="#f0c65a" opacity={0.9} baseY={H * 0.78} speed={1.35} amp={12} />
      <WindMotes />
    </View>
  );
}

/** Golden-hour dunes between day and night. */
function DuskBg() {
  const sunX = W * 0.78;
  const sunY = H * 0.2;
  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="duskSky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#2a1a4a" />
            <Stop offset="0.35" stopColor="#5a3a6a" />
            <Stop offset="0.55" stopColor="#c45a4a" />
            <Stop offset="0.72" stopColor="#d4894a" />
            <Stop offset="1" stopColor="#8a6030" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={W} height={H} fill="url(#duskSky)" />
        <Circle cx={W * 0.12} cy={H * 0.1} r={1.2} fill="#fff" opacity={0.45} />
        <Circle cx={W * 0.3} cy={H * 0.16} r={1} fill="#fff" opacity={0.35} />
        <Circle cx={W * 0.5} cy={H * 0.08} r={1.3} fill="#fff" opacity={0.4} />
      </Svg>
      <CartoonSun cx={sunX} cy={sunY} size={Math.min(112, W * 0.3)} dusk />
      <AnimatedDuneLayer fill="#6a4a2a" opacity={0.9} baseY={H * 0.58} speed={0.9} amp={14} />
      <AnimatedDuneLayer fill="#8a6230" opacity={1} baseY={H * 0.7} speed={1.2} amp={18} />
      <WindMotes color="rgba(255,200,140,0.35)" />
    </View>
  );
}

/** Night desert — crescent moon, stars, cool dunes. */
function NightBg() {
  const moonX = W * 0.82;
  const moonY = H * 0.14;
  const stars = [
    [0.12, 0.12],
    [0.28, 0.22],
    [0.42, 0.1],
    [0.55, 0.28],
    [0.7, 0.16],
    [0.88, 0.32],
    [0.18, 0.35],
    [0.62, 0.08],
    [0.92, 0.18],
    [0.35, 0.4],
  ];

  const blink = useSharedValue(1);
  useEffect(() => {
    blink.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2800 }),
        withTiming(0.1, { duration: 90 }),
        withTiming(1, { duration: 110 }),
        withTiming(1, { duration: 1900 }),
        withTiming(0.1, { duration: 80 }),
        withTiming(1, { duration: 100 }),
      ),
      -1,
      false,
    );
  }, [blink]);
  const eyeStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: blink.value }],
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0a1230" />
            <Stop offset="0.5" stopColor="#121c48" />
            <Stop offset="0.75" stopColor="#1a2858" />
            <Stop offset="1" stopColor="#1e3060" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={W} height={H} fill="url(#nightSky)" />
        {stars.map(([x, y], i) => (
          <Circle
            key={i}
            cx={W * x}
            cy={H * y}
            r={i % 3 === 0 ? 1.8 : 1.1}
            fill="#fff"
            opacity={0.55 + (i % 4) * 0.1}
          />
        ))}
        <Circle cx={moonX} cy={moonY} r={42} fill="#a8c4ff" opacity={0.12} />
        <Circle cx={moonX} cy={moonY} r={28} fill="#e8f0ff" opacity={0.95} />
        <Circle cx={moonX + W * 0.04} cy={moonY - H * 0.02} r={24} fill="#0e1640" />
      </Svg>
      <View style={[styles.moonFace, { left: moonX - 18, top: moonY - 4 }]} pointerEvents="none">
        <Animated.View style={[styles.moonEye, eyeStyle]} />
        <Animated.View style={[styles.moonEye, { marginLeft: 9 }, eyeStyle]} />
      </View>
      <View style={[styles.moonSmile, { left: moonX - 11, top: moonY + 10 }]} pointerEvents="none" />
      <AnimatedDuneLayer fill="#1a2a55" opacity={0.95} baseY={H * 0.58} speed={0.8} amp={12} />
      <AnimatedDuneLayer fill="#243868" opacity={1} baseY={H * 0.7} speed={1.1} amp={16} />
      <AnimatedDuneLayer fill="#2a4078" opacity={0.85} baseY={H * 0.8} speed={1.3} amp={10} />
      <WindMotes color="rgba(180,200,255,0.35)" />
    </View>
  );
}

export function GameBackground({ theme }: { theme: ThemeId }) {
  if (theme === 'dusk') return <DuskBg />;
  if (theme === 'night') return <NightBg />;
  return <DayBg />;
}

const styles = StyleSheet.create({
  lash: {
    position: 'absolute',
    width: 1.6,
    height: 5,
    borderRadius: 1,
    backgroundColor: '#1A1208',
    zIndex: 2,
  },
  moonFace: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  moonEye: {
    width: 5,
    height: 6.5,
    borderRadius: 4,
    backgroundColor: '#2a3a70',
  },
  moonSmile: {
    position: 'absolute',
    width: 14,
    height: 9,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderTopWidth: 0,
    borderColor: '#6a7ab0',
    borderRadius: 10,
    zIndex: 2,
  },
});
