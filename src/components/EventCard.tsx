import { ReactNode } from 'react';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius } from '@/constants/theme';
import { EventItem } from '@/types';
import { dayOfMonth, fmtPrice, fmtTime, monthLabel } from '@/utils/format';
import { StatusBadge } from './ui';

interface Props {
  event: EventItem;
  /** Mặc định mở trang chi tiết dùng chung. */
  href?: string;
  showStatus?: boolean;
  footer?: ReactNode;
}

export default function EventCard({ event, href, showStatus, footer }: Props) {
  const router = useRouter();
  const left = event.capacity - event.registeredCount;
  const full = left <= 0;

  return (
    <Pressable
      style={({ pressed }) => [s.card, pressed && { opacity: 0.9 }]}
      onPress={() => router.push((href ?? `/event/${event.id}`) as any)}
    >
      <View>
        <Image source={{ uri: event.image }} style={s.image} contentFit="cover" transition={150} />
        <View style={s.date}>
          <Text style={s.dateDay}>{dayOfMonth(event.startTime)}</Text>
          <Text style={s.dateMonth}>{monthLabel(event.startTime)}</Text>
        </View>
        {event.isFavorite && (
          <View style={s.fav}>
            <Text style={{ fontSize: 14 }}>❤️</Text>
          </View>
        )}
      </View>
      <View style={{ padding: 14, gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={s.category}>{event.categoryName}</Text>
          {event.status === 'ongoing' && <Text style={s.live}>● Đang diễn ra</Text>}
          {showStatus && <StatusBadge status={event.status} />}
        </View>
        <Text style={s.title} numberOfLines={2}>{event.title}</Text>
        <Text style={s.meta} numberOfLines={1}>🕒 {fmtTime(event.startTime)}   📍 {event.location}</Text>
        <View style={s.row}>
          <Text style={[s.price, event.price === 0 && { color: colors.success }]}>{fmtPrice(event.price)}</Text>
          <Text style={[s.meta, full && { color: colors.danger, fontWeight: '700' }]}>
            {full ? 'Hết chỗ' : `Còn ${left}/${event.capacity} chỗ`}
          </Text>
        </View>
        {footer}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: { width: '100%', height: 150, backgroundColor: colors.neutralSoft },
  date: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#fff',
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  dateDay: { fontSize: 18, fontWeight: '800', color: colors.text, lineHeight: 20 },
  dateMonth: { fontSize: 11, fontWeight: '700', color: colors.primary },
  fav: { position: 'absolute', top: 10, right: 10, backgroundColor: '#fff', borderRadius: 14, padding: 5 },
  category: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  live: { color: colors.info, fontWeight: '700', fontSize: 12 },
  title: { fontSize: 17, fontWeight: '800', color: colors.text },
  meta: { color: colors.muted, fontSize: 13 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  price: { fontSize: 15, fontWeight: '800', color: colors.accent },
});
