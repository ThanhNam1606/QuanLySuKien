import { ReactNode, useMemo } from 'react';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, radius } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { EventItem } from '@/types';
import { dayOfMonth, fmtEventLine, fmtPrice, fmtTime, monthLabel, cityOf } from '@/utils/format';
import { AppText as Text } from './AppText';
import { StatusBadge } from './ui';
import { useT } from '@/i18n';

export type EventCardVariant = 'list' | 'grid' | 'poster';

interface Props {
  event: EventItem;
  /** Mặc định mở trang chi tiết dùng chung. */
  href?: string;
  showStatus?: boolean;
  footer?: ReactNode;
  /** list (mặc định) | grid (2 cột, dùng với numColumns={2}) | poster (ảnh lớn phủ chữ). */
  variant?: EventCardVariant;
}

export default function EventCard({ event, href, showStatus, footer, variant = 'list' }: Props) {
  const t = useT();
  const router = useRouter();
  const { colors, fs } = useTheme();
  const s = useMemo(() => makeStyles(colors, fs), [colors, fs]);
  const left = event.capacity - event.registeredCount;
  const full = left <= 0;
  const open = () => router.push((href ?? `/event/${event.id}`) as any);
  const priceText = fmtPrice(event.price);
  const priceColor = event.price === 0 ? colors.success : colors.accent;

  if (variant === 'poster') {
    return (
      <Pressable style={({ pressed }) => [s.poster, pressed && { opacity: 0.92 }]} onPress={open}>
        <Image source={{ uri: event.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
        <LinearGradient colors={['transparent', 'rgba(20,12,40,0.88)']} style={StyleSheet.absoluteFill} />
        <View style={s.posterDate}>
          <Text style={s.dateDay}>{dayOfMonth(event.startTime)}</Text>
          <Text style={s.dateMonth}>{monthLabel(event.startTime)}</Text>
        </View>
        {event.isFavorite && (
          <View style={s.fav}>
            <Text style={{ fontSize: 14 }}>❤️</Text>
          </View>
        )}
        <View style={s.posterBody}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            {showStatus && <StatusBadge status={event.status} />}
            {event.status === 'ongoing' && <Text style={s.posterLive}>{t('● Đang diễn ra')}</Text>}
          </View>
          <Text style={s.posterTitle} numberOfLines={2}>{event.title}</Text>
          <View style={s.row}>
            <Text style={s.posterMeta} numberOfLines={1}>{fmtTime(event.startTime)} · {cityOf(event.location)}</Text>
            <Text style={s.posterPrice}>{priceText}</Text>
          </View>
          {footer}
        </View>
      </Pressable>
    );
  }

  if (variant === 'grid') {
    return (
      <Pressable style={({ pressed }) => [s.grid, pressed && { opacity: 0.9 }]} onPress={open}>
        <Image source={{ uri: event.image }} style={s.gridImage} contentFit="cover" transition={150} />
        <View style={{ padding: 10, gap: 4, flex: 1 }}>
          <Text style={s.gridTitle} numberOfLines={2}>{event.title}</Text>
          <Text style={s.meta} numberOfLines={1}>{`${dayOfMonth(event.startTime)}/${monthLabel(event.startTime)} · ${cityOf(event.location)}`}</Text>
          <View style={{ flex: 1 }} />
          <Text style={[s.price, { color: priceColor }]}>{priceText}</Text>
          {showStatus && <StatusBadge status={event.status} />}
          {footer}
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable style={({ pressed }) => [s.list, pressed && { opacity: 0.9 }]} onPress={open}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Image source={{ uri: event.image }} style={s.listImage} contentFit="cover" transition={150} />
        <View style={{ flex: 1, gap: 3, justifyContent: 'center' }}>
          <Text style={s.title} numberOfLines={2}>{event.title}</Text>
          <Text style={s.meta} numberOfLines={1}>{fmtEventLine(event.startTime, event.location)}</Text>
          <View style={s.row}>
            <Text style={[s.price, { color: priceColor }]}>{priceText}</Text>
            <Text style={[s.meta, full && { color: colors.danger, fontWeight: '700' }]}>
              {full ? t('Hết chỗ') : event.isFavorite ? '❤️' : ''}
            </Text>
          </View>
          {(showStatus || event.status === 'ongoing') && (
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              {event.status === 'ongoing' && <Text style={s.live}>{t('● Đang diễn ra')}</Text>}
              {showStatus && <StatusBadge status={event.status} />}
            </View>
          )}
        </View>
      </View>
      {footer}
    </Pressable>
  );
}

const makeStyles = (colors: Colors, fs: (n: number) => number) =>
  StyleSheet.create({
    list: {
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      padding: 10,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    listImage: { width: 88, height: 88, borderRadius: radius.lg, backgroundColor: colors.neutralSoft },
    grid: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    gridImage: { width: '100%', height: 110, backgroundColor: colors.neutralSoft },
    gridTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
    poster: { height: 240, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.neutralSoft, justifyContent: 'flex-end' },
    posterDate: {
      position: 'absolute', top: 12, left: 12, backgroundColor: colors.floatBtn,
      borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center',
    },
    posterBody: { padding: 14, gap: 6 },
    posterTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
    posterMeta: { fontSize: 13, color: 'rgba(255,255,255,0.85)', flex: 1 },
    posterPrice: { fontSize: 15, fontWeight: '800', color: '#fff' },
    posterLive: { color: '#fff', fontWeight: '700', fontSize: 12 },
    dateDay: { fontSize: 18, fontWeight: '800', color: colors.floatBtnFg, lineHeight: 20 },
    dateMonth: { fontSize: 11, fontWeight: '700', color: colors.primary },
    fav: { position: 'absolute', top: 12, right: 12, backgroundColor: colors.floatBtn, borderRadius: 14, padding: 5 },
    live: { color: colors.info, fontWeight: '700', fontSize: 12 },
    title: { fontSize: 16, fontWeight: '800', color: colors.text },
    meta: { color: colors.muted, fontSize: 13 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
    price: { fontSize: 15, fontWeight: '800' },
  });
