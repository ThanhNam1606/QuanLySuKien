import { Redirect, Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/store/authStore';
import { BACK_ICON } from '@/constants/icons';

export default function AdminLayout() {
  const { colors } = useTheme();
  const user = useAuth((s) => s.user);
  if (!user) return <Redirect href={'/(auth)/login' as any} />;
  if (user.role !== 'admin') return <Redirect href={`/${user.role}` as any} />;
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
      <Stack.Screen name="categories" options={{ headerShown: true, title: 'Danh mục sự kiện' }} />
      <Stack.Screen name="broadcast" options={{ headerShown: true, title: 'Thông báo hệ thống' }} />
      <Stack.Screen name="profile" options={{ headerShown: true, title: 'Tài khoản của tôi' }} />
    </Stack>
  );
}
