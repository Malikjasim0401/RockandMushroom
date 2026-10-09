import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, shadows } from '@/theme';

import { GradientBg } from './GradientBg';

/**
 * Screen background: the vertical mint gradient plus three soft light glows. Static and
 * non-interactive, so it renders once and never re-renders.
 */
export const Backdrop = memo(function Backdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <GradientBg style={StyleSheet.absoluteFill} />
      <View style={[styles.glow, styles.mint]} />
      <View style={[styles.glow, styles.sky]} />
      <View style={[styles.glow, styles.sun]} />
    </View>
  );
});

const GLOW = 60;

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    width: GLOW,
    height: GLOW,
    borderRadius: GLOW / 2,
  },
  mint: {
    top: 20,
    right: 10,
    backgroundColor: colors.clay,
    boxShadow: shadows.glowClay,
  },
  sky: {
    top: '42%',
    left: -30,
    backgroundColor: colors.stone,
    boxShadow: shadows.glowStone,
  },
  sun: {
    bottom: '14%',
    right: -10,
    backgroundColor: colors.sunSoft,
    boxShadow: shadows.glowSun,
  },
});
