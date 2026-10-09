import { Tabs } from 'expo-router/js-tabs';
import { useReducedMotion } from 'react-native-reanimated';

import { TabBar } from '@/components/navigation/TabBar';
import { colors } from '@/theme';

const renderTabBar = (props: Parameters<typeof TabBar>[0]) => <TabBar {...props} />;

export default function TabsLayout() {
  const reduceMotion = useReducedMotion();
  return (
    <Tabs
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bgTop },
        // Soft cross-fade between Home and Finds; instant under Reduce Motion.
        animation: reduceMotion ? 'none' : 'fade',
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="journal" />
    </Tabs>
  );
}
