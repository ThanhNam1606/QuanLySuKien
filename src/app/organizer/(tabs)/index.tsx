import { useState } from 'react';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OrganizerApi } from '@/api/services';
import EventCard from '@/components/EventCard';
import { Button, Chip, Empty, ErrorView, Loading } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { EventStatus } from '@/types';

const FILTERS: { label: string; match?: EventStatus[] }[] = [
  { label: 'Tất cả' },
  { label: 'Bản nháp', match: ['draft'] },
  { label: 'Chờ duyệt', match: ['pending'] },
  { label: 'Đã duyệt', match: ['approved', 'ongoing'] },
  { label: 'Bị từ chối', match: ['rejected'] },
  { label: 'Đã kết thúc', match: ['ended', 'cancelled', 'hidden'] },
];

export default function MyEvents() {
  const router = useRouter();
  const [filter, setFilter] = useState(0);
  const { data, loading, error, refreshing, refresh, retry } = useApi(OrganizerApi.events, []);

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={retry} />;

  const match = FILTERS[filter].match;
  const list = (data ?? []).filter((e) => !match || match.includes(e.status));

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      data={list}
      keyExtractor={(e) => e.id}
      contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      ListHeaderComponent={
        <View style={{ gap: 12 }}>
          <Button title="+ Tạo sự kiện mới" onPress={() => router.push('/organizer/form' as any)} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {FILTERS.map((f, i) => (
              <Chip key={f.label} label={f.label} active={filter === i} onPress={() => setFilter(i)} />
            ))}
          </ScrollView>
        </View>
      }
      ListEmptyComponent={<Empty text="Chưa có sự kiện nào" hint="Bấm “Tạo sự kiện mới” để bắt đầu." />}
      renderItem={({ item }) => <EventCard event={item} showStatus href={`/organizer/event/${item.id}`} />}
    />
  );
}
