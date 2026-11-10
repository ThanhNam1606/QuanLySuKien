import { Tabs } from 'expo-router';
import { tabIcon } from '@/components/TabIcon';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import ScreenHeader from '@/components/ScreenHeader';

export default function AttendeeTabs() {
  const { colors } = useTheme();
  const t = useT();
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
      <Tabs.Screen name="index" options={{ title: t('Khám phá'), headerShown: false, tabBarIcon: tabIcon('🧭') }} />
      <Tabs.Screen name="search" options={{ title: t('Tìm kiếm'), tabBarIcon: tabIcon('🔍') }} />
      <Tabs.Screen name="schedule" options={{ title: t('Lịch của tôi'), tabBarIcon: tabIcon('📅') }} />
      <Tabs.Screen name="notifications" options={{ title: t('Thông báo'), tabBarIcon: tabIcon('🔔') }} />
      <Tabs.Screen name="profile" options={{ title: t('Cá nhân'), tabBarIcon: tabIcon('👤') }} />
    </Tabs>
  );
}
