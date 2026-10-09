import { type TextStyle } from 'react-native';
import {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
  ReduceMotion,
  SlideInDown,
  ZoomIn,
} from 'react-native-reanimated';

/**
 * Single source of truth for every color, font, size, radius, shadow and motion value.
 * Components must never hard-code these.
 */

export const colors = {
  // Text: deep slate. inkFaint keeps 4.5:1 or better on every surface (supersedes D20).
  ink: '#1F2428',
  inkMuted: '#4B565D',
  inkFaint: '#5F6B72',
  // Warm stone backgrounds.
  bgTop: '#FAF6EF',
  bgBottom: '#EFE7DA',
  // Terracotta (primary), forest green (secondary), warm amber (accent).
  primary: '#B5502F',
  primaryDeep: '#8F3A1F',
  forest: '#2E6B4A',
  forestDeep: '#245A3C',
  clay: '#F0C9A8',
  sand: '#EBD9B8',
  stone: '#D8DDD6',
  sun: '#E8B64A',
  amber: '#C9822B',
  amberDeep: '#7A4A0E',
  slate: '#53646E',
  slateDeep: '#3B4A53',
  surface: '#FFFDF9',
  border: '#E3D9C9',
  divider: '#ECE4D6',
  cameraBg: '#161B1F',

  // Derived, same palette family
  onPrimary: '#FFFFFF',
  onCamera: '#F7F3EC',
  onCameraMuted: 'rgba(247,243,236,0.62)',
  cameraControl: 'rgba(247,243,236,0.14)',
  primarySoft: 'rgba(181,80,47,0.1)',
  forestSoft: 'rgba(46,107,74,0.13)',
  slateSoft: 'rgba(83,100,110,0.14)',
  sunSoft: 'rgba(232,182,74,0.26)',
  danger: '#B3362B',
  dangerSoft: 'rgba(179,54,43,0.1)',
  scrim: 'rgba(22,27,31,0.5)',
  glass: 'rgba(255,253,249,0.6)',
  glassEdge: 'rgba(255,253,249,0.9)',
  flash: '#FFFFFF',
  shutterRing: 'rgba(247,243,236,0.92)',
  viewfinder: 'rgba(247,243,236,0.85)',
  hintPill: 'rgba(22,27,31,0.58)',
  skeleton: '#EAE1D2',
  skeletonHighlight: '#FAF6EF',
  transparent: 'transparent',
} as const;

export type ColorName = keyof typeof colors;

type GradientStops = readonly [string, string, ...string[]];
type Point = { x: number; y: number };

/** CSS-style angle (0° = to top, 90° = to right) → expo-linear-gradient start/end points. */
function angle(deg: number): { start: Point; end: Point } {
  const rad = (deg * Math.PI) / 180;
  const dx = Math.sin(rad) / 2;
  const dy = -Math.cos(rad) / 2;
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return {
    start: { x: round(0.5 - dx), y: round(0.5 - dy) },
    end: { x: round(0.5 + dx), y: round(0.5 + dy) },
  };
}

export const gradients = {
  screen: { colors: [colors.bgTop, colors.bgBottom] as GradientStops, ...angle(180) },
  primary: { colors: [colors.primary, colors.primaryDeep] as GradientStops, ...angle(135) },
  hero: { colors: [colors.clay, colors.sand, colors.stone] as GradientStops, ...angle(158) },
  slate: { colors: ['#2A3238', colors.cameraBg] as GradientStops, ...angle(150) },
  warm: { colors: [colors.sun, colors.amber] as GradientStops, ...angle(135) },
  camera: {
    colors: ['rgba(22,27,31,0)', colors.cameraBg] as GradientStops,
    ...angle(180),
  },
  // Keeps light controls legible over a photo.
  photoTop: {
    colors: ['rgba(22,27,31,0.55)', 'rgba(22,27,31,0)'] as GradientStops,
    ...angle(180),
  },
  // Band swept down a photo while it's being identified.
  scan: {
    colors: ['rgba(232,182,74,0)', 'rgba(232,182,74,0.45)', 'rgba(232,182,74,0)'] as GradientStops,
    ...angle(180),
  },
  // Highlight swept across skeleton placeholders.
  shimmer: {
    colors: [
      'rgba(255,255,255,0)',
      'rgba(255,255,255,0.75)',
      'rgba(255,255,255,0)',
    ] as GradientStops,
    ...angle(90),
  },
  // Soft light sheen laid over the top half of primary buttons.
  gloss: {
    colors: ['rgba(255,255,255,0.22)', 'rgba(255,255,255,0)'] as GradientStops,
    ...angle(180),
  },
} as const;

