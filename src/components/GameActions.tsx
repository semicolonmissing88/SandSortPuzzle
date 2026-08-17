import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient as SvgGrad, Path, Stop } from 'react-native-svg';
import { colors } from '../theme/colors';
import { wp } from '../utils/responsive';
import { Badge } from './Badge';
import { PressableScale } from './PressableScale';

type Props = {
  undoLeft: number;
  hintLeft: number;
  onUndo: () => void;
  onHint: () => void;
};

function Action({
  label,
  count,
  onPress,
  disabled,
  children,
}: {
  label: string;
  count: number;
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <PressableScale
      disabled={disabled}
      onPress={onPress}
      style={[styles.btn, disabled && styles.disabled, styles.btnGlass]}
    >
      {children}
      <Text style={styles.label}>{label}</Text>
      <Badge value={count} style={styles.badge} />
    </PressableScale>
  );
}

export function GameActions(props: Props) {
  const s = wp(28);
  return (
    <View style={styles.row}>
      <Action label="UNDO" count={props.undoLeft} onPress={props.onUndo} disabled={props.undoLeft <= 0}>
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Path d="M9 14L4 9l5-5" stroke="#cfe3ff" strokeWidth="2.2" />
          <Path d="M4 9h9a6 6 0 010 12h-3" stroke="#cfe3ff" strokeWidth="2.2" />
        </Svg>
      </Action>
      <Action label="HINT" count={props.hintLeft} onPress={props.onHint} disabled={props.hintLeft <= 0}>
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path d="M9 21h6M12 3a6 6 0 00-3 11v2h6v-2a6 6 0 00-3-11z" fill={colors.yellow} />
        </Svg>
      </Action>
    </View>
  );
}

export function IconButton({
  onPress,
  children,
  badge,
}: {
  onPress?: () => void;
  children: React.ReactNode;
  badge?: number;
}) {
  return (
    <PressableScale onPress={onPress} style={styles.iconBtn}>
      {children}
      {badge != null ? <Badge value={badge} small style={styles.iconBadge} /> : null}
    </PressableScale>
  );
}

export function MenuIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"
        fill="#ffffff"
      />
    </Svg>
  );
}

export function RestartIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Defs>
        <SvgGrad id="restartGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#4a90ff" />
          <Stop offset="1" stopColor="#9b5cff" />
        </SvgGrad>
      </Defs>
      <Path
        d="M3 12a9 9 0 109-9"
        stroke="url(#restartGrad)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <Path d="M3 4v5h5" stroke="url(#restartGrad)" strokeWidth="2.4" strokeLinecap="round" />
    </Svg>
  );
}

export function SettingsGearIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
        stroke="#c8d0dc"
        strokeWidth="2"
      />
      <Path
        d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"
        stroke="#c8d0dc"
        strokeWidth="1.6"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: wp(10),
    paddingHorizontal: 2,
  },
  btn: {
    flex: 1,
    minHeight: wp(72),
    borderRadius: wp(18),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  btnGlass: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: wp(12),
    backgroundColor: 'rgba(20, 32, 58, 0.72)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    color: '#ffffff',
    fontSize: wp(11),
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  badge: {
    position: 'absolute',
    top: -7,
    right: -5,
  },
  iconBtn: {
    width: wp(44),
    height: wp(44),
    borderRadius: wp(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20, 32, 58, 0.65)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  iconBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
});
