import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { useState } from 'react';
import { EventApi } from '@/api/services';
import { AppText as Text } from '@/components/AppText';
import { Button, Empty, ErrorView, Loading, Page } from '@/components/ui';
import { radius } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import { addEventToCalendar } from '@/utils/calendar';
import { confirmAction, showMessage } from '@/utils/dialog';
import { cityOf, fmtClock12, fmtDayMonth, weekdayLong } from '@/utils/format';
import { refreshReminders } from '@/utils/reminders';

/** id ở đây là id sự kiện; mã vé lấy từ myRegistration của người dùng. */
export default function TicketScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();
  const router = useRouter();
  const { colors } = useTheme();
  const { data: event, loading, error, retry } = useApi(() => EventApi.detail(id), [id]);
  const [busy, setBusy] = useState(false);

  if (loading) return <Loading />;
  if (error || !event) return <ErrorView message={error || t('Không tải được vé')} onRetry={retry} />;
  const reg = event.myRegistration;
  if (!reg) return <Empty text={t('Bạn chưa đăng ký sự kiện này')} />;

  const addToCalendar = async () => {
    try {
      await addEventToCalendar(event);
    } catch {
      showMessage(t('Không mở được lịch'), t('Hãy kiểm tra điện thoại đã cài ứng dụng Lịch chưa rồi thử lại.'));
    }
  };

  const cancel = () =>
    confirmAction(t('Hủy vé'), t('Bạn muốn hủy vé "{title}"?', { title: event.title }), async () => {
      setBusy(true);
      try {
        await EventApi.cancelRegistration(event.id);
        refreshReminders();
        router.back();
      } catch (e: any) {
        showMessage(t('Không hủy được'), e.message);
      } finally {
        setBusy(false);
      }
    }, { confirmText: t('Hủy vé'), destructive: true });

  const canCancel = event.status === 'approved' && !reg.checkedIn;
  const line = `${weekdayLong(event.startTime)}, ${fmtDayMonth(event.startTime)} · ${fmtClock12(event.startTime)} · ${cityOf(event.location)}`;

  return (
    <Page>
      <View style={{ borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
        <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 20, gap: 6 }}>
          <Text style={{ fontSize: 21, fontWeight: '800', color: '#fff' }}>{event.title}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.88)' }}>{line}</Text>
        </LinearGradient>

        {/* Đường xé vé: hai khuyết tròn + nét đứt */}
        <View style={{ height: 24, justifyContent: 'center' }}>
          <View style={{ position: 'absolute', left: -12, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.bg }} />
          <View style={{ position: 'absolute', right: -12, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.bg }} />
          <View style={{ marginHorizontal: 20, borderTopWidth: 2, borderStyle: 'dashed', borderColor: colors.border }} />
        </View>

        <View style={{ alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingBottom: 24, paddingTop: 4 }}>
          {/* QR luôn nền trắng để máy quét đọc được ở cả chế độ tối */}
          <View style={{ padding: 14, backgroundColor: '#fff', borderRadius: radius.lg }}>
            <QRCode value={reg.code} size={200} backgroundColor="#fff" color="#000" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800', letterSpacing: 2, color: colors.primaryDark }}>{reg.code}</Text>
          <View style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: reg.checkedIn ? colors.successSoft : colors.primarySoft }}>
            <Text style={{ fontWeight: '700', color: reg.checkedIn ? colors.success : colors.primaryDark }}>
              {reg.checkedIn ? t('Đã điểm danh') : t('Đã đăng ký')}
            </Text>
          </View>
          <Text style={{ color: colors.muted, textAlign: 'center' }}>{t('Xuất trình mã tại cổng')}</Text>
        </View>
      </View>

      <Button title={t('Thêm vào lịch')} variant="soft" onPress={addToCalendar} />
      {canCancel && <Button title={t('Hủy vé')} variant="outline" onPress={cancel} loading={busy} />}
    </Page>
  );
}
