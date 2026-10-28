import { useState } from 'react';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { AdminApi } from '@/api/services';
import EventCard from '@/components/EventCard';
import { Button, Chip, Empty, ErrorView, Input, Loading, PromptModal } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { useDebounced } from '@/hooks/useDebounced';
import { EventItem } from '@/types';
import { confirmAction, showMessage } from '@/utils/dialog';

const FILTERS = [
  { label: 'Tất cả', value: undefined },
  { label: 'Chờ duyệt', value: 'pending' },
  { label: 'Đã duyệt', value: 'approved' },
  { label: 'Đang diễn ra', value: 'ongoing' },
  { label: 'Bị từ chối', value: 'rejected' },
  { label: 'Đã ẩn', value: 'hidden' },
  { label: 'Đã kết thúc', value: 'ended' },
];

export default function AdminEvents() {
  const [status, setStatus] = useState<string | undefined>('pending');
  const [q, setQ] = useState('');
  const dq = useDebounced(q);
  const [rejecting, setRejecting] = useState<EventItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { data, loading, error, refreshing, refresh, retry, reload } = useApi(
    () => AdminApi.events({ status, q: dq.trim() || undefined }),
    [status, dq],
  );

  const act = async (id: string, fn: () => Promise<unknown>) => {
    setBusyId(id);
    try {
      await fn();
      reload();
    } catch (e: any) {
      showMessage('Không thực hiện được', e.message);
    } finally {
      setBusyId(null);
    }
  };

  const hide = (e: EventItem) =>
    confirmAction('Ẩn sự kiện', `Sự kiện "${e.title}" sẽ không còn hiển thị công khai.`, () => act(e.id, () => AdminApi.hide(e.id)), {
      confirmText: 'Ẩn sự kiện', destructive: true,
    });

  const reject = async (reason: string) => {
    if (!rejecting) return;
    try {
      await AdminApi.reject(rejecting.id, reason);
      setRejecting(null);
      reload();
    } catch (e: any) {
      showMessage('Không từ chối được', e.message);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={retry} />;

  return (
    <>
      <FlatList
        style={{ backgroundColor: colors.bg }}
        data={data ?? []}
        keyExtractor={(e) => e.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        ListHeaderComponent={
          <View style={{ gap: 12 }}>
            <Input value={q} onChangeText={setQ} placeholder="Tìm theo tên sự kiện hoặc đơn vị tổ chức" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {FILTERS.map((f) => (
                <Chip key={f.label} label={f.label} active={status === f.value} onPress={() => setStatus(f.value)} />
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={<Empty text="Không có sự kiện nào" hint="Thử đổi bộ lọc trạng thái." />}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            showStatus
            footer={
              <View style={{ gap: 8, marginTop: 8 }}>
                {item.status === 'pending' && (
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Button title="Duyệt" small onPress={() => act(item.id, () => AdminApi.approve(item.id))} loading={busyId === item.id} style={{ flex: 1 }} />
                    <Button title="Từ chối" variant="danger" small onPress={() => setRejecting(item)} disabled={busyId === item.id} style={{ flex: 1 }} />
                  </View>
                )}
                {['approved', 'ongoing'].includes(item.status) && (
                  <Button title="Ẩn sự kiện vi phạm" variant="outline" small onPress={() => hide(item)} />
                )}
                {item.status === 'hidden' && (
                  <Button title="Bỏ ẩn" variant="outline" small onPress={() => act(item.id, () => AdminApi.unhide(item.id))} />
                )}
              </View>
            }
          />
        )}
      />
      <PromptModal
        visible={!!rejecting}
        title={`Từ chối "${rejecting?.title ?? ''}"`}
        placeholder="Nêu rõ lý do để Ban tổ chức chỉnh sửa và gửi lại…"
        submitLabel="Từ chối"
        onCancel={() => setRejecting(null)}
        onSubmit={reject}
      />
    </>
  );
}
