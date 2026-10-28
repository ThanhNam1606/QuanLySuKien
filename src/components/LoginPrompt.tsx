import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';
import { Button } from './ui';

export default function LoginPrompt({ text = 'Đăng nhập để sử dụng tính năng này' }: { text?: string }) {
  const router = useRouter();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 14, backgroundColor: colors.bg }}>
      <Text style={{ fontSize: 17, fontWeight: '700', textAlign: 'center', color: colors.text }}>{text}</Text>
      <Button title="Đăng nhập" onPress={() => router.push('/(auth)/login' as any)} style={{ alignSelf: 'stretch' }} />
      <Button title="Tạo tài khoản" variant="outline" onPress={() => router.push('/(auth)/register' as any)} style={{ alignSelf: 'stretch' }} />
    </View>
  );
}
