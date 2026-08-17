import React from 'react';
import { Modal, StyleSheet, Switch, Text, View } from 'react-native';
import type { SettingsState } from '../game/types';
import { colors } from '../theme/colors';
import { vibrate } from '../utils/feedback';
import { wp } from '../utils/responsive';
import { PressableScale } from './PressableScale';

type Props = {
  visible: boolean;
  settings: SettingsState;
  onChange: (patch: Partial<SettingsState>) => void;
  onClose: () => void;
};

function Row({
  label,
  hint,
  value,
  onValueChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowHint}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#334155', true: colors.gradientBlue }}
        thumbColor="#fff"
      />
    </View>
  );
}

export function SettingsModal({ visible, settings, onChange, onClose }: Props) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Settings</Text>

          <Row
            label="Vibration"
            hint="Phone vibrates on pour & taps"
            value={settings.vibration}
            onValueChange={(vibration) => {
              onChange({ vibration });
              if (vibration) vibrate('medium');
            }}
          />

          <View style={styles.about}>
            <Text style={styles.aboutTitle}>About</Text>
            <Text style={styles.aboutText}>Sand Sort Puzzle</Text>
            <Text style={styles.aboutText}>Version 1.1.7</Text>
          </View>

          <PressableScale style={styles.close} onPress={onClose}>
            <Text style={styles.closeText}>Done</Text>
          </PressableScale>
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
    borderRadius: 22,
    padding: 20,
    backgroundColor: 'rgba(12,20,40,0.72)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  title: {
    color: '#ffffff',
    fontSize: wp(26),
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  rowText: {
    flex: 1,
    paddingRight: 12,
  },
  rowLabel: {
    color: colors.text,
    fontWeight: '800',
    fontSize: wp(15),
  },
  rowHint: {
    color: colors.textDim,
    fontWeight: '600',
    fontSize: wp(12),
    marginTop: 2,
  },
  about: {
    marginTop: 18,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  aboutTitle: {
    color: colors.text,
    fontWeight: '800',
    marginBottom: 6,
  },
  aboutText: {
    color: colors.textDim,
    fontWeight: '600',
    fontSize: wp(12),
  },
  close: {
    marginTop: 18,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: colors.gradientBlue,
    alignItems: 'center',
  },
  closeText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
  },
});
