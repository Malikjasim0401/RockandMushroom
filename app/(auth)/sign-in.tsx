import { useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { AuthHeader } from '@/components/auth/AuthHeader';
import { CredentialsForm } from '@/components/auth/CredentialsForm';
import { ResetForm } from '@/components/auth/ResetForm';
import { type AuthMode, type CredentialsMode } from '@/components/auth/types';
import { Card, Icon, Screen, Text } from '@/components/ui';
import { enter, spacing, transitions } from '@/theme';

export default function SignInScreen() {
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [resetEmail, setResetEmail] = useState('');

  const openReset = (email: string) => {
    setResetEmail(email);
    setMode('reset');
  };

  return (
    <Screen scroll keyboardAware edges={['top', 'bottom']} contentStyle={styles.content}>
      <AuthHeader mode={mode} />

      <Animated.View entering={enter(3)} layout={transitions.layout}>
        <Card style={styles.card}>
          {mode === 'reset' ? (
            <Animated.View key="reset" entering={transitions.fadeIn}>
              <ResetForm initialEmail={resetEmail} onBack={() => setMode('signIn')} />
            </Animated.View>
          ) : (
            <Animated.View key="credentials" entering={transitions.fadeIn}>
              <CredentialsForm
                mode={mode}
                onModeChange={(next: CredentialsMode) => setMode(next)}
                onForgotPassword={openReset}
              />
            </Animated.View>
          )}
        </Card>
      </Animated.View>

      <Animated.View entering={enter(4)} style={styles.footer}>
        <Icon name="lock" size={13} color="inkFaint" />
        <Text variant="caption">Your finds are private to your account.</Text>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.xl,
  },
  card: {
    padding: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
  },
});
