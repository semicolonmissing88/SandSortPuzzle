import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppLoader } from './src/components/AppLoader';
import { RootNavigator } from './src/navigation/RootNavigator';
import { hydrateProgress } from './src/storage/mmkv';
import { colors } from './src/theme/colors';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const started = Date.now();
    void hydrateProgress().finally(() => {
      const wait = Math.max(0, 1400 - (Date.now() - started));
      setTimeout(() => setReady(true), wait);
    });
  }, []);

  if (!ready) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor={colors.bgDeep} />
        <AppLoader />
      </>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.bgDeep} />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
