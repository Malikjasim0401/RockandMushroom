import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import { StyleSheet, type TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  Button,
  Notice,
  SegmentedControl,
  type SegmentOption,
  TextButton,
  TextField,
} from '@/components/ui';
import { useErrorShake } from '@/hooks/useErrorShake';
import { signIn, signUp } from '@/lib/auth';
import { authErrorMessage } from '@/lib/errors';
import { validateEmail, validateName, validatePassword } from '@/lib/validation';
import { spacing, transitions } from '@/theme';

import { type CredentialsMode } from './types';

const MODES: readonly SegmentOption<CredentialsMode>[] = [
  { value: 'signIn', label: 'Sign in' },
  { value: 'signUp', label: 'Create account' },
];

type Fields = { name: string; email: string; password: string };
type FieldErrors = Partial<Record<keyof Fields, string>>;

function validate(mode: CredentialsMode, f: Fields): FieldErrors {
  const errors: FieldErrors = {
    email: validateEmail(f.email),
    password: validatePassword(f.password, mode),
  };
  if (mode === 'signUp') errors.name = validateName(f.name);
  return errors;
}

const hasErrors = (e: FieldErrors) => Object.values(e).some(Boolean);

type CredentialsFormProps = {
  mode: CredentialsMode;
  onModeChange: (mode: CredentialsMode) => void;
  onForgotPassword: (email: string) => void;
};

export function CredentialsForm({ mode, onModeChange, onForgotPassword }: CredentialsFormProps) {
  const [fields, setFields] = useState<Fields>({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  // After the first failed submit, fields re-validate as the user types.
  const [liveValidate, setLiveValidate] = useState(false);
  const { shakeStyle, shake } = useErrorShake();

  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const isSignUp = mode === 'signUp';

  const update = (key: keyof Fields) => (value: string) => {
    const next = { ...fields, [key]: value };
    setFields(next);
    if (formError) setFormError(undefined);
    if (liveValidate) setErrors(validate(mode, next));
  };

  const switchMode = (next: CredentialsMode) => {
    setErrors({});
    setFormError(undefined);
    setLiveValidate(false);
    onModeChange(next);
  };

  const submit = async () => {
    if (submitting) return;
    const found = validate(mode, fields);
    if (hasErrors(found)) {
      setErrors(found);
      setLiveValidate(true);
      shake();
      if (found.name) nameRef.current?.focus();
      else if (found.email) emailRef.current?.focus();
      else passwordRef.current?.focus();
      return;
    }

    setSubmitting(true);
    setFormError(undefined);
    try {
      if (isSignUp) await signUp(fields.name, fields.email, fields.password);
      else await signIn(fields.email, fields.password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      // The root auth guard navigates away once the session updates.
    } catch (error) {
      setFormError(authErrorMessage(error));
      shake();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <SegmentedControl
        options={MODES}
        value={mode}
        onChange={switchMode}
        accessibilityLabel="Sign in or create an account"
      />

      <Animated.View style={[styles.fields, shakeStyle]}>
        {isSignUp && (
          <Animated.View entering={transitions.fadeIn} exiting={transitions.fadeOut}>
            <TextField
              ref={nameRef}
              label="Your name"
              icon="person"
              placeholder="Alex Rivera"
              value={fields.name}
              onChangeText={update('name')}
              error={errors.name}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => emailRef.current?.focus()}
              editable={!submitting}
            />
          </Animated.View>
        )}

        <Animated.View layout={transitions.layout}>
          <TextField
            ref={emailRef}
            label="Email"
            icon="mail"
            placeholder="you@example.com"
            value={fields.email}
            onChangeText={update('email')}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => passwordRef.current?.focus()}
            editable={!submitting}
          />
        </Animated.View>

        <Animated.View layout={transitions.layout}>
          <TextField
            ref={passwordRef}
            secure
            label="Password"
            icon="lock"
            placeholder={isSignUp ? 'At least 8 characters' : 'Your password'}
            value={fields.password}
            onChangeText={update('password')}
            error={errors.password}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            textContentType={isSignUp ? 'newPassword' : 'password'}
            returnKeyType="go"
            onSubmitEditing={submit}
            editable={!submitting}
          />
        </Animated.View>
      </Animated.View>

      {!isSignUp && (
        <Animated.View
          entering={transitions.fadeIn}
          exiting={transitions.fadeOut}
          layout={transitions.layout}
          style={styles.forgot}
        >
          <TextButton
            title="Forgot password?"
            onPress={() => onForgotPassword(fields.email)}
            disabled={submitting}
          />
        </Animated.View>
      )}

      {formError && <Notice message={formError} />}

      <Animated.View layout={transitions.layout}>
        <Button
          title={isSignUp ? 'Create account' : 'Sign in'}
          icon="arrowForward"
          onPress={submit}
          loading={submitting}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  fields: {
    gap: spacing.md,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginTop: -spacing.xs,
    marginBottom: -spacing.xs,
  },
});
