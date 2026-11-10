import { useState } from 'react';
import { View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Link, useRouter } from 'expo-router';
import { AuthApi } from '@/api/services';
import AuthShell from '@/components/AuthShell';
import { Button, Chip, Input } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/store/authStore';
import { useT } from '@/i18n';

const DEMO = [
  { label: 'Người tham gia', email: 'an@test.com' },
  { label: 'Ban tổ chức', email: 'org@test.com' },
  { label: 'Admin', email: 'admin@test.com' },
];

export default function LoginScreen() {
  const { colors } = useTheme();
  const t = useT();
  const router = useRouter();
  const setSession = useAuth((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || !password) return setError(t('Nhập đầy đủ email và mật khẩu'));
    setError('');
    setLoading(true);
    try {
      const { user, token } = await AuthApi.login(email, password);
      await setSession(user, token);
      router.replace(`/${user.role}` as any);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell back title={t('Chào mừng trở lại')} subtitle={t('Đăng nhập để đăng ký sự kiện và quản lý lịch của bạn')}>
      <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="ten@email.com" />
      <Input label={t('Mật khẩu')} value={password} onChangeText={setPassword} secureTextEntry placeholder={t('Mật khẩu')} onSubmitEditing={onSubmit} />
      {!!error && <Text style={{ color: colors.danger }}>{error}</Text>}
      <Button title={t('Đăng nhập')} onPress={onSubmit} loading={loading} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Link href="/(auth)/forgot-password" style={{ color: colors.primary, fontWeight: '600' }}>{t('Quên mật khẩu?')}</Link>
        <Link replace href="/(auth)/register" style={{ color: colors.primary, fontWeight: '600' }}>{t('Tạo tài khoản')}</Link>
      </View>
      <Button title={t('Xem sự kiện không cần đăng nhập')} variant="ghost" onPress={() => router.replace('/attendee' as any)} />

      <View style={{ marginTop: 12, padding: 14, borderRadius: 12, backgroundColor: colors.primarySoft, gap: 10 }}>
        <Text style={{ fontWeight: '700', color: colors.primaryDark }}>{t('Tài khoản thử nghiệm (mật khẩu 123456)')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {DEMO.map((d) => (
            <Chip key={d.email} label={t(d.label)} onPress={() => { setEmail(d.email); setPassword('123456'); }} />
          ))}
        </View>
      </View>
    </AuthShell>
  );
}
