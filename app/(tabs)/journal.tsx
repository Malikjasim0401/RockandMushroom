import { router } from 'expo-router';
import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { FlatList, type ListRenderItem, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { FindCard } from '@/components/specimen/FindCard';
import { useTabBarInset } from '@/components/navigation/TabBar';
import {
  EmptyState,
  Screen,
  SegmentedControl,
  type SegmentOption,
  Skeleton,
  Text,
  TextField,
} from '@/components/ui';
import { filterFinds, type KindFilter, useJournal } from '@/hooks/useJournal';
import { type Find } from '@/lib/types';
import { enter, layout, radii, spacing } from '@/theme';

const openIdentify = () => router.push('/identify');
const keyExtractor = (f: Find) => f.id;

const FILTERS: readonly SegmentOption<KindFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'rock', label: 'Rocks' },
  { value: 'mineral', label: 'Minerals' },
  { value: 'mushroom', label: 'Mushrooms' },
];

const KIND_PLURAL = { rock: 'rocks', mineral: 'minerals', mushroom: 'mushrooms' } as const;

export default function FindsScreen() {
  const bottomInset = useTabBarInset();
  const { status, finds } = useJournal();
  const [search, setSearch] = useState('');
  // Typing stays responsive; filtering follows at lower priority.
  const deferredSearch = useDeferredValue(search);
  const [kind, setKind] = useState<KindFilter>('all');
  const results = useMemo(
    () => filterFinds(finds, deferredSearch, kind),
    [finds, deferredSearch, kind],
  );

  const openFind = useCallback(
    (id: string) => router.push({ pathname: '/specimen/[id]', params: { id } }),
    [],
  );

  const renderItem: ListRenderItem<Find> = useCallback(
    ({ item, index }) => <FindCard find={item} index={index} onPress={openFind} />,
    [openFind],
  );

  const count = finds.length;
  const header = (
    <View style={styles.header}>
      <Animated.View entering={enter(0)} style={styles.titleRow}>
        <Text variant="title" accessibilityRole="header">
          My finds
        </Text>
        {count > 0 && (
          <Text variant="caption">
            {count} {count === 1 ? 'find' : 'finds'}
          </Text>
        )}
      </Animated.View>
      {count > 0 && (
        <Animated.View entering={enter(1)}>
          <TextField
            label="Search your finds"
            icon="search"
            placeholder="Name, scientific name or kind"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onClear={() => setSearch('')}
          />
        </Animated.View>
      )}
      {count > 0 && (
        <Animated.View entering={enter(2)}>
          <SegmentedControl
            options={FILTERS}
            value={kind}
            onChange={setKind}
            accessibilityLabel="Filter finds by kind"
          />
        </Animated.View>
      )}
    </View>
  );

  const empty =
    status === 'loading' ? (
      <View style={styles.skeletons}>
        {Array.from({ length: 4 }, (_, i) => (
          <View key={i} style={styles.skeletonCell}>
            <Skeleton height={220} radius={radii.card} />
          </View>
        ))}
      </View>
    ) : status === 'error' ? (
      <EmptyState
        icon="offline"
        title="Couldn't load your finds"
        message="Check your connection. Your finds will appear as soon as you're back online."
      />
    ) : count === 0 ? (
      <EmptyState
        icon="journal"
        title="No finds yet"
        message="Rocks, minerals and mushrooms you identify and add will live here."
        action={{ title: 'Identify a specimen', icon: 'camera', onPress: openIdentify }}
      />
    ) : (
      <EmptyState
        icon="search"
        title="No matches"
        message={
          search.trim()
            ? `Nothing in your finds matches "${search.trim()}".`
            : `You haven't found any ${kind === 'all' ? 'specimens' : KIND_PLURAL[kind]} yet.`
        }
      />
    );

  return (
    <Screen contentStyle={styles.screen}>
      <FlatList
        data={results}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.columns}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        contentContainerStyle={[styles.list, { paddingBottom: bottomInset }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        windowSize={7}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
  },
  list: {
    paddingHorizontal: layout.screenPadding,
    gap: spacing.sm,
  },
  // FindCard pads each cell by half the gap; pull the row out by the same amount.
  columns: {
    marginHorizontal: -spacing.sm / 2,
  },
  header: {
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  skeletons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
  },
  skeletonCell: {
    width: '48.5%',
  },
});
