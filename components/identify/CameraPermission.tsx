import { Linking, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Button, Icon, Text } from '@/components/ui';
import { colors, layout, radii, spacing, transitions } from '@/theme';

type CameraPermissionProps = {
  canAskAgain: boolean;
  onRequest: () => void;
};

/** Shown in place of the preview until camera access is granted. Gallery pick still works. */
export function CameraPermission({ canAskAgain, onRequest }: CameraPermissionProps) {
  return (
    <Animated.View entering={transitions.fadeIn} style={styles.root}>
      <View style={styles.icon}>
        <Icon name="camera" size={30} color="onCamera" />
      </View>
      <Text variant="cardTitle" color="onCamera" align="center">
        Let RockAndMushroom use your camera
      </Text>
      <Text variant="body" color="onCameraMuted" align="center">
        {canAskAgain
          ? 'Photograph a rock, mineral or mushroom and get its name in seconds. You can also pick a photo from your library below.'
          : 'Camera access is turned off. Turn it on in Settings, or pick a photo from your library below.'}
      </Text>
      <Button
        title={canAskAgain ? 'Allow camera' : 'Open Settings'}
        icon="camera"
        onPress={canAskAgain ? onRequest : () => Linking.openSettings()}
        style={styles.button}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: layout.screenPadding + spacing.sm,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: radii.pill,
    backgroundColor: colors.cameraControl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  button: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
  },
});
