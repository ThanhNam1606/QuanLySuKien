import { Tabs } from 'expo-router';
import { tabIcon } from '@/components/TabIcon';
import { colors } from '@/constants/theme';

export default function AdminTabs() {
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
      <Tabs.Screen name="index" options={{ title: 'Tổng quan', tabBarIcon: tabIcon('📈') }} />
      <Tabs.Screen name="events" options={{ title: 'Kiểm duyệt sự kiện', tabBarLabel: 'Sự kiện', tabBarIcon: tabIcon('🎫') }} />
      <Tabs.Screen name="users" options={{ title: 'Người dùng', tabBarIcon: tabIcon('👥') }} />
      <Tabs.Screen name="reports" options={{ title: 'Báo cáo vi phạm', tabBarLabel: 'Báo cáo', tabBarIcon: tabIcon('🚩') }} />
      <Tabs.Screen name="more" options={{ title: 'Quản lý khác', tabBarLabel: 'Thêm', tabBarIcon: tabIcon('☰') }} />
    </Tabs>
  );
}
