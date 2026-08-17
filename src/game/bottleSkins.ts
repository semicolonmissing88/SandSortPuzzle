import type { LiquidColor } from '../theme/colors';

export type BottleShapeId = 'classic';

export type GlassProfile = {
  topRadius: number;
  bottomRadius: number;
  bodyScale: number;
  rimScale: number;
  neckExtra?: number;
  stopper?: boolean;
  spout?: boolean;
  hourglass?: boolean;
  square?: boolean;
  cactus?: boolean;
  perfume?: boolean;
};

export type BottleSkin = {
  id: BottleShapeId;
  label: string;
  preview: LiquidColor[];
  glass: GlassProfile;
};

/**
 * Clear glass test tube — matches the provided SVG silhouette.
 */
export const CLASSIC_BOTTLE: BottleSkin = {
  id: 'classic',
  label: 'Classic',
  preview: ['YELLOW', 'CYAN', 'PINK', 'GREEN'],
  glass: {
    topRadius: 0.28,
    bottomRadius: 0.5,
    bodyScale: 0.9,
    rimScale: 1,
    neckExtra: 0,
  },
};

export const BOTTLE_SKINS: BottleSkin[] = [CLASSIC_BOTTLE];

export const DEFAULT_BOTTLE_SKIN: BottleShapeId = 'classic';

export function getBottleSkin(_id?: BottleShapeId | string): BottleSkin {
  return CLASSIC_BOTTLE;
}
