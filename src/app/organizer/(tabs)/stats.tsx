import { Text, View } from 'react-native';
import { OrganizerApi } from '@/api/services';
import { Card, Empty, ErrorView, Loading, Page, ProgressBar, SectionTitle, StatBox, StatusBadge } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';

export default function Stats() {
  const { data, loading, error, refreshing, refresh, retry } = useApi(OrganizerApi.stats, []);
  if (loading) return <Loading />;
  if (error || !data) return <ErrorView message={error} onRetry={retry} />;

  return (
    <Page refreshing={refreshing} onRefresh={refresh}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <StatBox label="Sự kiện" value={data.totalEvents} />
        <StatBox label="Lượt đăng ký" value={data.totalRegistrations} />
        <StatBox label="Đã điểm danh" value={data.totalCheckedIn} tone="good" />
        <StatBox
          label="Tỷ lệ có mặt"
          value={data.totalRegistrations ? `${Math.round((data.totalCheckedIn / data.totalRegistrations) * 100)}%` : '–'}
        />
      </View>

      <SectionTitle>Theo từng sự kiện</SectionTitle>
      {data.rows.length === 0 && <Empty text="Chưa có dữ liệu" />}
      {data.rows.map((r) => (
        <Card key={r.id} style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
            <Text style={{ flex: 1, fontWeight: '800', color: colors.text }}>{r.title}</Text>
            <StatusBadge status={r.status} />
          </View>
          <View style={{ gap: 4 }}>
            <Text style={{ color: colors.muted, fontSize: 13 }}>Đăng ký {r.registered}/{r.capacity}</Text>
            <ProgressBar value={r.registered} max={r.capacity} />
          </View>
          <View style={{ gap: 4 }}>
            <Text style={{ color: colors.muted, fontSize: 13 }}>Điểm danh {r.checkedIn}/{r.registered}</Text>
            <ProgressBar value={r.checkedIn} max={r.registered} color={colors.success} />
          </View>
        </Card>
      ))}
    </Page>
  );
}
