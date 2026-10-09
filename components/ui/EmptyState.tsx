import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { colors, radii, spacing, transitions } from '@/theme';

import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type EmptyStateProps = {
  icon: IconName;
  title: string;
  message: string;
  action?: { title: string; icon?: IconName; onPress: () => void };
};

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <Animated.View entering={transitions.fadeIn} style={styles.root}>
      <View style={styles.icon}>
        <Icon name={icon} size={28} color="primary" />
      </View>
      <Text variant="cardTitle" align="center">
        {title}
      </Text>
      <Text variant="body" align="center">
        {message}
      </Text>
      {action && (
        <Button
          title={action.title}
          icon={action.icon}
          onPress={action.onPress}
          style={styles.button}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  button: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
  },
});
