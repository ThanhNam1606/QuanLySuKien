import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';
import { refreshProfile } from '@/api/services';
import AdFooter from '@/components/AdFooter';
import { Loading } from '@/components/ui';
import { initAds } from '@/utils/ads';
import { colors } from '@/constants/theme';
import { useAuth } from '@/store/authStore';

export default function RootLayout() {
  const isLoading = useAuth((s) => s.isLoading);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    initAds();
  }, []);

  useEffect(() => {
    (async () => {
      await useAuth.getState().loadSession();
      // Đồng bộ lại hồ sơ; nếu token hết hạn, axios interceptor sẽ tự đăng xuất.
      if (useAuth.getState().user) refreshProfile().catch(() => {});
    })();
  }, []);

  if (isLoading) return <Loading />;

  // Chân trang quảng cáo nằm dưới cùng nên tự xử lý inset đáy; các màn hình con coi inset đáy = 0
  // để thanh tab / thanh nút không bị cách thêm một khoảng thừa phía trên banner.
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        <SafeAreaInsetsContext.Provider value={{ ...insets, bottom: 0 }}>
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
            <Stack.Screen name="page2" options={{ headerShown: true, title: 'Trang 2', headerBackTitle: 'Quay lại' }} />
          </Stack>
        </SafeAreaInsetsContext.Provider>
      </View>
      <AdFooter bottomInset={insets.bottom} />
    </View>
  );
}
