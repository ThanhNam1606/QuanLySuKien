import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/store/authStore';

export default function AuthLayout() {
  const user = useAuth((s) => s.user);
  if (user) return <Redirect href={`/${user.role}` as any} />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
