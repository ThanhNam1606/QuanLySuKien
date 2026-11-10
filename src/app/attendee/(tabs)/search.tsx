import { ReactNode, useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { EventApi, EventQuery } from '@/api/services';
import EventCard from '@/components/EventCard';
import { Chip, Empty, ErrorView, Input } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useApi } from '@/hooks/useApi';
import { useDebounced } from '@/hooks/useDebounced';
import { useT } from '@/i18n';

const PRICE: { label: string; value?: EventQuery['price'] }[] = [
  { label: 'Mọi giá' }, { label: 'Miễn phí', value: 'free' }, { label: 'Có phí', value: 'paid' },
];
const WHEN: { label: string; value?: EventQuery['when'] }[] = [
  { label: 'Mọi lúc' }, { label: 'Hôm nay', value: 'today' }, { label: 'Tuần này', value: 'week' }, { label: 'Tháng này', value: 'month' },
];

export default function Search() {
  const t = useT();
  const { colors, cardStyle } = useTheme();
  const grid = cardStyle === 'grid';
  const [q, setQ] = useState('');
  const [area, setArea] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [price, setPrice] = useState<EventQuery['price']>();
  const [when, setWhen] = useState<EventQuery['when']>();
  const dq = useDebounced(q);
  const darea = useDebounced(area);

  const cats = useApi(EventApi.categories, []);
  const res = useApi(
    () => EventApi.list({ q: dq.trim() || undefined, area: darea.trim() || undefined, categoryId, price, when }),
    [dq, darea, categoryId, price, when],
  );

  return (
    <FlatList
      key={grid ? 'grid' : 'single'}
      numColumns={grid ? 2 : 1}
      columnWrapperStyle={grid ? { gap: 12 } : undefined}
      style={{ backgroundColor: colors.bg }}
      data={res.data ?? []}
      keyExtractor={(e) => e.id}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
      renderItem={({ item }) => <EventCard event={item} variant={cardStyle} />}
      ListHeaderComponent={
        <View style={{ gap: 12 }}>
          <Input value={q} onChangeText={setQ} placeholder={t('Tìm theo tên, từ khóa, đơn vị tổ chức…')} returnKeyType="search" />
          <Input value={area} onChangeText={setArea} placeholder={t('Khu vực / địa điểm (VD: Hoàn Kiếm)')} />
          <Group title={t('Danh mục')}>
            <Chip label={t('Tất cả')} active={!categoryId} onPress={() => setCategoryId(undefined)} />
            {cats.data?.map((c) => (
              <Chip key={c.id} label={c.name} active={categoryId === c.id} onPress={() => setCategoryId(c.id)} />
            ))}
          </Group>
          <Group title={t('Giá vé')}>
            {PRICE.map((p) => <Chip key={p.label} label={t(p.label)} active={price === p.value} onPress={() => setPrice(p.value)} />)}
          </Group>
          <Group title={t('Thời gian')}>
            {WHEN.map((w) => <Chip key={w.label} label={t(w.label)} active={when === w.value} onPress={() => setWhen(w.value)} />)}
          </Group>
          <Text style={{ color: colors.muted }}>{res.loading ? t('Đang tìm…') : t('{n} sự kiện', { n: res.data?.length ?? 0 })}</Text>
          {!!res.error && <ErrorView message={res.error} onRetry={res.retry} />}
        </View>
      }
      ListEmptyComponent={res.loading || res.error ? undefined : <Empty text={t('Không tìm thấy sự kiện nào')} hint={t('Thử từ khóa khác hoặc bỏ bớt bộ lọc.')} />}
    />
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13, fontWeight: '700', color: colors.muted }}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {children}
      </ScrollView>
    </View>
  );
}
