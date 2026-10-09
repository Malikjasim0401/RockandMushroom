import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { type ColorName, colors, maxFontScale, typography, type TypographyVariant } from '@/theme';

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: ColorName;
  align?: 'left' | 'center' | 'right';
};

const defaultColor: Partial<Record<TypographyVariant, ColorName>> = {
  body: 'inkMuted',
  caption: 'inkFaint',
  captionStrong: 'inkFaint',
  scientific: 'inkMuted',
  scientificSmall: 'inkMuted',
};

export function Text({ variant = 'body', color, align, style, ...rest }: TextProps) {
  return (
    <RNText
      maxFontSizeMultiplier={maxFontScale}
      {...rest}
      style={[
        typography[variant],
        { color: colors[color ?? defaultColor[variant] ?? 'ink'] },
        align && { textAlign: align },
        style,
      ]}
    />
  );
}
