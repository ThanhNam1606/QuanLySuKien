import { Image, Pressable } from 'react-native';
import { colors } from '@/constants/theme';
import { BACK_ICON } from '@/constants/icons';
import { useT } from '@/i18n';

/** Nút quay lại tròn dùng mũi tên chung của ứng dụng. */
export default function BackButton({ onPress }: { onPress: () => void }) {
  const t = useT();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('Quay lại')}
      hitSlop={8}
      style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border }}
    >
      <Image source={BACK_ICON} style={{ width: 20, height: 20 }} resizeMode="contain" />
    </Pressable>
  );
}
