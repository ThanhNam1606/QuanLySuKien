import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { EventApi } from '@/api/services';
import { useAuth } from '@/store/authStore';
import { fmtDateTime } from '@/utils/format';

/**
 * Nhắc lịch bằng thông báo hẹn giờ ngay trên máy (local notification), không cần server:
 * mỗi sự kiện đã đăng ký sẽ nhắc trước 1 ngày và trước 1 giờ.
 * Hệ điều hành giữ lịch hẹn nên vẫn nhắc khi đã đóng app.
 */
const CHANNEL = 'reminders';
const LEADS = [
  { key: '1d', ms: 24 * 3600 * 1000, text: 'Diễn ra vào ngày mai' },
  { key: '1h', ms: 3600 * 1000, text: 'Diễn ra sau 1 giờ nữa' },
];

// Cho phép hiện thông báo cả khi đang mở app.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    // Android 13+: phải tạo kênh thông báo trước khi xin quyền.
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Nhắc lịch sự kiện',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') ({ status } = await Notifications.requestPermissionsAsync());
  return status === 'granted';
}

/**
 * Đặt lại toàn bộ lịch nhắc theo danh sách đăng ký hiện tại của người dùng.
 * Gọi sau khi đăng ký/hủy đăng ký, đổi cài đặt "Nhắc lịch", đăng nhập hoặc đăng xuất.
 * Mọi lỗi đều được bỏ qua để không ảnh hưởng chức năng chính.
 */
export async function refreshReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const user = useAuth.getState().user;
    if (!user || user.role !== 'attendee' || !user.notifyReminder) return;

    const regs = await EventApi.myRegistrations();
    const now = Date.now();
    const jobs: { id: string; at: number; title: string; body: string; eventId: string }[] = [];

    for (const r of regs) {
      const e = r.event;
      if (!e || r.status !== 'registered' || r.checkedIn) continue;
      if (e.status === 'cancelled' || e.status === 'hidden' || e.status === 'rejected') continue;
      const start = new Date(e.startTime).getTime();
      for (const lead of LEADS) {
        const at = start - lead.ms;
        if (at <= now + 5000) continue; // đã quá giờ nhắc
        jobs.push({
          id: `${e.id}:${lead.key}`,
          at,
          title: e.title,
          body: `${lead.text} (${fmtDateTime(e.startTime)}) · ${e.location}`,
          eventId: e.id,
        });
      }
    }
    if (jobs.length === 0) return;
    if (!(await ensurePermission())) return;

    for (const j of jobs) {
      await Notifications.scheduleNotificationAsync({
        identifier: j.id,
        content: { title: j.title, body: j.body, data: { eventId: j.eventId } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(j.at), channelId: CHANNEL },
      });
    }
  } catch {
    // bỏ qua
  }
}

/** Bấm vào thông báo thì mở trang chi tiết sự kiện (kể cả khi app đang tắt). */
export function useReminderTap() {
  const router = useRouter();
  const response = Notifications.useLastNotificationResponse();
  useEffect(() => {
    if (!response || response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const id = response.notification.request.content.data?.eventId;
    if (typeof id !== 'string') return;
    const t = setTimeout(() => router.push(`/event/${id}` as any), 300);
    return () => clearTimeout(t);
  }, [response]);
}
