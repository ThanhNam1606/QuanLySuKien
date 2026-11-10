import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { useRouter } from 'expo-router';
import { EventApi } from '@/api/services';
import EventCard from '@/components/EventCard';
import LoginPrompt from '@/components/LoginPrompt';
import { Badge, Button, Chip, Empty, ErrorView, Loading } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/store/authStore';
import { EventItem } from '@/types';
import { fmtDate } from '@/utils/format';
import { useT } from '@/i18n';

type Tab = 'upcoming' | 'past' | 'favorites';

export default function Schedule() {
  const t = useT();
  const user = useAuth((s) => s.user);
  if (!user) return <LoginPrompt text={t('Đăng nhập để xem lịch và vé của bạn')} />;
  return <ScheduleContent />;
}

/** Tìm các sự kiện bị trùng thời gian với sự kiện khác trong danh sách. */
function findConflicts(events: EventItem[]) {
  const ids = new Set<string>();
  const sorted = [...events].sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime));
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      if (+new Date(sorted[j].startTime) < +new Date(sorted[i].endTime)) {
        ids.add(sorted[i].id);
        ids.add(sorted[j].id);
      }
    }
  }
  return ids;
}

function ScheduleContent() {
  const t = useT();
  const { colors, cardStyle } = useTheme();
  const grid = cardStyle === 'grid';
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('upcoming');
  const regs = useApi(EventApi.myRegistrations, []);
  const favs = useApi(EventApi.myFavorites, []);

  const upcoming = useMemo(() => (regs.data ?? []).map((r) => r.event!).filter((e) => e.status !== 'ended'), [regs.data]);
  const past = useMemo(() => (regs.data ?? []).map((r) => r.event!).filter((e) => e.status === 'ended').reverse(), [regs.data]);
  const conflicts = useMemo(() => findConflicts(upcoming), [upcoming]);

  if (regs.loading || favs.loading) return <Loading />;
  if (regs.error) return <ErrorView message={regs.error} onRetry={regs.retry} />;

  const data = tab === 'upcoming' ? upcoming : tab === 'past' ? past : favs.data ?? [];

  return (
    <FlatList
      key={grid ? 'grid' : 'single'}
      numColumns={grid ? 2 : 1}
      columnWrapperStyle={grid ? { gap: 12 } : undefined}
      style={{ backgroundColor: colors.bg }}
      data={data}
      keyExtractor={(e) => e.id}
      contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={regs.refreshing} onRefresh={() => { regs.refresh(); favs.reload(); }} />}
      ListHeaderComponent={
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Chip label={t('Sắp tới ({n})', { n: upcoming.length })} active={tab === 'upcoming'} onPress={() => setTab('upcoming')} />
            <Chip label={t('Đã qua ({n})', { n: past.length })} active={tab === 'past'} onPress={() => setTab('past')} />
            <Chip label={t('Yêu thích ({n})', { n: favs.data?.length ?? 0 })} active={tab === 'favorites'} onPress={() => setTab('favorites')} />
          </View>
          {tab === 'upcoming' && conflicts.size > 0 && (
            <View style={{ backgroundColor: colors.warningSoft, padding: 12, borderRadius: 12 }}>
              <Text style={{ color: colors.warning, fontWeight: '700' }}>
                {t('Có {n} sự kiện bị trùng thời gian. Hãy kiểm tra các thẻ được đánh dấu bên dưới.', { n: conflicts.size })}
              </Text>
            </View>
          )}
        </View>
      }
      ListEmptyComponent={
        <Empty
          text={tab === 'favorites' ? t('Bạn chưa lưu sự kiện nào') : tab === 'past' ? t('Chưa có sự kiện đã qua') : t('Lịch của bạn đang trống')}
          hint={tab === 'favorites' ? t('Bấm "Lưu" trong trang chi tiết để giữ lại sự kiện yêu thích.') : t('Hãy khám phá và đăng ký sự kiện đầu tiên.')}
        />
      }
      renderItem={({ item }) => (
        <EventCard
          event={item}
          variant={cardStyle}
          footer={
            tab !== 'favorites' ? (
              <View style={{ gap: 8, marginTop: 6 }}>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  {conflicts.has(item.id) && tab === 'upcoming' && <Badge label={t('⚠ Trùng giờ')} color={colors.warning} bg={colors.warningSoft} />}
                  {item.myRegistration?.checkedIn && <Badge label={t('Đã điểm danh')} color={colors.success} bg={colors.successSoft} />}
                  <Text style={{ color: colors.muted, fontSize: 12 }}>{fmtDate(item.startTime)}</Text>
                </View>
                <Button title={t('Xem vé điện tử')} variant="soft" small onPress={() => router.push(`/ticket/${item.id}` as any)} />
              </View>
            ) : undefined
          }
        />
      )}
    />
  );
}
