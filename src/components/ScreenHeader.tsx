import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { AppText as Text } from './AppText';

/**
 * Tiêu đề trang gọn thay cho thanh tiêu đề mặc định của tab:
 * không viền, không bóng, cùng màu nền với trang nên nhìn như không có thanh.
 */
export default function ScreenHeader({ title }: { title?: string }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
    <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 8, backgroundColor: colors.bg }}>
      <Text style={{ fontSize: 26, fontWeight: '800', color: colors.text }} numberOfLines={1}>{title}</Text>
    </View>
  );
}
