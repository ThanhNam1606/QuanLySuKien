import { AppText as Text } from '@/components/AppText';
import { useState } from 'react';

import { Link, useRouter } from 'expo-router';
import { AuthApi } from '@/api/services';
import AuthShell from '@/components/AuthShell';
import { Button, Input } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/store/authStore';
import { useT } from '@/i18n';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const t = useT();
  const router = useRouter();
  const setSession = useAuth((s) => s.setSession);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name.trim() || !email.trim()) return setError(t('Nhập đầy đủ họ tên và email'));
    if (password.length < 6) return setError(t('Mật khẩu tối thiểu 6 ký tự'));
    if (password !== confirm) return setError(t('Mật khẩu nhập lại không khớp'));
    setError('');
    setLoading(true);
    try {
      const { user, token } = await AuthApi.register(name, email, password);
      await setSession(user, token);
      router.replace(`/${user.role}` as any);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell back title={t('Tạo tài khoản')} subtitle={t('Chỉ mất một phút để bắt đầu đăng ký sự kiện')}>
      <Input label={t('Họ và tên')} value={name} onChangeText={setName} placeholder={t('Nguyễn Văn A')} />
      <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="ten@email.com" />
      <Input label={t('Mật khẩu')} value={password} onChangeText={setPassword} secureTextEntry placeholder={t('Tối thiểu 6 ký tự')} />
      <Input label={t('Nhập lại mật khẩu')} value={confirm} onChangeText={setConfirm} secureTextEntry placeholder={t('Nhập lại mật khẩu')} />
      {!!error && <Text style={{ color: colors.danger }}>{error}</Text>}
      <Button title={t('Đăng ký')} onPress={onSubmit} loading={loading} />
      <Link replace href="/(auth)/login" style={{ color: colors.primary, fontWeight: '600', textAlign: 'center' }}>{t('Đã có tài khoản? Đăng nhập')}</Link>
    </AuthShell>
  );
}
