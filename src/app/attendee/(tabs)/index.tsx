import { useState } from 'react';
import { FlatList, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { EventApi } from '@/api/services';
import EventCard from '@/components/EventCard';
import { Button, Chip, Empty, ErrorView, Loading, SectionTitle } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const [categoryId, setCategoryId] = useState<string | undefined>();

  const cats = useApi(EventApi.categories, []);
  const popular = useApi(() => EventApi.list({ sort: 'popular', limit: 4 }), []);
  const list = useApi(() => EventApi.list({ categoryId }), [categoryId]);

  if (list.loading) return <Loading />;
  if (list.error) return <ErrorView message={list.error} onRetry={list.retry} />;

  const refresh = () => {
    cats.reload();
    popular.reload();
    list.refresh();
  };

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      data={list.data ?? []}
      keyExtractor={(e) => e.id}
      contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={list.refreshing} onRefresh={refresh} />}
      renderItem={({ item }) => <EventCard event={item} />}
      ListEmptyComponent={<Empty text="Chưa có sự kiện phù hợp" hint="Thử chọn danh mục khác hoặc quay lại sau." />}
      ListHeaderComponent={
        <View style={{ gap: 14, marginBottom: 4 }}>
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>
              {user ? `Xin chào, ${user.name.split(' ').slice(-1)[0]}` : 'Khám phá sự kiện'}
            </Text>
            <Text style={{ color: colors.muted }}>Tìm điều thú vị sắp diễn ra quanh bạn</Text>
          </View>
          {!user && (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button title="Đăng nhập" small onPress={() => router.push('/(auth)/login' as any)} style={{ flex: 1 }} />
              <Button title="Tạo tài khoản" small variant="outline" onPress={() => router.push('/(auth)/register' as any)} style={{ flex: 1 }} />
            </View>
          )}

          {!!popular.data?.length && (
            <View style={{ gap: 10 }}>
              <SectionTitle>Nổi bật</SectionTitle>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {popular.data.map((e) => (
                  <View key={e.id} style={{ width: 280 }}>
                    <EventCard event={e} />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ gap: 10 }}>
            <SectionTitle>Sắp diễn ra</SectionTitle>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              <Chip label="Tất cả" active={!categoryId} onPress={() => setCategoryId(undefined)} />
              {cats.data?.map((c) => (
                <Chip key={c.id} label={`${c.icon} ${c.name}`} active={categoryId === c.id} onPress={() => setCategoryId(c.id)} />
              ))}
            </ScrollView>
          </View>
        </View>
      }
    />
  );
}
