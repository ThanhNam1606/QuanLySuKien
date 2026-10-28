import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { EventApi } from '@/api/services';
import EventCard from '@/components/EventCard';
import LoginPrompt from '@/components/LoginPrompt';
import { Badge, Button, Chip, Empty, ErrorView, Loading } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/store/authStore';
import { EventItem } from '@/types';
import { fmtDate } from '@/utils/format';

type Tab = 'upcoming' | 'past' | 'favorites';

export default function Schedule() {
  const user = useAuth((s) => s.user);
  if (!user) return <LoginPrompt text="Đăng nhập để xem lịch và vé của bạn" />;
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
      style={{ backgroundColor: colors.bg }}
      data={data}
      keyExtractor={(e) => e.id}
      contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={regs.refreshing} onRefresh={() => { regs.refresh(); favs.reload(); }} />}
      ListHeaderComponent={
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Chip label={`Sắp tới (${upcoming.length})`} active={tab === 'upcoming'} onPress={() => setTab('upcoming')} />
            <Chip label={`Đã qua (${past.length})`} active={tab === 'past'} onPress={() => setTab('past')} />
            <Chip label={`Yêu thích (${favs.data?.length ?? 0})`} active={tab === 'favorites'} onPress={() => setTab('favorites')} />
          </View>
          {tab === 'upcoming' && conflicts.size > 0 && (
            <View style={{ backgroundColor: colors.warningSoft, padding: 12, borderRadius: 12 }}>
              <Text style={{ color: colors.warning, fontWeight: '700' }}>
                Có {conflicts.size} sự kiện bị trùng thời gian. Hãy kiểm tra các thẻ được đánh dấu bên dưới.
              </Text>
            </View>
          )}
        </View>
      }
      ListEmptyComponent={
        <Empty
          text={tab === 'favorites' ? 'Bạn chưa lưu sự kiện nào' : tab === 'past' ? 'Chưa có sự kiện đã qua' : 'Lịch của bạn đang trống'}
          hint={tab === 'favorites' ? 'Bấm "Lưu" trong trang chi tiết để giữ lại sự kiện yêu thích.' : 'Hãy khám phá và đăng ký sự kiện đầu tiên.'}
        />
      }
      renderItem={({ item }) => (
        <EventCard
          event={item}
          footer={
            tab !== 'favorites' ? (
              <View style={{ gap: 8, marginTop: 6 }}>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  {conflicts.has(item.id) && tab === 'upcoming' && <Badge label="⚠ Trùng giờ" color={colors.warning} bg={colors.warningSoft} />}
                  {item.myRegistration?.checkedIn && <Badge label="Đã điểm danh" color={colors.success} bg={colors.successSoft} />}
                  <Text style={{ color: colors.muted, fontSize: 12 }}>{fmtDate(item.startTime)}</Text>
                </View>
                <Button title="Xem vé điện tử" variant="soft" small onPress={() => router.push(`/ticket/${item.id}` as any)} />
              </View>
            ) : undefined
          }
        />
      )}
    />
  );
}
