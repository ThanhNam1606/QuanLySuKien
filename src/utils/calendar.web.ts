import { Linking } from 'react-native';
import { EventItem } from '@/types';

type CalendarEvent = Pick<EventItem, 'title' | 'startTime' | 'endTime' | 'location' | 'description'>;

const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, '');

/** Web: mở Google Calendar với sự kiện đã điền sẵn. */
export async function addEventToCalendar(e: CalendarEvent): Promise<void> {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: `${stamp(e.startTime)}/${stamp(e.endTime)}`,
    details: e.description,
    location: e.location,
  });
  await Linking.openURL(`https://calendar.google.com/calendar/render?${params.toString()}`);
}
