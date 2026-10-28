import { FlatList, RefreshControl, Text, View } from 'react-native';
import { NotificationApi } from '@/api/services';
import { colors } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { fmtDateTime } from '@/utils/format';
import { Button, Card, Empty, ErrorView, Loading } from './ui';

/** Dùng chung cho Người tham gia và Ban tổ chức. */
export default function NotificationList() {
  const { data, loading, error, refreshing, refresh, retry, reload } = useApi(NotificationApi.list, []);
  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={retry} />;

  const unread = (data ?? []).filter((n) => !n.read).length;
  const readAll = async () => {
    await NotificationApi.readAll();
    reload();
  };

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      data={data ?? []}
      keyExtractor={(n) => n.id}
      contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      ListHeaderComponent={
        unread > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ color: colors.muted }}>{unread} thông báo chưa đọc</Text>
            <Button title="Đánh dấu đã đọc" variant="ghost" small onPress={readAll} />
          </View>
        ) : undefined
      }
      ListEmptyComponent={<Empty text="Chưa có thông báo nào" hint="Thông báo xác nhận đăng ký và thay đổi sự kiện sẽ hiện ở đây." />}
      renderItem={({ item }) => (
        <Card style={!item.read ? { borderColor: colors.primary, backgroundColor: '#f2fbf9' } : undefined}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {!item.read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />}
            <Text style={{ fontWeight: '800', color: colors.text, flex: 1 }}>{item.title}</Text>
          </View>
          <Text style={{ color: colors.text, lineHeight: 20 }}>{item.body}</Text>
          <Text style={{ color: colors.muted, fontSize: 12 }}>{fmtDateTime(item.createdAt)}</Text>
        </Card>
      )}
    />
  );
}
