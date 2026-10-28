import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { refreshProfile } from '@/api/services';
import { Loading } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useAuth } from '@/store/authStore';

export default function RootLayout() {
  const isLoading = useAuth((s) => s.isLoading);

  useEffect(() => {
    (async () => {
      await useAuth.getState().loadSession();
      // Đồng bộ lại hồ sơ; nếu token hết hạn, axios interceptor sẽ tự đăng xuất.
      if (useAuth.getState().user) refreshProfile().catch(() => {});
    })();
  }, []);

  if (isLoading) return <Loading />;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          headerTintColor: colors.primaryDark,
          headerTitleStyle: { fontWeight: '700' },
          headerStyle: { backgroundColor: '#fff' },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="event/[id]" options={{ headerShown: true, title: 'Chi tiết sự kiện', headerBackTitle: 'Quay lại' }} />
        <Stack.Screen name="ticket/[id]" options={{ headerShown: true, title: 'Vé điện tử', headerBackTitle: 'Quay lại' }} />
      </Stack>
    </>
  );
}
