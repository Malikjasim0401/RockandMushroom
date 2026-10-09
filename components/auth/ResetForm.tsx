import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Button, Icon, Notice, Text, TextButton, TextField } from '@/components/ui';
import { useErrorShake } from '@/hooks/useErrorShake';
import { sendPasswordReset } from '@/lib/auth';
import { authErrorMessage, errorCode } from '@/lib/errors';
import { validateEmail } from '@/lib/validation';
import { colors, radii, spacing, transitions } from '@/theme';

type ResetFormProps = {
  initialEmail: string;
  onBack: () => void;
};

export function ResetForm({ initialEmail, onBack }: ResetFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string>();
  const { shakeStyle, shake } = useErrorShake();

  const submit = async () => {
    if (submitting) return;
    const invalid = validateEmail(email);
    if (invalid) {
      setError(invalid);
      shake();
      return;
    }
    setSubmitting(true);
    setError(undefined);
    try {
      await sendPasswordReset(email);
      setSentTo(email.trim());
    } catch (e) {
      // Same confirmation whether or not the account exists, so emails can't be probed.
      if (errorCode(e) === 'auth/user-not-found') {
        setSentTo(email.trim());
      } else {
        setError(authErrorMessage(e));
        shake();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (sentTo) {
    return (
      <Animated.View entering={transitions.pop} style={styles.sent}>
        <View style={styles.sentIcon}>
          <Icon name="mailOpen" size={30} color="primary" />
        </View>
        <Text variant="cardTitle" align="center">
          Check your inbox
        </Text>
        {/* Firebase doesn't reveal whether an account exists, so neither do we. */}
        <Text variant="body" align="center">
          If an account exists for {sentTo}, a reset link is on its way. It may take a minute to
          arrive.
        </Text>
        <Button title="Back to sign in" onPress={onBack} style={styles.full} />
        <TextButton title="Use a different email" onPress={() => setSentTo(undefined)} />
      </Animated.View>
    );
  }

  return (
    <View style={styles.root}>
      <Animated.View style={shakeStyle}>
        <TextField
          label="Email"
          icon="mail"
          placeholder="you@example.com"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (error) setError(undefined);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="send"
          onSubmitEditing={submit}
          editable={!submitting}
          autoFocus={!initialEmail}
        />
      </Animated.View>

      {error && <Notice message={error} />}

      <Button title="Send reset link" icon="key" onPress={submit} loading={submitting} />
      <TextButton title="Back to sign in" onPress={onBack} style={styles.center} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  sent: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  sentIcon: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxs,
  },
  full: {
    alignSelf: 'stretch',
    marginTop: spacing.xs,
  },
  center: {
    alignSelf: 'center',
  },
});
