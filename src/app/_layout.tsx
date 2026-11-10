import { useEffect } from 'react';
import { Appearance, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';
import { refreshProfile } from '@/api/services';
import AdFooter from '@/components/AdFooter';
import ReminderBridge from '@/components/ReminderBridge';
import { Loading } from '@/components/ui';
import { initAds } from '@/utils/ads';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/store/authStore';
import { useLang, useT } from '@/i18n';
import { useThemeStore } from '@/store/themeStore';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts as useInter } from '@expo-google-fonts/inter';
import { PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans';
import { BACK_ICON } from '@/constants/icons';

export default function RootLayout() {
  const t = useT();
  const isLoading = useAuth((s) => s.isLoading);
  const insets = useSafeAreaInsets();
  const { colors, scheme, isDark, mode } = useTheme();
  const themeLoaded = useThemeStore((s) => s.loaded);
  const [fontsLoaded, fontError] = useInter({
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold,
    PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold,
  });

  // Đồng bộ chế độ sáng/tối với hệ thống để hộp thoại, bàn phím... cũng đổi theo.
  useEffect(() => {
    Appearance.setColorScheme(mode === 'system' ? 'unspecified' : scheme);
  }, [mode, scheme]);

  useEffect(() => {
    initAds();
  }, []);

  useEffect(() => {
    (async () => {
      await Promise.all([useLang.getState().load(), useThemeStore.getState().load()]);
      await useAuth.getState().loadSession();
      // Đồng bộ lại hồ sơ; nếu token hết hạn, axios interceptor sẽ tự đăng xuất.
      if (useAuth.getState().user) refreshProfile().catch(() => {});
    })();
  }, []);

  if (isLoading || !themeLoaded || (!fontsLoaded && !fontError)) return <Loading />;

  // Chân trang quảng cáo nằm dưới cùng nên tự xử lý inset đáy; các màn hình con coi inset đáy = 0
  // để thanh tab / thanh nút không bị cách thêm một khoảng thừa phía trên banner.
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={{ flex: 1 }}>
        <SafeAreaInsetsContext.Provider value={{ ...insets, bottom: 0 }}>
          <Stack
            screenOptions={{
              headerShown: false,
              headerBackImageSource: BACK_ICON,
              headerTintColor: colors.primaryDark,
              headerTitleStyle: { fontWeight: '700' },
              headerStyle: { backgroundColor: colors.card },
              contentStyle: { backgroundColor: colors.bg },
            }}
          >
            {/* Màn chi tiết tự vẽ phần đầu (nút tròn đè lên gradient) nên ẩn header của stack. */}
            <Stack.Screen name="event/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="ticket/[id]" options={{ headerShown: true, title: t('Vé điện tử'), headerBackTitle: t('Quay lại') }} />
          </Stack>
        </SafeAreaInsetsContext.Provider>
      </View>
      <ReminderBridge />
      <AdFooter bottomInset={insets.bottom} />
    </View>
  );
}
