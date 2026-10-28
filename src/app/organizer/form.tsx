import { useState } from 'react';
import { Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { EventApi, OrganizerApi } from '@/api/services';
import { Button, Chip, ErrorView, Input, Loading, Page } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { EventItem } from '@/types';
import { showMessage } from '@/utils/dialog';
import { parseDateTimeInput, toDateTimeInput } from '@/utils/format';

export default function EventFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  if (!id) return <FormBody />;
  return <EditLoader id={id} />;
}

function EditLoader({ id }: { id: string }) {
  const { data, loading, error, retry } = useApi(() => EventApi.detail(id), [id]);
  if (loading) return <Loading />;
  if (error || !data) return <ErrorView message={error || 'Không tải được sự kiện'} onRetry={retry} />;
  return <FormBody initial={data} />;
}

function defaultTime(hour: number) {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(hour, 0, 0, 0);
  return toDateTimeInput(d.toISOString());
}

function FormBody({ initial }: { initial?: EventItem }) {
  const router = useRouter();
  const cats = useApi(EventApi.categories, []);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [start, setStart] = useState(initial ? toDateTimeInput(initial.startTime) : defaultTime(9));
  const [end, setEnd] = useState(initial ? toDateTimeInput(initial.endTime) : defaultTime(12));
  const [location, setLocation] = useState(initial?.location ?? '');
  const [price, setPrice] = useState(String(initial?.price ?? 0));
  const [capacity, setCapacity] = useState(String(initial?.capacity ?? 50));
  const [image, setImage] = useState(initial?.image ?? '');
  const [audience, setAudience] = useState(initial?.audience ?? '');
  const [rules, setRules] = useState(initial?.rules ?? '');
  const [contact, setContact] = useState(initial?.contact ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<'save' | 'submit' | null>(null);

  const canResubmit = !initial || ['draft', 'rejected'].includes(initial.status);

  const save = async (andSubmit: boolean) => {
    const startIso = parseDateTimeInput(start);
    const endIso = parseDateTimeInput(end);
    if (!startIso || !endIso) return setError('Thời gian nhập theo dạng 2026-12-20 19:00 (năm-tháng-ngày giờ:phút)');
    setError('');
    setBusy(andSubmit ? 'submit' : 'save');
    try {
      const payload = {
        title, categoryId, location, description, audience, rules, contact, image,
        startTime: startIso, endTime: endIso,
        price: Number(price.replace(/\D/g, '')) || 0,
        capacity: Number(capacity.replace(/\D/g, '')) || 0,
      };
      const saved = initial ? await OrganizerApi.update(initial.id, payload) : await OrganizerApi.create(payload);
      if (andSubmit) await OrganizerApi.submit(saved.id);
      showMessage(andSubmit ? 'Đã lưu và gửi duyệt' : 'Đã lưu sự kiện');
      router.replace(`/organizer/event/${saved.id}` as any);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Page gap={16}>
      <Stack.Screen options={{ title: initial ? 'Sửa sự kiện' : 'Tạo sự kiện' }} />
      <Input label="Tên sự kiện *" value={title} onChangeText={setTitle} placeholder="VD: Workshop thiết kế UX" />

      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>Danh mục *</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {cats.data?.map((c) => (
            <Chip key={c.id} label={`${c.icon} ${c.name}`} active={categoryId === c.id} onPress={() => setCategoryId(c.id)} />
          ))}
        </View>
      </View>

      <Input label="Bắt đầu *  (năm-tháng-ngày giờ:phút)" value={start} onChangeText={setStart} placeholder="2026-12-20 19:00" autoCapitalize="none" />
      <Input label="Kết thúc *" value={end} onChangeText={setEnd} placeholder="2026-12-20 22:00" autoCapitalize="none" />
      <Input label="Địa điểm *" value={location} onChangeText={setLocation} placeholder="Tên địa điểm, địa chỉ" />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}><Input label="Giá vé (đ), 0 = miễn phí" value={price} onChangeText={setPrice} keyboardType="number-pad" /></View>
        <View style={{ flex: 1 }}><Input label="Sức chứa *" value={capacity} onChangeText={setCapacity} keyboardType="number-pad" /></View>
      </View>

      <Input label="Mô tả *" value={description} onChangeText={setDescription} multiline placeholder="Nội dung chính, diễn giả, lịch trình…" />
      <Input label="Đối tượng tham gia" value={audience} onChangeText={setAudience} placeholder="VD: Sinh viên, người đi làm" />
      <Input label="Quy định" value={rules} onChangeText={setRules} multiline />
      <Input label="Thông tin liên hệ" value={contact} onChangeText={setContact} placeholder="Email / số điện thoại" />
      <Input label="Link ảnh bìa (không bắt buộc)" value={image} onChangeText={setImage} autoCapitalize="none" placeholder="https://…" />

      {!!error && <Text style={{ color: colors.danger }}>{error}</Text>}
      <Button title={initial ? 'Lưu thay đổi' : 'Lưu bản nháp'} variant={canResubmit ? 'outline' : 'primary'} onPress={() => save(false)} loading={busy === 'save'} disabled={!!busy} />
      {canResubmit && <Button title="Lưu và gửi duyệt" onPress={() => save(true)} loading={busy === 'submit'} disabled={!!busy} />}
    </Page>
  );
}
