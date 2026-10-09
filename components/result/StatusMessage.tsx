import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Button, Icon, type IconName, Text } from '@/components/ui';
import { type ColorName, colors, radii, spacing, transitions } from '@/theme';

type Action = {
  title: string;
  icon?: IconName;
  onPress: () => void;
};

type StatusMessageProps = {
  icon: IconName;
  tone?: 'primary' | 'sun';
  title: string;
  message: string;
  primary: Action;
  secondary?: Action;
};

const toneStyle: Record<'primary' | 'sun', { bg: string; fg: ColorName }> = {
  primary: { bg: colors.primarySoft, fg: 'primary' },
  sun: { bg: colors.sunSoft, fg: 'amber' },
};

/** Sheet content for outcomes without a specimen: "No specimen found", "Daily limit reached". */
export function StatusMessage({
  icon,
  tone = 'primary',
  title,
  message,
  primary,
  secondary,
}: StatusMessageProps) {
  const t = toneStyle[tone];
  return (
    <View style={styles.root}>
      <Animated.View entering={transitions.pop} style={[styles.icon, { backgroundColor: t.bg }]}>
        <Icon name={icon} size={30} color={t.fg} />
      </Animated.View>
      <View style={styles.copy}>
        <Text variant="cardTitle" align="center" accessibilityRole="header">
          {title}
        </Text>
        <Text variant="body" align="center">
          {message}
        </Text>
      </View>
      <View style={styles.actions}>
        <Button title={primary.title} icon={primary.icon} onPress={primary.onPress} />
        {secondary && (
          <Button
            title={secondary.title}
            icon={secondary.icon}
            variant="secondary"
            onPress={secondary.onPress}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: spacing.md,
  },
  icon: {
    width: 68,
    height: 68,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    gap: spacing.xs,
  },
  actions: {
    alignSelf: 'stretch',
    gap: spacing.sm,
  },
});
