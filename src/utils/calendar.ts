import * as Calendar from 'expo-calendar/legacy';
import { EventItem } from '@/types';

type CalendarEvent = Pick<EventItem, 'title' | 'startTime' | 'endTime' | 'location' | 'description'>;

/**
 * Mở form "thêm sự kiện" của ứng dụng Lịch trên điện thoại, đã điền sẵn thông tin.
 * Người dùng tự bấm Lưu trong form của hệ thống, nên không cần xin quyền truy cập lịch.
 * Lỗi (ví dụ máy không có ứng dụng Lịch) sẽ được ném ra để nơi gọi hiện thông báo.
 */
export async function addEventToCalendar(e: CalendarEvent): Promise<void> {
  await Calendar.createEventInCalendarAsync({
    title: e.title,
    startDate: e.startTime,
    endDate: e.endTime,
    location: e.location,
    notes: e.description,
    alarms: [{ relativeOffset: -60 }], // nhắc trước 1 giờ
  });
}
