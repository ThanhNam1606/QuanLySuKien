import { Redirect, Stack } from 'expo-router';
import { colors } from '@/constants/theme';
import { useAuth } from '@/store/authStore';

export default function AdminLayout() {
  const user = useAuth((s) => s.user);
  if (!user) return <Redirect href={'/(auth)/login' as any} />;
  if (user.role !== 'admin') return <Redirect href={`/${user.role}` as any} />;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTintColor: colors.primaryDark,
        headerTitleStyle: { fontWeight: '700' },
        headerBackTitle: 'Quay lại',
      }}
    >
      <Stack.Screen name="categories" options={{ headerShown: true, title: 'Danh mục sự kiện' }} />
      <Stack.Screen name="broadcast" options={{ headerShown: true, title: 'Thông báo hệ thống' }} />
      <Stack.Screen name="profile" options={{ headerShown: true, title: 'Tài khoản của tôi' }} />
    </Stack>
  );
}
