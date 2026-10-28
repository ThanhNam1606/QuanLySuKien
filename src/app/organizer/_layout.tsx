import { Redirect, Stack } from 'expo-router';
import { colors } from '@/constants/theme';
import { useAuth } from '@/store/authStore';

export default function OrganizerLayout() {
  const user = useAuth((s) => s.user);
  if (!user) return <Redirect href={'/(auth)/login' as any} />;
  if (user.role !== 'organizer') return <Redirect href={`/${user.role}` as any} />;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTintColor: colors.primaryDark,
        headerTitleStyle: { fontWeight: '700' },
        headerBackTitle: 'Quay lại',
      }}
    >
      <Stack.Screen name="event/[id]" options={{ headerShown: true, title: 'Quản lý sự kiện' }} />
      <Stack.Screen name="form" options={{ headerShown: true, title: 'Sự kiện' }} />
    </Stack>
  );
}
