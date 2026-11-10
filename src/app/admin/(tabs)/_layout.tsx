import { Tabs } from 'expo-router';
import { tabIcon } from '@/components/TabIcon';
import { useTheme } from '@/hooks/useTheme';
import ScreenHeader from '@/components/ScreenHeader';

export default function AdminTabs() {
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
      <Tabs.Screen name="index" options={{ title: 'Tổng quan', tabBarIcon: tabIcon('📈') }} />
      <Tabs.Screen name="events" options={{ title: 'Kiểm duyệt sự kiện', tabBarLabel: 'Sự kiện', tabBarIcon: tabIcon('🎫') }} />
      <Tabs.Screen name="users" options={{ title: 'Người dùng', tabBarIcon: tabIcon('👥') }} />
      <Tabs.Screen name="reports" options={{ title: 'Báo cáo vi phạm', tabBarLabel: 'Báo cáo', tabBarIcon: tabIcon('🚩') }} />
      <Tabs.Screen name="more" options={{ title: 'Quản lý khác', tabBarLabel: 'Thêm', tabBarIcon: tabIcon('☰') }} />
    </Tabs>
  );
}