export type GradientName = keyof typeof gradients;

export const fonts = {
  display: 'Fraunces_600SemiBold',
  regular: 'HankenGrotesk_400Regular',
  semibold: 'HankenGrotesk_600SemiBold',
  bold: 'HankenGrotesk_700Bold',
  italic: 'HankenGrotesk_400Regular_Italic',
} as const;

// Custom fonts carry their weight in the family name, so no fontWeight is set (Android would
// otherwise try to synthesize a weight on top of it).
export const typography = {
  welcome: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, letterSpacing: -0.4 },
  title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32, letterSpacing: -0.3 },
  cardTitle: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, letterSpacing: -0.2 },
  section: { fontFamily: fonts.display, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 18 },
  button: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 18, letterSpacing: 0.2 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
  captionStrong: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 16, letterSpacing: 0.3 },
  scientific: { fontFamily: fonts.italic, fontSize: 15, lineHeight: 20 },
  scientificSmall: { fontFamily: fonts.italic, fontSize: 13, lineHeight: 18 },
  stat: { fontFamily: fonts.display, fontSize: 28, lineHeight: 32 },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

/** Caps Dynamic Type / font scale so layouts stay intact at the largest sizes. */
export const maxFontScale = 1.35;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 32,
  xxxl: 44,
} as const;

export const layout = {
  screenPadding: 26,
  touchTarget: 44,
  tabBarHeight: 64,
  cameraButton: 68,
  inputHeight: 54,
  buttonHeight: 54,
  shutter: 78,
  cameraControl: 54,
} as const;

export const radii = {
  hero: 26,
  card: 20,
  cardSm: 18,
  button: 16,
  input: 14,
  pill: 999,
} as const;

// RN's cross-platform boxShadow (New Architecture) renders the same blur on iOS and Android.
export const shadows = {
  button: '0px 10px 22px rgba(143,58,31,0.30)',
  card: '0px 6px 16px rgba(60,44,28,0.07)',
  raised: '0px 12px 28px rgba(60,44,28,0.16)',
  cameraHalo: '0px 0px 0px 6px rgba(181,80,47,0.16)',
  // Background glows: a tiny circle whose blurred spread forms a soft radial light.
  glowClay: '0px 0px 90px 70px rgba(240,201,168,0.7)',
  glowStone: '0px 0px 90px 60px rgba(216,221,214,0.8)',
  glowSun: '0px 0px 70px 40px rgba(232,182,74,0.16)',
} as const;

export const motion = {
  duration: { flash: 60, fast: 200, base: 250, slow: 300 },
  easing: Easing.out(Easing.cubic),
  spring: {
    sheet: { damping: 18, stiffness: 170, mass: 1 },
    press: { damping: 16, stiffness: 320, mass: 0.6 },
  },
  pressScale: { button: 0.97, card: 0.98, shutter: 0.92 },
  stagger: 40,
  riseDistance: 8,
  // Loading loops (shimmer, scan) are ambient indicators, not transitions, so they run longer.
  shimmerMs: 1300,
  scanMs: 1900,
  glowMs: 2400,
  floatMs: 3200,
} as const;

/** Entrance for stacked content: fade + 8 px rise, staggered, instant under Reduce Motion. */
export const enter = (index = 0) =>
  FadeInDown.duration(motion.duration.slow)
    .delay(index * motion.stagger)
    .easing(motion.easing)
    .withInitialValues({ opacity: 0, transform: [{ translateY: motion.riseDistance }] })
    .reduceMotion(ReduceMotion.System);

/** Layout animation presets. All respect Reduce Motion. */
export const transitions = {
  layout: LinearTransition.duration(motion.duration.base)
    .easing(motion.easing)
    .reduceMotion(ReduceMotion.System),
  fadeIn: FadeIn.duration(motion.duration.base).reduceMotion(ReduceMotion.System),
  fadeOut: FadeOut.duration(motion.duration.fast).reduceMotion(ReduceMotion.System),
  /** Result sheet: springs up from the bottom (brief: damping 18). */
  sheetIn: SlideInDown.springify()
    .damping(motion.spring.sheet.damping)
    .stiffness(motion.spring.sheet.stiffness)
    .reduceMotion(ReduceMotion.System),
  pop: ZoomIn.springify()
    .damping(motion.spring.sheet.damping)
    .stiffness(motion.spring.sheet.stiffness)
    .reduceMotion(ReduceMotion.System),
} as const;

export const hitSlop = { top: 10, bottom: 10, left: 10, right: 10 } as const;
