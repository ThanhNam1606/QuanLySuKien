import LoginPrompt from '@/components/LoginPrompt';
import NotificationList from '@/components/NotificationList';
import { useAuth } from '@/store/authStore';
import { useT } from '@/i18n';

export default function Notifications() {
  const t = useT();
  const user = useAuth((s) => s.user);
  if (!user) return <LoginPrompt text={t('Đăng nhập để nhận thông báo về sự kiện')} />;
  return <NotificationList />;
}
