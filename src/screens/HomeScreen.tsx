import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomNav } from '../components/BottomNav';
import { DailyBonusModal } from '../components/DailyBonusModal';
import { GameLogo, HomeBackground, HomeBottlePreview } from '../components/HomeDecor';
import { IconButton, SettingsGearIcon } from '../components/GameActions';
import { PressableScale } from '../components/PressableScale';
import { SettingsModal } from '../components/SettingsModal';
import type { RootStackParamList } from '../navigation/types';
import {
  claimDailyBonus,
  getDailyUiState,
  loadProgress,
  startNewGame,
  syncDailyStreak,
  updateSettings,
} from '../storage/mmkv';
import { DEFAULT_BOTTLE_SKIN } from '../game/bottleSkins';
import { colors } from '../theme/colors';
import { hp, wp } from '../utils/responsive';

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [progress, setProgress] = useState(loadProgress);
  const [dailyOpen, setDailyOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setProgress(syncDailyStreak());
    }, []),
  );

  const openMap = () => {
    navigation.navigate('LevelMap', { focusLevel: progress.level });
  };

  const onNewGame = () => {
    Alert.alert(
      'New Game',
      'Start again from Level 1? Cleared levels will lock again. Coins stay.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Over',
          style: 'destructive',
          onPress: () => {
            const next = startNewGame();
            setProgress(next);
            navigation.navigate('LevelMap', { focusLevel: 0 });
          },
        },
      ],
    );
  };

  const openDaily = () => {
    setProgress(syncDailyStreak());
    setDailyOpen(true);
  };

  const openSettings = () => setSettingsOpen(true);

  const onClaimDaily = () => {
    const result = claimDailyBonus();
    if (!result.ok) {
      Alert.alert('Daily Bonus', 'You already claimed today’s reward. Come back tomorrow!');
      return;
    }
    setProgress(result.progress);
    Alert.alert('Reward!', `Day ${result.day}: +${result.coins} coins`);
  };

  const dailyUi = getDailyUiState();

  return (
    <View style={styles.root}>
      <HomeBackground />

      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <View style={styles.coinPill}>
          <View style={styles.coin} />
          <Text style={styles.coinText}>{progress.coins}</Text>
          <PressableScale style={styles.coinAdd} onPress={openDaily}>
            <Text style={styles.coinAddText}>+</Text>
          </PressableScale>
        </View>
        <IconButton onPress={openSettings}>
          <SettingsGearIcon />
        </IconButton>
      </View>

      <View style={styles.hero}>
        <GameLogo />
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>LEVEL {progress.level + 1}</Text>
        </View>
        <HomeBottlePreview shapeId={DEFAULT_BOTTLE_SKIN} />
        <PressableScale style={styles.playBtn} onPress={openMap} scaleTo={0.96}>
          <Text style={styles.playText}>PLAY</Text>
        </PressableScale>
        <PressableScale style={styles.newGameBtn} onPress={onNewGame} scaleTo={0.96}>
          <Text style={styles.newGameText}>NEW GAME</Text>
        </PressableScale>
      </View>

      <View style={[styles.navWrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <BottomNav
          hintCount={progress.hints}
          dailyReady={!dailyUi.claimedToday}
          onPress={(id) => {
            if (id === 'daily') {
              openDaily();
              return;
            }
            if (id === 'settings') {
              openSettings();
              return;
            }
            if (id === 'hint') {
              Alert.alert('Hints', `You have ${progress.hints} hint packs`);
              return;
            }
            if (id === 'map') {
              openMap();
            }
          }}
        />
      </View>

      <DailyBonusModal
        visible={dailyOpen}
        activeDay={dailyUi.activeDay}
        claimedToday={dailyUi.claimedToday}
        onClaim={onClaimDaily}
        onClose={() => setDailyOpen(false)}
      />

      <SettingsModal
        visible={settingsOpen}
        settings={progress.settings}
        onChange={(patch) => setProgress(updateSettings(patch))}
        onClose={() => setSettingsOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(16),
  },
  levelBadge: {
    paddingHorizontal: wp(22),
    paddingVertical: wp(8),
    borderRadius: 999,
    backgroundColor: 'rgba(20, 32, 58, 0.55)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  levelText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: wp(13),
    letterSpacing: 1.5,
  },
  playBtn: {
    minWidth: wp(220),
    marginTop: hp(4),
    paddingVertical: hp(16),
    paddingHorizontal: wp(48),
    borderRadius: 999,
    backgroundColor: colors.gradientBlue,
    alignItems: 'center',
    shadowColor: colors.gradientPurple,
    shadowOpacity: 0.55,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  playText: {
    color: '#ffffff',
    fontSize: wp(28),
    fontWeight: '900',
    letterSpacing: 2,
  },
  newGameBtn: {
    minWidth: wp(180),
    marginTop: hp(2),
    paddingVertical: hp(12),
    paddingHorizontal: wp(28),
    borderRadius: 999,
    backgroundColor: 'rgba(20, 32, 58, 0.72)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
  },
  newGameText: {
    color: '#ffffff',
    fontSize: wp(14),
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingLeft: 10,
    paddingRight: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(20,32,58,0.65)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  coin: {
    width: wp(22),
    height: wp(22),
    borderRadius: 999,
    backgroundColor: '#f5b820',
    borderWidth: 2,
    borderColor: 'rgba(255,200,60,0.45)',
  },
  coinText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: wp(15),
  },
  coinAdd: {
    width: wp(26),
    height: wp(26),
    borderRadius: 999,
    backgroundColor: colors.coinGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinAddText: {
    color: '#043018',
    fontWeight: '900',
    fontSize: wp(18),
    marginTop: -2,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(24),
    paddingBottom: hp(90),
    gap: hp(10),
  },
  navWrap: {
    position: 'absolute',
    left: wp(12),
    right: wp(12),
    bottom: 0,
  },
});
