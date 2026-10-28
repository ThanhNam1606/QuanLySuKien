import LoginPrompt from '@/components/LoginPrompt';
import ProfileView from '@/components/ProfileView';
import { useAuth } from '@/store/authStore';

export default function Profile() {
  const user = useAuth((s) => s.user);
  if (!user) return <LoginPrompt text="Đăng nhập để xem và cập nhật hồ sơ" />;
  return <ProfileView />;
}
