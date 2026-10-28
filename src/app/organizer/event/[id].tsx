import { useState } from 'react';
import { Share, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { EventApi, OrganizerApi } from '@/api/services';
import { Badge, Button, Card, Empty, ErrorView, InfoRow, Loading, Page, ProgressBar, PromptModal, SectionTitle, StatBox, StatusBadge } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { confirmAction, showMessage } from '@/utils/dialog';
import { fmtDateTime, fmtPrice, fmtRange } from '@/utils/format';

export default function ManageEvent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const ev = useApi(() => EventApi.detail(id), [id]);
  const regs = useApi(() => OrganizerApi.registrations(id), [id]);
  const [busy, setBusy] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);

  if (ev.loading || regs.loading) return <Loading />;
  const event = ev.data;
  if (ev.error || !event) return <ErrorView message={ev.error || 'Không tìm thấy sự kiện'} onRetry={ev.retry} />;

  const list = regs.data ?? [];
  const canEdit = !['ended', 'cancelled'].includes(event.status);
  const canSubmit = ['draft', 'rejected'].includes(event.status);
  const reload = () => { ev.reload(); regs.reload(); };

  const act = async (fn: () => Promise<unknown>, okMsg?: string) => {
    setBusy(true);
    try {
      await fn();
      if (okMsg) showMessage(okMsg);
      reload();
    } catch (e: any) {
      showMessage('Không thực hiện được', e.message);
    } finally {
      setBusy(false);
    }
  };

  const submit = () =>
    confirmAction('Gửi duyệt', 'Sau khi gửi, bạn không thể sửa cho đến khi Admin phản hồi. Tiếp tục?', () =>
      act(() => OrganizerApi.submit(event.id), 'Đã gửi sự kiện cho Admin xét duyệt'),
    { confirmText: 'Gửi duyệt' });

  const cancel = () =>
    confirmAction('Hủy sự kiện', 'Tất cả người đã đăng ký sẽ được thông báo và đăng ký bị hủy. Hành động này không hoàn tác.', () =>
      act(() => OrganizerApi.cancel(event.id), 'Đã hủy sự kiện'),
    { confirmText: 'Hủy sự kiện', destructive: true });

  const exportCsv = async () => {
    const rows = [
      'Họ tên,Email,Mã vé,Điểm danh',
      ...list.map((r) => `"${r.userName}",${r.userEmail},${r.code},${r.checkedIn ? 'Đã điểm danh' : 'Chưa'}`),
    ];
    try {
      await Share.share({ title: `Danh sách - ${event.title}`, message: rows.join('\n') });
    } catch {
      showMessage('Danh sách CSV', rows.join('\n'));
    }
  };

  const sendNotice = async (message: string) => {
    try {
      const r = await OrganizerApi.notify(event.id, message);
      setNotifyOpen(false);
      showMessage('Đã gửi thông báo', `Đã gửi tới ${r.sent} người đăng ký.`);
    } catch (e: any) {
      showMessage('Không gửi được', e.message);
    }
  };

  return (
    <Page refreshing={ev.refreshing} onRefresh={() => { ev.refresh(); regs.reload(); }}>
      <View style={{ gap: 8 }}>
        <StatusBadge status={event.status} />
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>{event.title}</Text>
      </View>

      {event.status === 'rejected' && !!event.rejectReason && (
        <Card style={{ backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoft }}>
          <Text style={{ fontWeight: '800', color: colors.danger }}>Admin đã từ chối</Text>
          <Text style={{ color: colors.danger }}>{event.rejectReason}</Text>
          <Text style={{ color: colors.danger }}>Chỉnh sửa theo góp ý rồi bấm “Gửi duyệt lại”.</Text>
        </Card>
      )}

      <Card style={{ gap: 10 }}>
        <InfoRow label="Thời gian" value={fmtRange(event.startTime, event.endTime)} />
        <InfoRow label="Địa điểm" value={event.location} />
        <InfoRow label="Giá vé" value={fmtPrice(event.price)} />
        <InfoRow label="Danh mục" value={event.categoryName} />
      </Card>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <StatBox label="Đã đăng ký" value={`${event.registeredCount}/${event.capacity}`} />
        <StatBox label="Đã điểm danh" value={event.checkedInCount} tone="good" />
        <StatBox label="Chưa điểm danh" value={event.registeredCount - event.checkedInCount} tone="warn" />
      </View>
      <ProgressBar value={event.registeredCount} max={event.capacity} />

      <View style={{ gap: 10 }}>
        {canSubmit && <Button title={event.status === 'rejected' ? 'Gửi duyệt lại' : 'Gửi duyệt'} onPress={submit} loading={busy} />}
        {canEdit && <Button title="Chỉnh sửa thông tin" variant="outline" onPress={() => router.push(`/organizer/form?id=${event.id}` as any)} />}
        <Button title="Xem như người tham gia" variant="ghost" onPress={() => router.push(`/event/${event.id}` as any)} />
        {canEdit && event.status !== 'draft' && <Button title="Thông báo tới người đăng ký" variant="soft" onPress={() => setNotifyOpen(true)} />}
        {canEdit && <Button title="Hủy sự kiện" variant="danger" onPress={cancel} disabled={busy} />}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <SectionTitle>Danh sách đăng ký ({list.length})</SectionTitle>
        {list.length > 0 && <Button title="Xuất CSV" variant="soft" small onPress={exportCsv} />}
      </View>
      {list.length === 0 ? (
        <Empty text="Chưa có ai đăng ký" />
      ) : (
        list.map((r) => (
          <Card key={r.id} style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontWeight: '800', color: colors.text, flex: 1 }}>{r.userName}</Text>
              {r.checkedIn ? (
                <Badge label="Đã điểm danh" color={colors.success} bg={colors.successSoft} />
              ) : (
                <Badge label="Chưa điểm danh" color={colors.muted} bg={colors.neutralSoft} />
              )}
            </View>
            <Text style={{ color: colors.muted }}>{r.userEmail}</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>
              Mã vé {r.code} · đăng ký {fmtDateTime(r.createdAt)}
            </Text>
            {!r.checkedIn && ['approved', 'ongoing'].includes(event.status) && (
              <Button title="Điểm danh thủ công" variant="outline" small onPress={() => act(() => OrganizerApi.checkin(r.code))} disabled={busy} />
            )}
          </Card>
        ))
      )}

      <PromptModal
        visible={notifyOpen}
        title="Thông báo tới người đăng ký"
        placeholder="VD: Sự kiện dời sang phòng B2, bắt đầu lúc 9:00…"
        onCancel={() => setNotifyOpen(false)}
        onSubmit={sendNotice}
      />
    </Page>
  );
}
