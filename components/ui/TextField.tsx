import { type Ref, useState } from 'react';
import { Pressable, StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { colors, fonts, hitSlop, layout, maxFontScale, radii, spacing, typography } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type TextFieldProps = Omit<TextInputProps, 'style' | 'secureTextEntry'> & {
  label: string;
  icon?: IconName;
  error?: string;
  /** Renders as a password field with a show/hide toggle. */
  secure?: boolean;
  /** Shows a clear button while there is text (works on both platforms, unlike clearButtonMode). */
  onClear?: () => void;
  ref?: Ref<TextInput>;
};

export function TextField({
  label,
  icon,
  error,
  secure = false,
  onClear,
  onFocus,
  onBlur,
  ref,
  ...rest
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secure);

  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;
  const multiline = rest.multiline === true;

  return (
    <View style={styles.wrapper}>
      <Text variant="label" color="inkMuted">
        {label}
      </Text>
      <View style={[styles.field, multiline && styles.fieldMultiline, { borderColor }]}>
        {icon && <Icon name={icon} size={18} color={focused ? 'primary' : 'inkFaint'} />}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors.inkFaint}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          maxFontSizeMultiplier={maxFontScale}
          secureTextEntry={hidden}
          style={[styles.input, multiline && styles.inputMultiline]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {onClear && !secure && !!rest.value && (
          <Pressable
            onPress={onClear}
            hitSlop={hitSlop}
            accessibilityRole="button"
            accessibilityLabel={`Clear ${label.toLowerCase()}`}
            style={styles.toggle}
          >
            <View style={styles.clear}>
              <Icon name="close" size={14} color="surface" />
            </View>
          </Pressable>
        )}
        {secure && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={hitSlop}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            style={styles.toggle}
          >
            <Icon name={hidden ? 'eye' : 'eyeOff'} size={20} color="inkFaint" />
          </Pressable>
        )}
      </View>
      {!!error && (
        <Text variant="caption" color="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  field: {
    minHeight: layout.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.input,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    // lineHeight is left out on purpose: it misaligns single-line input text on iOS.
    fontFamily: fonts.regular,
    fontSize: typography.body.fontSize,
    color: colors.ink,
    paddingVertical: spacing.sm,
  },
  fieldMultiline: {
    alignItems: 'flex-start',
    paddingVertical: spacing.xs,
  },
  inputMultiline: {
    minHeight: 104,
    lineHeight: typography.body.lineHeight,
    textAlignVertical: 'top',
  },
  clear: {
    width: 20,
    height: 20,
    borderRadius: radii.pill,
    backgroundColor: colors.inkFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggle: {
    minWidth: layout.touchTarget,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -spacing.sm,
  },
});
