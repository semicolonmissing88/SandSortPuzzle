import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { wp } from '../utils/responsive';

type Props = {
  value?: number | string;
  dot?: boolean;
  style?: ViewStyle;
  small?: boolean;
};

export function Badge({ value, dot, style, small }: Props) {
  if (dot) {
    return <View style={[styles.dot, style]} />;
  }

  return (
    <View style={[styles.badge, small && styles.small, style]}>
      <Text style={[styles.text, small && styles.smallText]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: wp(18),
    height: wp(18),
    paddingHorizontal: 5,
    borderRadius: 999,
    backgroundColor: colors.purpleBadge,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.purpleBadge,
    shadowOpacity: 0.55,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  small: {
    minWidth: wp(16),
    height: wp(16),
  },
  text: {
    color: '#fff',
    fontSize: wp(11),
    fontWeight: '800',
  },
  smallText: {
    fontSize: wp(10),
  },
  dot: {
    width: wp(10),
    height: wp(10),
    borderRadius: 999,
    backgroundColor: colors.danger,
    shadowColor: colors.danger,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
});
