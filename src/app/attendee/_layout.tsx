import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/store/authStore';

export default function AttendeeLayout() {
  const user = useAuth((s) => s.user);
  // Khách (chưa đăng nhập) được xem sự kiện công khai; người có vai trò khác về đúng khu của mình.
  if (user && user.role !== 'attendee') return <Redirect href={`/${user.role}` as any} />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
