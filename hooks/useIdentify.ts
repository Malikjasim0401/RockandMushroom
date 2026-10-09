import { useCallback, useEffect, useRef, useState } from 'react';

import { useUser } from '@/hooks/useAuth';
import { IdentifyError, identifyPhoto } from '@/lib/identify';
import { preparePhoto } from '@/lib/photo';
import { type IdentifyResult, type Photo } from '@/lib/types';

export type IdentifyState =
  | { status: 'preparing' }
  | { status: 'uploading' }
  | { status: 'identifying' }
  | { status: 'success'; result: IdentifyResult; photo: Photo }
  | { status: 'noSpecimen' }
  | { status: 'limit'; message: string }
  | { status: 'error'; message: string };

type WorkingState = Extract<IdentifyState, { status: 'preparing' | 'uploading' | 'identifying' }>;

export const isWorking = (s: IdentifyState): s is WorkingState =>
  s.status === 'preparing' || s.status === 'uploading' || s.status === 'identifying';

/**
 * Runs the identify flow for one photo: prepare (once) → upload + identify. `retry` reuses the
 * prepared photo, so a network error keeps the photo and only repeats the network part.
 * Leaving the screen cancels the listener and ignores late results.
 */
export function useIdentify(source: Photo) {
  const { uid } = useUser();
  const [state, setState] = useState<IdentifyState>({ status: 'preparing' });
  const [attempt, setAttempt] = useState(0);
  const prepared = useRef<{ sourceUri: string; photo: Photo } | null>(null);

  const { uri, width, height } = source;

  useEffect(() => {
    const controller = new AbortController();
    const live = () => !controller.signal.aborted;

    (async () => {
      try {
        let photo = prepared.current?.sourceUri === uri ? prepared.current.photo : null;
        if (!photo) {
          photo = await preparePhoto({ uri, width, height });
          prepared.current = { sourceUri: uri, photo };
        }
        if (!live()) return;

        const result = await identifyPhoto(uid, photo, {
          signal: controller.signal,
          onPhase: (phase) => live() && setState({ status: phase }),
        });
        if (!live()) return;
        setState(
          result.isSpecimen ? { status: 'success', result, photo } : { status: 'noSpecimen' },
        );
      } catch (error) {
        if (!live()) return;
        if (error instanceof IdentifyError) {
          if (error.code === 'aborted') return;
          setState(
            error.code === 'limit'
              ? { status: 'limit', message: error.message }
              : { status: 'error', message: error.message },
          );
          return;
        }
        // preparePhoto failures (unreadable image) land here.
        setState({ status: 'error', message: "We couldn't read that photo. Please try another." });
      }
    })();

    return () => controller.abort();
  }, [uid, uri, width, height, attempt]);

  const retry = useCallback(() => {
    setState({ status: 'preparing' });
    setAttempt((n) => n + 1);
  }, []);

  return { state, retry };
}
