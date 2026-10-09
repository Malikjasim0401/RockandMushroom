import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

import { type GradientName, gradients } from '@/theme';

type GradientBgProps = {
  variant?: GradientName;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

export function GradientBg({ variant = 'screen', style, children }: GradientBgProps) {
  const g = gradients[variant];
  return (
    <LinearGradient colors={g.colors} start={g.start} end={g.end} style={style}>
      {children}
    </LinearGradient>
  );
}
