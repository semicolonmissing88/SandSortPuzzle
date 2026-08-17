import React, { useMemo } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DAILY_REWARDS } from '../game/types';
import { colors } from '../theme/colors';
import { wp } from '../utils/responsive';
import { PressableScale } from './PressableScale';

type Props = {
  visible: boolean;
  activeDay: number;
  claimedToday: boolean;
  onClaim: () => void;
  onClose: () => void;
};

export function DailyBonusModal({
  visible,
  activeDay,
  claimedToday,
  onClaim,
  onClose,
}: Props) {
  const days = useMemo(
    () => DAILY_REWARDS.map((coins, i) => ({ day: i + 1, coins })),
    [],
  );

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Daily Bonus</Text>
          <Text style={styles.sub}>
            Login every day for more coins. Miss a day and the streak resets.
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
          >
            {days.map((d) => {
              const active = d.day === activeDay && !claimedToday;
              const done =
                d.day < activeDay || (claimedToday && d.day <= activeDay);
              return (
                <View
                  key={d.day}
                  style={[
                    styles.dayCard,
                    active && styles.dayActive,
                    done && styles.dayDone,
                  ]}
                >
                  <Text style={styles.dayLabel}>Day {d.day}</Text>
                  <View style={styles.coinDot} />
                  <Text style={styles.dayCoins}>{d.coins}</Text>
                  {done ? <Text style={styles.claimed}>✓</Text> : null}
                </View>
              );
            })}
          </ScrollView>

          <Text style={styles.cycleNote}>After Day 7 it starts again from Day 1.</Text>

          <View style={styles.actions}>
            <PressableScale style={styles.secondary} onPress={onClose}>
              <Text style={styles.secondaryText}>Close</Text>
            </PressableScale>
            <PressableScale
              style={[styles.primary, claimedToday && styles.disabled]}
              disabled={claimedToday}
              onPress={onClaim}
            >
              <Text style={styles.primaryText}>
                {claimedToday ? 'Claimed' : `Claim +${DAILY_REWARDS[activeDay - 1] ?? 5}`}
              </Text>
            </PressableScale>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2,8,20,0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#0e2148',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  title: {
    color: colors.yellow,
    fontSize: wp(26),
    fontWeight: '900',
    textAlign: 'center',
  },
  sub: {
    color: colors.textDim,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    fontSize: wp(13),
  },
  row: {
    gap: 10,
    paddingVertical: 6,
  },
  dayCard: {
    width: wp(72),
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  dayActive: {
    borderColor: colors.yellow,
    backgroundColor: 'rgba(255,217,59,0.15)',
  },
  dayDone: {
    opacity: 0.55,
  },
  dayLabel: {
    color: colors.textDim,
    fontWeight: '800',
    fontSize: wp(11),
  },
  coinDot: {
    width: 18,
    height: 18,
    borderRadius: 99,
    backgroundColor: '#f5b820',
    marginVertical: 8,
  },
  dayCoins: {
    color: colors.text,
    fontWeight: '900',
    fontSize: wp(16),
  },
  claimed: {
    color: colors.safe,
    fontWeight: '900',
    marginTop: 4,
  },
  cycleNote: {
    color: colors.textDim,
    fontSize: wp(11),
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  primary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.yellow,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.45,
  },
  primaryText: {
    color: '#5a3a00',
    fontWeight: '800',
  },
  secondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
  },
  secondaryText: {
    color: colors.text,
    fontWeight: '800',
  },
});
