import { View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Button } from './ui';
import { useT } from '@/i18n';

export default function LoginPrompt({ text }: { text?: string }) {
  const { colors } = useTheme();
  const t = useT();
  const message = text ?? t('Đăng nhập để sử dụng tính năng này');
  const router = useRouter();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 14, backgroundColor: colors.bg }}>
      <Text style={{ fontSize: 17, fontWeight: '700', textAlign: 'center', color: colors.text }}>{message}</Text>
      <Button title={t('Đăng nhập')} onPress={() => router.push('/(auth)/login' as any)} style={{ alignSelf: 'stretch' }} />
      <Button title={t('Tạo tài khoản')} variant="outline" onPress={() => router.push('/(auth)/register' as any)} style={{ alignSelf: 'stretch' }} />
    </View>
  );
}
