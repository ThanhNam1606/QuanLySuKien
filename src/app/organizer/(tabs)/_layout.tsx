import { Tabs } from 'expo-router';
import { tabIcon } from '@/components/TabIcon';
import { useTheme } from '@/hooks/useTheme';
import ScreenHeader from '@/components/ScreenHeader';

export default function OrganizerTabs() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        header: ({ options }) => <ScreenHeader title={options.title} />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Sự kiện của tôi', tabBarLabel: 'Sự kiện', tabBarIcon: tabIcon('🎫') }} />
      <Tabs.Screen name="scan" options={{ title: 'Điểm danh', tabBarLabel: 'Quét QR', tabBarIcon: tabIcon('📷') }} />
      <Tabs.Screen name="stats" options={{ title: 'Thống kê', tabBarIcon: tabIcon('📊') }} />
      <Tabs.Screen name="notifications" options={{ title: 'Thông báo', tabBarIcon: tabIcon('🔔') }} />
      <Tabs.Screen name="profile" options={{ title: 'Hồ sơ tổ chức', tabBarLabel: 'Cá nhân', tabBarIcon: tabIcon('👤') }} />
    </Tabs>
  );
}
