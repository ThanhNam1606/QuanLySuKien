import { FlatList, RefreshControl, Text, View } from 'react-native';
import { AdminApi } from '@/api/services';
import { Badge, Button, Card, Chip, Empty, ErrorView, Loading } from '@/components/ui';
import { colors, severityMeta } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { ReportSeverity } from '@/types';
import { confirmAction, showMessage } from '@/utils/dialog';
import { fmtDateTime } from '@/utils/format';

const SEVERITIES: ReportSeverity[] = ['low', 'medium', 'high'];

export default function Reports() {
  const { data, loading, error, refreshing, refresh, retry, reload } = useApi(AdminApi.reports, []);

  const act = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      reload();
    } catch (e: any) {
      showMessage('Không thực hiện được', e.message);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={retry} />;

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      data={data ?? []}
      keyExtractor={(r) => r.id}
      contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      ListEmptyComponent={<Empty text="Chưa có báo cáo nào" />}
      renderItem={({ item: r }) => {
        const sev = severityMeta[r.severity];
        const pending = r.status === 'pending';
        return (
          <Card style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
              <Text style={{ flex: 1, fontWeight: '800', color: colors.text }}>{r.eventTitle}</Text>
              {pending ? (
                <Badge label="Chờ xử lý" color={colors.warning} bg={colors.warningSoft} />
              ) : r.status === 'accepted' ? (
                <Badge label="Đã chấp nhận" color={colors.success} bg={colors.successSoft} />
              ) : (
                <Badge label="Đã từ chối" color={colors.muted} bg={colors.neutralSoft} />
              )}
            </View>
            <Text style={{ color: colors.text, lineHeight: 20 }}>{r.reason}</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>Người báo cáo: {r.reporterName} · {fmtDateTime(r.createdAt)}</Text>

            {pending ? (
              <>
                <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600' }}>Mức độ nghiêm trọng</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {SEVERITIES.map((s) => (
                    <Chip key={s} label={severityMeta[s].label} active={r.severity === s} onPress={() => act(() => AdminApi.updateReport(r.id, { severity: s }))} />
                  ))}
                </View>
                <View style={{ gap: 8, marginTop: 4 }}>
                  <Button
                    title="Chấp nhận và ẩn sự kiện"
                    variant="danger"
                    small
                    onPress={() =>
                      confirmAction('Ẩn sự kiện', `Chấp nhận báo cáo và ẩn "${r.eventTitle}"?`, () =>
                        act(() => AdminApi.updateReport(r.id, { status: 'accepted', hideEvent: true })), { confirmText: 'Ẩn sự kiện', destructive: true })
                    }
                  />
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Button title="Chấp nhận" small variant="outline" style={{ flex: 1 }} onPress={() => act(() => AdminApi.updateReport(r.id, { status: 'accepted' }))} />
                    <Button title="Từ chối" small variant="ghost" style={{ flex: 1 }} onPress={() => act(() => AdminApi.updateReport(r.id, { status: 'rejected' }))} />
                  </View>
                </View>
              </>
            ) : (
              <Badge label={`Mức độ: ${sev.label}`} color={sev.color} bg={sev.bg} />
            )}
          </Card>
        );
      }}
    />
  );
}
