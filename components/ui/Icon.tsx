import Ionicons from '@expo/vector-icons/Ionicons';
import { type ComponentProps } from 'react';

import { type ColorName, colors } from '@/theme';

/** Every icon the app uses, so the icon set can be swapped in this one file. */
const glyphs = {
  home: 'home-outline',
  homeActive: 'home',
  journal: 'book-outline',
  journalActive: 'book',
  camera: 'camera',
  gallery: 'images-outline',
  flip: 'camera-reverse-outline',
  close: 'close',
  back: 'chevron-back',
  forward: 'chevron-forward',
  search: 'search',
  mail: 'mail-outline',
  lock: 'lock-closed-outline',
  person: 'person-outline',
  eye: 'eye-outline',
  eyeOff: 'eye-off-outline',
  logout: 'log-out-outline',
  leaf: 'leaf',
  sparkles: 'sparkles',
  mic: 'mic-outline',
  calendar: 'calendar-outline',
  check: 'checkmark',
  checkCircle: 'checkmark-circle',
  mailOpen: 'mail-open-outline',
  key: 'key-outline',
  arrowForward: 'arrow-forward',
  alert: 'alert-circle-outline',
  refresh: 'refresh',
  add: 'add',
  region: 'earth-outline',
  habitat: 'trail-sign-outline',
  time: 'time-outline',
  help: 'help-circle-outline',
  offline: 'cloud-offline-outline',
  scan: 'scan-outline',
  bookmark: 'bookmark-outline',
  rock: 'cube',
  mineral: 'diamond',
  mushroom: 'leaf',
  warning: 'warning-outline',
  skull: 'skull-outline',
  layers: 'layers-outline',
  hardness: 'hammer-outline',
  luster: 'sunny-outline',
  palette: 'color-palette-outline',
  streak: 'brush-outline',
  composition: 'flask-outline',
  cap: 'ellipse-outline',
  stem: 'remove-outline',
  gills: 'menu-outline',
  spore: 'finger-print-outline',
  shield: 'shield-checkmark-outline',
} as const satisfies Record<string, ComponentProps<typeof Ionicons>['name']>;

export type IconName = keyof typeof glyphs;

export const iconFont = Ionicons.font;

type IconProps = {
  name: IconName;
  size?: number;
  color?: ColorName;
};

export function Icon({ name, size = 22, color = 'ink' }: IconProps) {
  return (
    <Ionicons
      name={glyphs[name]}
      size={size}
      color={colors[color]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
