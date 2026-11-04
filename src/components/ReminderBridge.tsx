import { useEffect } from 'react';
import { useAuth } from '@/store/authStore';
import { refreshReminders, useReminderTap } from '@/utils/reminders';

/** Không hiển thị gì: đồng bộ lịch nhắc khi đổi tài khoản và xử lý khi người dùng bấm vào thông báo. */
export default function ReminderBridge() {
  const userId = useAuth((s) => s.user?.id);
  useEffect(() => {
    refreshReminders();
  }, [userId]);
  useReminderTap();
  return null;
}
