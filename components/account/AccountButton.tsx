import { router } from 'expo-router';
import { Alert, StyleSheet } from 'react-native';

import { GradientBg, PressableScale, Text } from '@/components/ui';
import { signOut } from '@/lib/auth';
import { initials } from '@/lib/format';
import { type AuthUser } from '@/lib/types';
import { layout, radii, shadows } from '@/theme';

// Android alerts show at most three buttons, which fits exactly.
function openAccountMenu(user: AuthUser) {
  Alert.alert('Account', `Signed in as ${user.email}`, [
    {
      text: 'Sign out',
      onPress: () => {
        signOut().catch(() => Alert.alert("Couldn't sign out", 'Please try again.'));
      },
    },
    { text: 'Delete account', style: 'destructive', onPress: () => router.push('/delete-account') },
    { text: 'Cancel', style: 'cancel' },
  ]);
}

/** Avatar with the user's initials; opens the account menu (sign out, delete account). */
export function AccountButton({ user }: { user: AuthUser }) {
  return (
    <PressableScale
      onPress={() => openAccountMenu(user)}
      accessibilityLabel="Account"
      accessibilityHint="Shows options to sign out or delete your account"
      style={styles.root}
    >
      <GradientBg variant="primary" style={styles.fill}>
        <Text variant="label" color="onPrimary">
          {initials(user.displayName)}
        </Text>
      </GradientBg>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    borderRadius: radii.pill,
    boxShadow: shadows.card,
  },
  fill: {
    flex: 1,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
