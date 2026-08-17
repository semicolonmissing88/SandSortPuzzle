import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { BOTTLE_SKINS, type BottleShapeId } from '../game/bottleSkins';
import { colors } from '../theme/colors';
import { wp } from '../utils/responsive';
import { Bottle } from './Bottle';
import { PressableScale } from './PressableScale';

type Props = {
  visible: boolean;
  selected: BottleShapeId;
  onSelect: (id: BottleShapeId) => void;
  onClose: () => void;
};

export function SkinsModal({ visible, selected, onSelect, onClose }: Props) {
  const { width: screenW } = useWindowDimensions();
  const gap = 10;
  const pad = 16;
  const colW = (Math.min(screenW, 420) - pad * 2 - gap) / 2;
  const bottleW = Math.min(52, colW * 0.38);
  const bottleH = bottleW * 2.4;
  const layerH = bottleH * 0.22;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>SAND SORT PUZZLE</Text>
          <Text style={styles.sub}>Bottle Skins — 10 unique shapes</Text>

          <ScrollView
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
            style={styles.scroll}
          >
            {BOTTLE_SKINS.map((skin) => {
              const active = skin.id === selected;
              return (
                <PressableScale
                  key={skin.id}
                  style={[styles.cell, { width: colW }, active && styles.cellActive]}
                  onPress={() => onSelect(skin.id)}
                >
                  <View style={styles.preview}>
                    <Bottle
                      bottle={skin.preview}
                      width={bottleW}
                      height={bottleH}
                      layerH={layerH}
                      shapeId={skin.id}
                      victory={skin.id === 'classic'}
                    />
                  </View>
                  <Text style={[styles.label, active && styles.labelActive]}>{skin.label}</Text>
                  {active ? <Text style={styles.equipped}>Equipped</Text> : null}
                </PressableScale>
              );
            })}
          </ScrollView>

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
    backgroundColor: 'rgba(4, 10, 24, 0.72)',
    justifyContent: 'center',
    padding: 14,
  },
  card: {
    maxHeight: '92%',
    borderRadius: 22,
    padding: 16,
    backgroundColor: 'rgba(16, 28, 52, 0.92)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  title: {
    color: '#ffffff',
    fontSize: wp(20),
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
  },
  sub: {
    color: colors.textDim,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
    fontSize: wp(12),
  },
  scroll: { maxHeight: 480 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    paddingBottom: 8,
  },
  cell: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    minHeight: 168,
  },
  cellActive: {
    borderColor: colors.sand.gold,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
  },
  preview: {
    height: 130,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  label: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: wp(11),
    textAlign: 'center',
  },
  labelActive: {
    color: colors.sand.gold,
  },
  equipped: {
    marginTop: 2,
    color: colors.sand.teal,
    fontWeight: '700',
    fontSize: wp(10),
  },
  close: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: colors.gradientBlue,
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});
