import { useEffect, useRef, useState } from 'react';
import { Keyboard, Platform, View } from 'react-native';
import { usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AdBanner from '@/components/AdBanner';
import { colors } from '@/constants/theme';
import { showInterstitial } from '@/utils/ads';

/**
 * Chân trang quảng cáo dùng chung cho MỌI màn hình:
 * - Banner Ads ở cuối trang.
 * - Mỗi khi người dùng chuyển sang trang khác (đổi tab, mở chi tiết, quay lại...),
 *   hiện Interstitial Ads toàn màn hình, theo chu kỳ 3 phút (xem src/constants/ads.ts).
 */
export default function AdFooter({ bottomInset }: { bottomInset?: number }) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [keyboard, setKeyboard] = useState(false);
  const prevPath = useRef<string | null>(null);

  // Quảng cáo toàn màn hình khi đổi trang.
  useEffect(() => {
    const from = prevPath.current;
    prevPath.current = pathname;
    // Bỏ qua lần mở app đầu tiên và bước tự chuyển hướng từ '/' sang khu theo vai trò.
    if (from === null || from === '/') return;
    showInterstitial();
  }, [pathname]);

  // Ẩn banner khi bàn phím mở để không che ô nhập liệu.
  useEffect(() => {
    const a = Keyboard.addListener('keyboardDidShow', () => setKeyboard(true));
    const b = Keyboard.addListener('keyboardDidHide', () => setKeyboard(false));
    return () => {
      a.remove();
      b.remove();
    };
  }, []);

  if (Platform.OS === 'web' || keyboard) return null;

  return (
    <View style={{ backgroundColor: '#fff', borderTopWidth: 1, borderColor: colors.border, paddingBottom: bottomInset ?? insets.bottom }}>
      <AdBanner />
    </View>
  );
}
