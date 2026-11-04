import { useState } from 'react';
import { Text } from 'react-native';
import { Link } from 'expo-router';
import { AuthApi } from '@/api/services';
import AuthShell from '@/components/AuthShell';
import { Button, Input } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useT } from '@/i18n';

export default function ForgotPasswordScreen() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const r = await AuthApi.forgotPassword(email.trim());
      setMessage(r.message);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title={t('Khôi phục mật khẩu')} subtitle={t('Nhập email đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu')}>
      <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="ten@email.com" />
      {!!error && <Text style={{ color: colors.danger }}>{error}</Text>}
      {!!message && <Text style={{ color: colors.success }}>{message}</Text>}
      <Button title={t('Gửi hướng dẫn')} onPress={onSubmit} loading={loading} />
      <Link href="/(auth)/login" style={{ color: colors.primary, fontWeight: '600', textAlign: 'center' }}>{t('Quay lại đăng nhập')}</Link>
    </AuthShell>
  );
}
