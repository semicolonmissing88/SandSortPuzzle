export const colors = {
  bgDeep: '#0a1628',
  bgMid: '#1a3a5c',
  bgNight: '#061018',
  text: '#ffffff',
  textDim: '#c8d6e8',
  yellow: '#FFD700',
  yellowDeep: '#E5B800',
  yellowShadow: '#C68642',
  cyan: '#008080',
  blueBtn: '#4a7cff',
  purpleBadge: '#9966CC',
  gradientBlue: '#4a90ff',
  gradientPurple: '#9b5cff',
  danger: '#ef4444',
  safe: '#50C878',
  glass: 'rgba(255,255,255,0.18)',
  glassBorder: 'rgba(255,255,255,0.45)',
  glassDark: 'rgba(12,20,40,0.55)',
  glassDarkBorder: 'rgba(180,200,255,0.28)',
  coinGreen: '#1fba5a',
  coinGreenDeep: '#147a3c',

  /**
   * Glitter sand palette — exact codes from design
   * Gold / Rose Gold / Teal / Emerald / Amethyst (+ extras for levels)
   */
  liquids: {
    RED: '#E63946',
    /** Reference orange */
    ORANGE: '#FF8A1A',
    YELLOW: '#FFD700',
    /** Reference green */
    GREEN: '#2DB84B',
    LIGHT_GREEN: '#7FFFD4',
    DARK_GREEN: '#1F8A3A',
    /** Reference blue */
    BLUE: '#2F9BFF',
    DARK_BLUE: '#0A5FA8',
    CYAN: '#1AA6A0',
    /** Reference purple */
    PURPLE: '#7B2CBF',
    /** Reference magenta/pink */
    PINK: '#E91E8C',
    GRAY: '#94a3b8',
    COFFEE: '#C68642',
    LIME: '#5DDE7A',
  } as const,

  sand: {
    gold: '#FFD700',
    roseGold: '#E0A96D',
    teal: '#008080',
    emerald: '#50C878',
    amethyst: '#9966CC',
    ruby: '#E63946',
    iridescent: '#E8E0FF',
  } as const,
} as const;

export type LiquidColor = keyof typeof colors.liquids;

/**
 * Glitter layer tones — exact gradient pairs from design:
 * Gold #FFE65D→#E5B800 | Rose Gold #F4C2C2→#C68642
 * Teal #20B2AA→#005C5C | Emerald #7FFFD4→#2E8B57
 * Amethyst #BA55D3→#6A0DAD
 */
export const sandTone: Record<
  LiquidColor,
  { highlight: string; mid: string; deep: string; spark: string }
> = {
  // Gold (Sun Shine)
  YELLOW: { highlight: '#FFE65D', mid: '#FFD700', deep: '#E5B800', spark: '#FFF8D6' },
  COFFEE: { highlight: '#F4C2C2', mid: '#C68642', deep: '#8B5A2B', spark: '#FFE8D0' },

  // Reference orange
  ORANGE: { highlight: '#FFB14A', mid: '#FF8A1A', deep: '#D96A00', spark: '#FFE4C4' },
  // Reference magenta/pink
  PINK: { highlight: '#FF5FB3', mid: '#E91E8C', deep: '#B01068', spark: '#FFD6EC' },

  // Teal / blue family
  CYAN: { highlight: '#3DD0C8', mid: '#1AA6A0', deep: '#0C6E6A', spark: '#E0FFFF' },
  BLUE: { highlight: '#6BB8FF', mid: '#2F9BFF', deep: '#0A5FA8', spark: '#E8F4FF' },
  DARK_BLUE: { highlight: '#2F9BFF', mid: '#0A5FA8', deep: '#063A68', spark: '#B8D8FF' },

  // Reference green
  GREEN: { highlight: '#5DDE7A', mid: '#2DB84B', deep: '#1F8A3A', spark: '#E8FFE8' },
  LIGHT_GREEN: { highlight: '#A8F0B8', mid: '#5DDE7A', deep: '#2DB84B', spark: '#F5FFFB' },
  DARK_GREEN: { highlight: '#2DB84B', mid: '#1F8A3A', deep: '#145C28', spark: '#D0F0DC' },
  LIME: { highlight: '#8AF0A0', mid: '#5DDE7A', deep: '#2DB84B', spark: '#F0FFF8' },

  // Reference purple
  PURPLE: { highlight: '#A855F7', mid: '#7B2CBF', deep: '#5A189A', spark: '#F3E8FF' },

  RED: { highlight: '#FF8A8A', mid: '#E63946', deep: '#9B1C1C', spark: '#FFE4E4' },
  GRAY: { highlight: '#E2E8F0', mid: '#94A3B8', deep: '#475569', spark: '#FFFFFF' },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;
