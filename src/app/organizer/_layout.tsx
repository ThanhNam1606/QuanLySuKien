import { Redirect, Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/store/authStore';
import { BACK_ICON } from '@/constants/icons';

export default function OrganizerLayout() {
  const { colors } = useTheme();
  const user = useAuth((s) => s.user);
  if (!user) return <Redirect href={'/(auth)/login' as any} />;
  if (user.role !== 'organizer') return <Redirect href={`/${user.role}` as any} />;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTintColor: colors.primaryDark,
        headerTitleStyle: { fontWeight: '700', color: colors.text },
        headerStyle: { backgroundColor: colors.card },
        contentStyle: { backgroundColor: colors.bg },
        headerBackTitle: 'Quay lại',
        headerBackImageSource: BACK_ICON,
      }}
    >
      <Stack.Screen name="event/[id]" options={{ headerShown: true, title: 'Quản lý sự kiện' }} />
      <Stack.Screen name="form" options={{ headerShown: true, title: 'Sự kiện' }} />
    </Stack>
  );
}
