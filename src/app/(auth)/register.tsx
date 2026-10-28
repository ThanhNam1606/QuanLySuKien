import { useState } from 'react';
import { Text } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { AuthApi } from '@/api/services';
import AuthShell from '@/components/AuthShell';
import { Button, Input } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useAuth } from '@/store/authStore';

export default function RegisterScreen() {
  const router = useRouter();
  const setSession = useAuth((s) => s.setSession);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name.trim() || !email.trim()) return setError('Nhập đầy đủ họ tên và email');
    if (password.length < 6) return setError('Mật khẩu tối thiểu 6 ký tự');
    if (password !== confirm) return setError('Mật khẩu nhập lại không khớp');
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
    <AuthShell title="Tạo tài khoản" subtitle="Chỉ mất một phút để bắt đầu đăng ký sự kiện">
      <Input label="Họ và tên" value={name} onChangeText={setName} placeholder="Nguyễn Văn A" />
      <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="ten@email.com" />
      <Input label="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry placeholder="Tối thiểu 6 ký tự" />
      <Input label="Nhập lại mật khẩu" value={confirm} onChangeText={setConfirm} secureTextEntry placeholder="Nhập lại mật khẩu" />
      {!!error && <Text style={{ color: colors.danger }}>{error}</Text>}
      <Button title="Đăng ký" onPress={onSubmit} loading={loading} />
      <Link href="/(auth)/login" style={{ color: colors.primary, fontWeight: '600', textAlign: 'center' }}>Đã có tài khoản? Đăng nhập</Link>
    </AuthShell>
  );
}
