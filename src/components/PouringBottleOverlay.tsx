import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { BottleShapeId } from '../game/bottleSkins';
import type { BottleState } from '../game/types';
import { Bottle } from './Bottle';

type Props = {
  bottle: BottleState;
  width: number;
  height: number;
  layerH: number;
  shapeId?: BottleShapeId;
  /** Where the bottle mouth should sit (pour origin) */
  mouthX: number;
  mouthY: number;
  tipDeg: number;
};

/**
 * Tips bottle around its mouth (rim), matching splash-art ~45° pour pose.
 */
export function PouringBottleOverlay({
  bottle,
  width,
  height,
  layerH,
  shapeId,
  mouthX,
  mouthY,
  tipDeg,
}: Props) {
  const rot = useSharedValue(0);

  useEffect(() => {
    rot.value = 0;
    // Tip into pour pose and HOLD (stream plays while tipped)
    rot.value = withTiming(tipDeg, { duration: 160, easing: Easing.out(Easing.cubic) });
  }, [rot, tipDeg]);

  const tipStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value}deg` }],
  }));

  return (
    <View pointerEvents="none" style={[styles.anchor, { left: mouthX, top: mouthY }]}>
      <Animated.View style={[styles.pivot, tipStyle]}>
        {/* Rim at pivot (0,0). Bottle hangs below; tip swings body. */}
        <View style={[styles.bottleWrap, { width, height, left: -width / 2, top: -2 }]}>
          <Bottle
            bottle={bottle}
            width={width}
            height={height}
            layerH={layerH}
            shapeId={shapeId}
            pouring
            pourAngle={0}
            pourZIndex={1000}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    width: 0,
    height: 0,
    zIndex: 1000,
    elevation: 1000,
  },
  pivot: {
    width: 0,
    height: 0,
  },
  bottleWrap: {
    position: 'absolute',
  },
});
