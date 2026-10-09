import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Text, TextButton, TextField } from '@/components/ui';
import { useUser } from '@/hooks/useAuth';
import { NOTES_MAX, updateNotes } from '@/lib/sightings';
import { spacing, transitions } from '@/theme';

type Status = 'idle' | 'saving' | 'saved' | 'error';

const STATUS_LABEL: Record<Exclude<Status, 'idle'>, string> = {
  saving: 'Saving…',
  saved: 'Saved',
  error: "Couldn't save. Tap Save to try again.",
};

type NotesEditorProps = {
  findId: string;
  notes: string;
};

/**
 * Notes on a find. Saves when the field loses focus, or with Save. Mount it with
 * `key={findId}` so switching finds resets the draft.
 */
export function NotesEditor({ findId, notes }: NotesEditorProps) {
  const { uid } = useUser();
  const [draft, setDraft] = useState(notes);
  const [saved, setSaved] = useState(notes);
  const [status, setStatus] = useState<Status>('idle');

  const dirty = draft.trim() !== saved.trim();

  const save = async () => {
    if (!dirty || status === 'saving') return;
    const next = draft.trim();
    setStatus('saving');
    try {
      await updateNotes(uid, findId, next);
      setSaved(next);
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  };

  return (
    <View style={styles.root}>
      <TextField
        label="Your notes"
        icon="journal"
        placeholder="Where you found it, the weather, what was nearby…"
        value={draft}
        onChangeText={(v) => {
          setDraft(v);
          if (status !== 'saving') setStatus('idle');
        }}
        onBlur={save}
        multiline
        maxLength={NOTES_MAX}
        autoCapitalize="sentences"
      />
      <View style={styles.footer}>
        {status !== 'idle' ? (
          <Animated.View key={status} entering={transitions.fadeIn}>
            <Text
              variant="caption"
              color={status === 'error' ? 'danger' : 'inkFaint'}
              accessibilityLiveRegion="polite"
            >
              {STATUS_LABEL[status]}
            </Text>
          </Animated.View>
        ) : (
          <Text variant="caption">
            {draft.length}/{NOTES_MAX}
          </Text>
        )}
        {dirty && <TextButton title="Save" onPress={save} disabled={status === 'saving'} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.xxs,
  },
  footer: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
