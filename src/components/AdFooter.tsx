import { useEffect, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AdBanner from '@/components/AdBanner';
import { Button } from '@/components/ui';
import { colors } from '@/constants/theme';
import { showInterstitial } from '@/utils/ads';

/** Chân trang dùng chung cho MỌI màn hình: nút chuyển trang 2 + Banner Ads. */
export default function AdFooter({ bottomInset }: { bottomInset?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [keyboard, setKeyboard] = useState(false);

  // Ẩn chân trang khi bàn phím mở để không che ô nhập liệu.
  useEffect(() => {
    const a = Keyboard.addListener('keyboardDidShow', () => setKeyboard(true));
    const b = Keyboard.addListener('keyboardDidHide', () => setKeyboard(false));
    return () => {
      a.remove();
      b.remove();
    };
  }, []);

  if (keyboard) return null;

  const onPage2 = pathname === '/page2';
  const go = () => showInterstitial(() => (onPage2 ? router.back() : router.push('/page2' as any)));

  return (
    <View style={{ backgroundColor: '#fff', borderTopWidth: 1, borderColor: colors.border, paddingBottom: bottomInset ?? insets.bottom }}>
      <View style={{ paddingHorizontal: 14, paddingTop: 8, paddingBottom: 6 }}>
        <Button title={onPage2 ? 'Quay lại trang 1' : 'Chuyển sang trang 2'} small onPress={go} />
      </View>
      <AdBanner />
    </View>
  );
}
