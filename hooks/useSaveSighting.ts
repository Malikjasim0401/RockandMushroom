import * as Haptics from 'expo-haptics';
import { useCallback, useRef, useState } from 'react';

import { useUser } from '@/hooks/useAuth';
import { SaveError, saveSighting } from '@/lib/sightings';
import { type IdentifyResult, type Photo } from '@/lib/types';

export type SaveState =
  | { status: 'idle' }
  | { status: 'saving' }
  | { status: 'saved'; id: string }
  | { status: 'error'; message: string };

/**
 * "Add to finds" for one identified photo. A ref guards against double taps, so one result
 * can only ever be saved once, even if the button is pressed twice before re-rendering.
 */
export function useSaveSighting(result: IdentifyResult, photo: Photo) {
  const { uid } = useUser();
  const [state, setState] = useState<SaveState>({ status: 'idle' });
  const inFlight = useRef(false);
  const savedId = useRef<string | null>(null);

  const save = useCallback(async (): Promise<string | null> => {
    if (savedId.current) return savedId.current;
    if (inFlight.current) return null;
    inFlight.current = true;
    setState({ status: 'saving' });
    try {
      const id = await saveSighting(uid, result, photo);
      savedId.current = id;
      setState({ status: 'saved', id });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      return id;
    } catch (error) {
      setState({
        status: 'error',
        message:
          error instanceof SaveError
            ? error.message
            : "Couldn't save to your finds. Please try again.",
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return null;
    } finally {
      inFlight.current = false;
    }
  }, [uid, result, photo]);

  return { state, save };
}
