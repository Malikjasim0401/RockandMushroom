import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { type Photo } from './types';

/** From the brief: max 1024 px on the long edge, JPEG quality 0.7. */
export const PHOTO_MAX_EDGE = 1024;
export const PHOTO_QUALITY = 0.7;

/**
 * Downscales and re-encodes a photo for identification. Always re-encodes, so gallery HEIC/PNG
 * images become the JPEG the function expects. Native image memory is released right away.
 */
export async function preparePhoto(source: Photo): Promise<Photo> {
  const context = ImageManipulator.manipulate(source.uri);
  const longEdge = Math.max(source.width, source.height);
  if (longEdge === 0 || longEdge > PHOTO_MAX_EDGE) {
    // One side only, so the aspect ratio is preserved.
    context.resize(
      source.width >= source.height ? { width: PHOTO_MAX_EDGE } : { height: PHOTO_MAX_EDGE },
    );
  }
  const image = await context.renderAsync();
  try {
    const saved = await image.saveAsync({ compress: PHOTO_QUALITY, format: SaveFormat.JPEG });
    return { uri: saved.uri, width: saved.width, height: saved.height };
  } finally {
    image.release();
    context.release();
  }
}
