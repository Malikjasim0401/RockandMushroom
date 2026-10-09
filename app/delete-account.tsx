import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  Button,
  Icon,
  IconButton,
  Notice,
  Screen,
  Text,
  TextButton,
  TextField,
} from '@/components/ui';
import { useUser } from '@/hooks/useAuth';
import { useErrorShake } from '@/hooks/useErrorShake';
import { DeleteAccountError, deleteAccount } from '@/lib/account';
import { colors, enter, radii, spacing } from '@/theme';

const WHAT_GOES = [
  'Your account and sign-in',
  'Every find in your collection',
  'All of your specimen photos',
  'Your notes and specimen count',
];

const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

/**
 * Permanent account deletion (App Store guideline 5.1.1(v), DECISIONS.md D21). On success the
 * session ends and the auth guard takes the user to sign-in, so this screen needs no success state.
 */
export default function DeleteAccountScreen() {
  const { email } = useUser();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [deleting, setDeleting] = useState(false);
  const { shakeStyle, shake } = useErrorShake();

  const confirm = async () => {
    if (deleting) return;
    if (!password) {
      setError('Enter your password to confirm.');
      shake();
      return;
    }
    setDeleting(true);
    setError(undefined);
    try {
      await deleteAccount(password);
    } catch (e) {
      setError(e instanceof DeleteAccountError ? e.message : "Couldn't delete your account.");
      shake();
      setDeleting(false);
    }
  };

  return (
    <Screen scroll keyboardAware edges={['top', 'bottom']} contentStyle={styles.content}>
      <IconButton icon="close" accessibilityLabel="Close" onPress={close} />

      <Animated.View entering={enter(0)} style={styles.heading}>
        <View style={styles.icon}>
          <Icon name="alert" size={28} color="danger" />
        </View>
        <Text variant="title" accessibilityRole="header">
          Delete your account?
        </Text>
        <Text variant="body">
          This permanently deletes {email || 'your account'} and everything in it. It can{"'"}t be
          undone.
        </Text>
      </Animated.View>

      <Animated.View entering={enter(1)} style={styles.list}>
        {WHAT_GOES.map((item) => (
          <View key={item} style={styles.row}>
            <Icon name="close" size={16} color="danger" />
            <Text variant="bodyStrong">{item}</Text>
          </View>
        ))}
      </Animated.View>

      <Animated.View entering={enter(2)} style={[styles.form, shakeStyle]}>
        <TextField
          secure
          label="Confirm with your password"
          icon="lock"
          placeholder="Your password"
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            if (error) setError(undefined);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={confirm}
          editable={!deleting}
        />
        {error && <Notice message={error} />}
      </Animated.View>

      <Animated.View entering={enter(3)} style={styles.actions}>
        <Button
          title="Delete my account"
          icon="alert"
          variant="danger"
          onPress={confirm}
          loading={deleting}
          accessibilityHint="Permanently deletes your account, finds and photos"
        />
        <TextButton
          title="Keep my account"
          onPress={close}
          disabled={deleting}
          style={styles.keep}
        />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    paddingTop: spacing.xs,
  },
  heading: {
    gap: spacing.xs,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  list: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  form: {
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.xs,
  },
  keep: {
    alignSelf: 'center',
  },
});
