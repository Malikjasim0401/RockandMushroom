import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { layout } from '@/theme';

import { Backdrop } from './Backdrop';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  /** Lifts content above the keyboard (forms). */
  keyboardAware?: boolean;
  /** Safe-area edges to pad. Tab screens skip the bottom edge; the tab bar handles it. */
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
};

export function Screen({
  children,
  scroll = false,
  keyboardAware = false,
  edges = ['top'],
  contentStyle,
}: ScreenProps) {
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.root, styles.content, contentStyle]}>{children}</View>
  );

  return (
    <View style={styles.root}>
      <Backdrop />
      <SafeAreaView edges={edges} style={styles.root}>
        {keyboardAware ? (
          // Android is edge-to-edge, so the window no longer resizes; padding works on both.
          <KeyboardAvoidingView behavior="padding" style={styles.root}>
            {body}
          </KeyboardAvoidingView>
        ) : (
          body
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
  },
});
