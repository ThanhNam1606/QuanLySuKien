import { Tabs } from 'expo-router';
import { tabIcon } from '@/components/TabIcon';
import { colors } from '@/constants/theme';

export default function AttendeeTabs() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { fontWeight: '800', color: colors.text },
        tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Khám phá', tabBarIcon: tabIcon('🧭') }} />
      <Tabs.Screen name="search" options={{ title: 'Tìm kiếm', tabBarIcon: tabIcon('🔍') }} />
      <Tabs.Screen name="schedule" options={{ title: 'Lịch của tôi', tabBarIcon: tabIcon('📅') }} />
      <Tabs.Screen name="notifications" options={{ title: 'Thông báo', tabBarIcon: tabIcon('🔔') }} />
      <Tabs.Screen name="profile" options={{ title: 'Cá nhân', tabBarIcon: tabIcon('👤') }} />
    </Tabs>
  );
}
