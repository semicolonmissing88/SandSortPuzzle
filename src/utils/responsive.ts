import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

export const screen = {
  width,
  height,
  isTablet: Math.min(width, height) >= 768,
};

/** Scale by width — keeps UI proportional across phones/tablets. */
export function wp(size: number): number {
  const scale = width / BASE_WIDTH;
  const value = size * Math.min(scale, screen.isTablet ? 1.35 : 1.15);
  return Math.round(PixelRatio.roundToNearestPixel(value));
}

export function hp(size: number): number {
  const scale = height / BASE_HEIGHT;
  const value = size * Math.min(scale, screen.isTablet ? 1.25 : 1.1);
  return Math.round(PixelRatio.roundToNearestPixel(value));
}

export function bottleMetrics(count: number) {
  const cols = count <= 4 ? count : count <= 8 ? Math.ceil(count / 2) : Math.min(6, Math.ceil(count / 2));
  const gap = wp(count > 10 ? 8 : 12);
  const maxW = width - wp(20);
  // Taller beaker tubes for 5 layers
  const bottleW = Math.min(wp(62), Math.floor((maxW - gap * (cols - 1)) / cols));
  const bottleH = Math.round(bottleW * 2.75);
  const layerH = Math.round(bottleH * 0.168);
  return { bottleW, bottleH, layerH, gap, cols };
}
