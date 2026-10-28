import { Text, View } from 'react-native';
import { AdminApi } from '@/api/services';
import { Card, ErrorView, Loading, Page, ProgressBar, SectionTitle, StatBox } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { fmtDateTime } from '@/utils/format';

export default function Dashboard() {
  const { data, loading, error, refreshing, refresh, retry } = useApi(AdminApi.stats, []);
  if (loading) return <Loading />;
  if (error || !data) return <ErrorView message={error} onRetry={retry} />;
  const maxCat = Math.max(1, ...data.topCategories.map((c) => c.count));

  return (
    <Page refreshing={refreshing} onRefresh={refresh}>
      <SectionTitle>Sự kiện</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <StatBox label="Tổng sự kiện" value={data.events.total} />
        <StatBox label="Chờ duyệt" value={data.events.pending} tone="warn" />
        <StatBox label="Sắp diễn ra" value={data.events.upcoming} />
        <StatBox label="Đang diễn ra" value={data.events.ongoing} tone="good" />
        <StatBox label="Đã kết thúc" value={data.events.ended} />
        <StatBox label="Lượt đăng ký" value={data.registrations} />
      </View>

      <SectionTitle>Người dùng và báo cáo</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <StatBox label="Tổng người dùng" value={data.users.total} />
        <StatBox label="Mới trong 7 ngày" value={data.users.newThisWeek} tone="good" />
        <StatBox label="Ban tổ chức" value={data.users.organizers} />
        <StatBox label="Báo cáo chờ xử lý" value={data.pendingReports} tone={data.pendingReports ? 'warn' : undefined} />
      </View>

      <SectionTitle>Danh mục phổ biến</SectionTitle>
      <Card style={{ gap: 12 }}>
        {data.topCategories.map((c) => (
          <View key={c.name} style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text }}>{c.name}</Text>
              <Text style={{ color: colors.muted }}>{c.count} sự kiện</Text>
            </View>
            <ProgressBar value={c.count} max={maxCat} />
          </View>
        ))}
      </Card>

      <SectionTitle>Hoạt động mới nhất</SectionTitle>
      <Card style={{ gap: 12 }}>
        {data.recent.map((l) => (
          <View key={l.id} style={{ gap: 2 }}>
            <Text style={{ color: colors.text }}>{l.text}</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>{fmtDateTime(l.createdAt)}</Text>
          </View>
        ))}
      </Card>
    </Page>
  );
}
