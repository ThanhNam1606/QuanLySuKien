import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { radius } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { EventItem } from '@/types';
import { fmtBadgeDate, fmtClock12 } from '@/utils/format';
import { AppText as Text } from './AppText';

/** Thẻ "Nổi bật": nền gradient theo màu chủ đạo, nhãn ngày ở góc trên trái, tên và giờ ở dưới. */
export default function FeaturedCard({ event, width = 280 }: { event: EventItem; width?: number }) {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => router.push(`/event/${event.id}` as any)}
      style={({ pressed }) => [{ width, height: 168, borderRadius: radius.xl, overflow: 'hidden' }, pressed && { opacity: 0.92 }]}
      accessibilityRole="button"
      accessibilityLabel={event.title}
    >
      <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      {!!event.image && <Image source={{ uri: event.image }} style={[StyleSheet.absoluteFill, { opacity: 0.28 }]} contentFit="cover" />}
      <View style={{ flex: 1, padding: 14, justifyContent: 'space-between' }}>
        <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5 }}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{fmtBadgeDate(event.startTime)}</Text>
        </View>
        <View style={{ gap: 2 }}>
          <Text style={{ color: '#fff', fontSize: 19, fontWeight: '800' }} numberOfLines={2}>{event.title}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>{fmtClock12(event.startTime)}</Text>
        </View>
      </View>
    </Pressable>
  );
}
