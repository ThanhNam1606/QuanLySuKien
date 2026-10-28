import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { EventApi } from '@/api/services';
import { Card, Empty, ErrorView, Loading, Page } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/store/authStore';
import { fmtRange } from '@/utils/format';

/** id ở đây là id sự kiện; mã vé lấy từ myRegistration của người dùng. */
export default function TicketScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuth((s) => s.user);
  const { data: event, loading, error, retry } = useApi(() => EventApi.detail(id), [id]);

  if (loading) return <Loading />;
  if (error || !event) return <ErrorView message={error || 'Không tải được vé'} onRetry={retry} />;
  const reg = event.myRegistration;
  if (!reg) return <Empty text="Bạn chưa đăng ký sự kiện này" />;

  return (
    <Page>
      <Card style={{ alignItems: 'center', gap: 14, paddingVertical: 24 }}>
        <Text style={{ fontSize: 19, fontWeight: '800', color: colors.text, textAlign: 'center' }}>{event.title}</Text>
        <Text style={{ color: colors.muted, textAlign: 'center' }}>{fmtRange(event.startTime, event.endTime)}</Text>
        <Text style={{ color: colors.muted, textAlign: 'center' }}>{event.location}</Text>
        <View style={{ padding: 16, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
          <QRCode value={reg.code} size={210} />
        </View>
        <Text style={{ fontSize: 24, fontWeight: '800', letterSpacing: 2, color: colors.primaryDark }}>{reg.code}</Text>
        <Text style={{ color: colors.muted }}>Người tham gia: {user?.name}</Text>
        <View
          style={{
            paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
            backgroundColor: reg.checkedIn ? colors.successSoft : colors.primarySoft,
          }}
        >
          <Text style={{ fontWeight: '700', color: reg.checkedIn ? colors.success : colors.primaryDark }}>
            {reg.checkedIn ? 'Đã điểm danh' : 'Chưa điểm danh'}
          </Text>
        </View>
      </Card>
      <Text style={{ color: colors.muted, textAlign: 'center' }}>Đưa mã này cho Ban tổ chức quét khi đến sự kiện.</Text>
    </Page>
  );
}
