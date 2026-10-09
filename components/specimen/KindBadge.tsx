import { type StyleProp, type ViewStyle } from 'react-native';

import { Badge } from '@/components/ui';
import { type SpecimenKind } from '@/lib/types';

import { KIND_META } from './kinds';

export function KindBadge({ kind, style }: { kind: SpecimenKind; style?: StyleProp<ViewStyle> }) {
  const meta = KIND_META[kind];
  return <Badge label={meta.label} icon={meta.icon} tone={meta.tone} style={style} />;
}
