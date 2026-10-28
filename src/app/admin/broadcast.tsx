import { useState } from 'react';
import { Text, View } from 'react-native';
import { AdminApi } from '@/api/services';
import { Button, Card, Chip, Empty, ErrorView, Input, Loading, Page, SectionTitle } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { showMessage } from '@/utils/dialog';
import { fmtDateTime } from '@/utils/format';

const TARGETS = [
  { value: 'all', label: 'Tất cả người dùng' },
  { value: 'attendee', label: 'Người tham gia' },
  { value: 'organizer', label: 'Ban tổ chức' },
];

export default function Broadcast() {
  const { data, loading, error, retry, reload, refreshing, refresh } = useApi(AdminApi.broadcasts, []);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('all');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    setBusy(true);
    try {
      const b = await AdminApi.sendNotification({ title, body, target });
      setTitle('');
      setBody('');
      showMessage('Đã gửi thông báo', `Đã gửi tới ${b.recipients} người dùng.`);
      reload();
    } catch (e: any) {
      showMessage('Không gửi được', e.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={retry} />;

  return (
    <Page refreshing={refreshing} onRefresh={refresh}>
      <Card style={{ gap: 12 }}>
        <SectionTitle>Soạn thông báo</SectionTitle>
        <Input label="Tiêu đề" value={title} onChangeText={setTitle} placeholder="VD: Bảo trì hệ thống tối nay" />
        <Input label="Nội dung" value={body} onChangeText={setBody} multiline placeholder="Nội dung chi tiết…" />
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>Gửi tới</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {TARGETS.map((t) => (
            <Chip key={t.value} label={t.label} active={target === t.value} onPress={() => setTarget(t.value)} />
          ))}
        </View>
        <Button title="Gửi thông báo" onPress={send} loading={busy} disabled={!title.trim() || !body.trim()} />
      </Card>

      <SectionTitle>Lịch sử đã gửi</SectionTitle>
      {!data?.length && <Empty text="Chưa gửi thông báo nào" />}
      {data?.map((b) => (
        <Card key={b.id}>
          <Text style={{ fontWeight: '800', color: colors.text }}>{b.title}</Text>
          <Text style={{ color: colors.text }}>{b.body}</Text>
          <Text style={{ color: colors.muted, fontSize: 12 }}>
            {fmtDateTime(b.createdAt)} · {TARGETS.find((t) => t.value === b.target)?.label} · {b.recipients} người nhận
          </Text>
        </Card>
      ))}
    </Page>
  );
}
