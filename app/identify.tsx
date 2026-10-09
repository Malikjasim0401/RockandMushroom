import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router, useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CameraPermission } from '@/components/identify/CameraPermission';
import { CaptureFlash } from '@/components/identify/CaptureFlash';
import { ShutterButton } from '@/components/identify/ShutterButton';
import { Viewfinder } from '@/components/identify/Viewfinder';
import {
  GradientBg,
  Icon,
  IconButton,
  PressableScale,
  SegmentedControl,
  type SegmentOption,
  Toast,
} from '@/components/ui';
import { type Photo } from '@/lib/types';
import { colors, layout, radii, spacing } from '@/theme';

type Mode = 'photo' | 'sound';

const TOAST_MS = 4000;

// Sound ID is v2: shown, but disabled with a "Soon" badge (brief).
const MODES: readonly SegmentOption<Mode>[] = [
  { value: 'photo', label: 'Photo' },
  { value: 'sound', label: 'Sound', disabled: true, badge: 'Soon' },
];

const openResult = ({ uri, width, height }: Photo) =>
  router.replace({
    pathname: '/result',
    params: { uri, width: String(width), height: String(height) },
  });

export default function IdentifyScreen() {
  const insets = useSafeAreaInsets();
  // Only one camera preview may run at a time; unmount it whenever this screen isn't focused.
  const focused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);

  const [facing, setFacing] = useState<CameraType>('back');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(0);
  const [error, setError] = useState<string>();

  const granted = permission?.granted === true;

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(undefined), TOAST_MS);
    return () => clearTimeout(timer);
  }, [error]);

  // Ask on first open; if declined, CameraPermission offers a retry or Settings.
  useEffect(() => {
    if (permission?.status === 'undetermined') requestPermission();
  }, [permission?.status, requestPermission]);

  const capture = async () => {
    if (!camera.current || !ready || busy) return;
    setBusy(true);
    setError(undefined);
    setFlash((n) => n + 1);
    try {
      const picture = await camera.current.takePictureAsync({ quality: 0.9 });
      openResult(picture);
    } catch {
      setError("Couldn't take the photo. Please try again.");
      setBusy(false);
    }
  };

  const pickFromLibrary = async () => {
    if (busy) return;
    setBusy(true);
    setError(undefined);
    try {
      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
      });
      const asset = picked.canceled ? undefined : picked.assets[0];
      if (asset) {
        openResult(asset);
        return;
      }
    } catch {
      setError("Couldn't open your photos. Please try again.");
    }
    setBusy(false);
  };

  const flip = () => {
    setReady(false);
    setFacing((f) => (f === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <View style={styles.preview}>
        {granted && focused ? (
          <>
            <CameraView
              ref={camera}
              style={StyleSheet.absoluteFill}
              facing={facing}
              animateShutter={false}
              onCameraReady={() => setReady(true)}
              onMountError={() =>
                setError('The camera could not start. Try picking a photo instead.')
              }
            />
            <Viewfinder />
            <CaptureFlash trigger={flash} />
          </>
        ) : (
          permission &&
          !granted && (
            <CameraPermission canAskAgain={permission.canAskAgain} onRequest={requestPermission} />
          )
        )}

        <GradientBg variant="photoTop" style={[styles.topFade, { height: insets.top + 96 }]} />
        <View style={[styles.topBar, { paddingTop: insets.top + spacing.xs }]}>
          <IconButton icon="close" tone="dark" accessibilityLabel="Close" onPress={router.back} />
        </View>
      </View>

      <View style={[styles.panel, { paddingBottom: insets.bottom + spacing.lg }]}>
        <SegmentedControl
          tone="dark"
          options={MODES}
          value="photo"
          onChange={() => {}}
          accessibilityLabel="Identify by photo or sound"
        />
        <View style={styles.controls}>
          <PressableScale
            onPress={pickFromLibrary}
            disabled={busy}
            accessibilityLabel="Choose from library"
            style={styles.control}
          >
            <Icon name="gallery" size={24} color="onCamera" />
          </PressableScale>

          <ShutterButton onPress={capture} disabled={!granted || !ready || busy} />

          <PressableScale
            onPress={flip}
            disabled={!granted || busy}
            accessibilityLabel={
              facing === 'back' ? 'Switch to front camera' : 'Switch to back camera'
            }
            style={[styles.control, !granted && styles.dim]}
          >
            <Icon name="flip" size={24} color="onCamera" />
          </PressableScale>
        </View>
      </View>

      {error && <Toast message={error} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cameraBg,
  },
  preview: {
    flex: 1,
    overflow: 'hidden',
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: layout.screenPadding - spacing.xs,
  },
  panel: {
    marginTop: -radii.hero,
    borderTopLeftRadius: radii.hero,
    borderTopRightRadius: radii.hero,
    backgroundColor: colors.cameraBg,
    paddingTop: spacing.lg,
    paddingHorizontal: layout.screenPadding,
    gap: spacing.lg,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  control: {
    width: layout.cameraControl,
    height: layout.cameraControl,
    borderRadius: radii.pill,
    backgroundColor: colors.cameraControl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dim: {
    opacity: 0.5,
  },
});
