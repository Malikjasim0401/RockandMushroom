import { Image } from 'expo-image';
import { getDownloadURL, ref } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { storage } from '@/lib/firebase';
import { type Find } from '@/lib/types';
import { colors, motion } from '@/theme';

// Fallback for finds saved without a stored URL: resolved once per path and cached.
const resolved = new Map<string, Promise<string>>();
const resolveUrl = (path: string) => {
  let url = resolved.get(path);
  if (!url) {
    url = getDownloadURL(ref(storage, path));
    url.catch(() => resolved.delete(path));
    resolved.set(path, url);
  }
  return url;
};

function usePhotoUrl({ photoUrl, photoPath }: Pick<Find, 'photoUrl' | 'photoPath'>) {
  const [fallback, setFallback] = useState<string>();
  useEffect(() => {
    if (photoUrl || !photoPath) return;
    let live = true;
    resolveUrl(photoPath).then(
      (url) => live && setFallback(url),
      () => {},
    );
    return () => {
      live = false;
    };
  }, [photoUrl, photoPath]);
  return photoUrl || fallback;
}

type SpecimenPhotoProps = {
  find: Pick<Find, 'id' | 'photoUrl' | 'photoPath' | 'name'>;
  style?: StyleProp<ViewStyle>;
  /** Lists recycle views; the key stops a recycled cell flashing the previous photo. */
  recycle?: boolean;
  /** Blurs the photo, for backdrops. */
  blurRadius?: number;
};

/** A find's photo from the memory/disk cache, fading in over a soft placeholder. */
export function SpecimenPhoto({ find, style, recycle, blurRadius }: SpecimenPhotoProps) {
  const uri = usePhotoUrl(find);
  return (
    <View style={[styles.placeholder, style]}>
      {uri && (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          blurRadius={blurRadius}
          cachePolicy="memory-disk"
          transition={motion.duration.base}
          recyclingKey={recycle ? find.id : undefined}
          accessibilityLabel={blurRadius ? undefined : `Photo of ${find.name}`}
          accessible={!blurRadius}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.skeleton,
    overflow: 'hidden',
  },
});
