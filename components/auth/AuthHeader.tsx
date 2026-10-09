import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Logo } from '@/components/brand/Logo';
import { GradientBg, Text } from '@/components/ui';
import { enter, radii, spacing, transitions } from '@/theme';

import { type AuthMode } from './types';

const COPY: Record<AuthMode, { title: string; subtitle: string }> = {
  signIn: {
    title: 'Welcome back',
    subtitle: 'Sign in to keep building your collection of finds.',
  },
  signUp: {
    title: 'Start your collection',
    subtitle: 'Create an account to save every rock, mineral and mushroom you find.',
  },
  reset: {
    title: 'Reset password',
    subtitle: "We'll email you a link to choose a new one.",
  },
};

const HALO = 132;

export function AuthHeader({ mode }: { mode: AuthMode }) {
  const copy = COPY[mode];

  return (
    <View style={styles.root}>
      <Animated.View entering={transitions.pop} style={styles.mark}>
        <GradientBg variant="hero" style={styles.halo} />
        <Logo size={76} />
      </Animated.View>

      <Animated.View entering={enter(1)}>
        <Text variant="section" color="primaryDeep" align="center">
          RockAndMushroom
        </Text>
      </Animated.View>

      {/* Keyed by mode so the copy cross-fades when switching forms. */}
      <Animated.View key={mode} entering={enter(2)} style={styles.copy}>
        <Text variant="welcome" align="center" accessibilityRole="header">
          {copy.title}
        </Text>
        <Text variant="body" align="center">
          {copy.subtitle}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  mark: {
    width: HALO,
    height: HALO,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxs,
  },
  halo: {
    position: 'absolute',
    width: HALO,
    height: HALO,
    borderRadius: radii.pill,
    opacity: 0.75,
  },
  copy: {
    gap: spacing.xs,
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
});
