import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { FlatList, type ListRenderItem, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AccountButton } from '@/components/account/AccountButton';
import { FieldTipCard } from '@/components/home/FieldTipCard';
import { ScanHero } from '@/components/home/ScanHero';
import { useTabBarInset } from '@/components/navigation/TabBar';
import { FindTile, TILE_HEIGHT, TILE_WIDTH } from '@/components/specimen/FindTile';
import { EmptyState, Screen, Skeleton, Text, TextButton } from '@/components/ui';
import { useUser } from '@/hooks/useAuth';
import { useJournal } from '@/hooks/useJournal';
import { firstName, greeting, startOfWeek } from '@/lib/format';
import { countByKind } from '@/lib/stats';
import { type Find } from '@/lib/types';
import { enter, layout, radii, spacing, transitions } from '@/theme';

const RECENT = 8;

const openIdentify = () => router.push('/identify');
const openFinds = () => router.navigate('/journal');
const keyExtractor = (f: Find) => f.id;

function Gap() {
  return <View style={styles.gap} />;
}

export default function HomeScreen() {
  const bottomInset = useTabBarInset();
  const user = useUser();
  const name = firstName(user.displayName);
  const { status, finds } = useJournal();

  const counts = useMemo(() => countByKind(finds), [finds]);
  const thisWeek = useMemo(() => {
    const since = startOfWeek().getTime();
    return finds.filter((f) => f.seenAt.getTime() >= since).length;
  }, [finds]);
  const recent = useMemo(() => finds.slice(0, RECENT), [finds]);

  const openFind = useCallback(
    (id: string) => router.push({ pathname: '/specimen/[id]', params: { id } }),
    [],
  );
  const renderTile: ListRenderItem<Find> = useCallback(
    ({ item, index }) => <FindTile find={item} index={index} onPress={openFind} />,
    [openFind],
  );

  return (
    <Screen scroll contentStyle={[styles.content, { paddingBottom: bottomInset }]}>
      <Animated.View entering={enter(0)} style={styles.header}>
        <View style={styles.greeting}>
          <Text variant="label" color="inkMuted">
            {name ? `${greeting()}, ${name}` : greeting()}
          </Text>
          <Text variant="title" accessibilityRole="header">
            Ready to find something?
          </Text>
        </View>
        <AccountButton user={user} />
      </Animated.View>

      <Animated.View entering={enter(1)}>
        <ScanHero counts={counts} onScan={openIdentify} />
      </Animated.View>

      <Animated.View entering={enter(2)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text variant="section" accessibilityRole="header">
              Recent finds
            </Text>
            {thisWeek > 0 && <Text variant="caption">{thisWeek} this week</Text>}
          </View>
          {finds.length > 0 && <TextButton title="See all" onPress={openFinds} />}
        </View>

        {status === 'loading' ? (
          <View style={styles.skeletons}>
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} width={TILE_WIDTH} height={TILE_HEIGHT} radius={radii.card} />
            ))}
          </View>
        ) : recent.length === 0 ? (
          <EmptyState
            icon="camera"
            title="Your first find is waiting"
            message="Identify a rock, mineral or mushroom and save it here to start your collection."
            action={{ title: 'Identify a specimen', icon: 'camera', onPress: openIdentify }}
          />
        ) : (
          <Animated.View entering={transitions.fadeIn}>
            {/* Bleeds to the screen edges, so tiles scroll under the page padding. */}
            <FlatList
              horizontal
              data={recent}
              keyExtractor={keyExtractor}
              renderItem={renderTile}
              showsHorizontalScrollIndicator={false}
              style={styles.carousel}
              contentContainerStyle={styles.carouselContent}
              ItemSeparatorComponent={Gap}
              initialNumToRender={4}
            />
          </Animated.View>
        )}
      </Animated.View>

      <Animated.View entering={enter(3)}>
        <FieldTipCard />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  greeting: {
    flex: 1,
    gap: spacing.xxs,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skeletons: {
    flexDirection: 'row',
    gap: spacing.sm,
    overflow: 'hidden',
  },
  carousel: {
    marginHorizontal: -layout.screenPadding,
  },
  carouselContent: {
    paddingHorizontal: layout.screenPadding,
  },
  gap: {
    width: spacing.sm,
  },
});
