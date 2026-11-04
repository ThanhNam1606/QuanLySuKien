import { Tabs } from 'expo-router';
import { tabIcon } from '@/components/TabIcon';
import { colors } from '@/constants/theme';
import { useT } from '@/i18n';
import { languageHeaderRight } from '@/components/LanguageSwitch';

export default function AttendeeTabs() {
  const t = useT();
  return (
    <Tabs
      screenOptions={{
        headerRight: languageHeaderRight,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { fontWeight: '800', color: colors.text },
        tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('Khám phá'), tabBarIcon: tabIcon('🧭') }} />
      <Tabs.Screen name="search" options={{ title: t('Tìm kiếm'), tabBarIcon: tabIcon('🔍') }} />
      <Tabs.Screen name="schedule" options={{ title: t('Lịch của tôi'), tabBarIcon: tabIcon('📅') }} />
      <Tabs.Screen name="notifications" options={{ title: t('Thông báo'), tabBarIcon: tabIcon('🔔') }} />
      <Tabs.Screen name="profile" options={{ title: t('Cá nhân'), tabBarIcon: tabIcon('👤') }} />
    </Tabs>
  );
}
