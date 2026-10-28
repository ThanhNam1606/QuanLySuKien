import LoginPrompt from '@/components/LoginPrompt';
import NotificationList from '@/components/NotificationList';
import { useAuth } from '@/store/authStore';

export default function Notifications() {
  const user = useAuth((s) => s.user);
  if (!user) return <LoginPrompt text="Đăng nhập để nhận thông báo về sự kiện" />;
  return <NotificationList />;
}
