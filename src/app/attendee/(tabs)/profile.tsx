import LoginPrompt from '@/components/LoginPrompt';
import ProfileView from '@/components/ProfileView';
import { useAuth } from '@/store/authStore';
import { useT } from '@/i18n';

export default function Profile() {
  const t = useT();
  const user = useAuth((s) => s.user);
  if (!user) return <LoginPrompt text={t('Đăng nhập để xem và cập nhật hồ sơ')} />;
  return <ProfileView />;
}
