import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../theme/colors';
import { wp } from '../utils/responsive';
import { Badge } from './Badge';
import { PressableScale } from './PressableScale';

export type NavId = 'daily' | 'map' | 'hint' | 'settings';

type Props = {
  hintCount: number;
  dailyReady?: boolean;
  onPress: (id: NavId) => void;
};

function Icon({ id }: { id: NavId }) {
  const s = wp(26);
  if (id === 'daily') {
    return (
      <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="5" width="18" height="16" rx="2" stroke="#a8d4ff" strokeWidth="2" />
        <Path d="M3 10h18M8 3v4M16 3v4" stroke="#a8d4ff" strokeWidth="2" />
      </Svg>
    );
  }
  if (id === 'map') {
    return (
      <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <Path
          d="M9 4l-5 2v14l5-2 6 2 5-2V4l-5 2-6-2z"
          stroke="#70e8ff"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <Path d="M9 4v14M15 6v14" stroke="#70e8ff" strokeWidth="2" />
      </Svg>
    );
  }
  if (id === 'hint') {
    return (
      <Svg width={s} height={s} viewBox="0 0 24 24">
        <Path d="M9 21h6M12 3a6 6 0 00-3 11v2h6v-2a6 6 0 00-3-11z" fill={colors.yellow} />
      </Svg>
    );
  }
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke="#dce8ff" strokeWidth="2" />
      <Path
        d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
        stroke="#dce8ff"
        strokeWidth="2"
      />
    </Svg>
  );
}

const ITEMS: { id: NavId; label: string }[] = [
  { id: 'daily', label: 'DAILY' },
  { id: 'map', label: 'MAP' },
  { id: 'hint', label: 'HINT' },
  { id: 'settings', label: 'SETTINGS' },
];

export function BottomNav({ hintCount, dailyReady, onPress }: Props) {
  return (
    <View style={styles.bar}>
      {ITEMS.map((item) => (
        <PressableScale key={item.id} style={styles.item} onPress={() => onPress(item.id)}>
          <Icon id={item.id} />
          <Text style={styles.label}>{item.label}</Text>
          {item.id === 'daily' && dailyReady ? <Badge dot style={styles.dot} /> : null}
          {item.id === 'hint' ? <Badge value={hintCount} style={styles.num} /> : null}
        </PressableScale>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: wp(8),
    padding: wp(10),
    borderRadius: wp(20),
    backgroundColor: 'rgba(10, 22, 48, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: wp(10),
    borderRadius: wp(14),
    backgroundColor: 'rgba(30, 50, 95, 0.45)',
  },
  label: {
    color: colors.textDim,
    fontSize: wp(9),
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  dot: {
    position: 'absolute',
    top: 6,
    right: 10,
  },
  num: {
    position: 'absolute',
    top: 4,
    right: 8,
  },
});
