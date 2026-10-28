import { useState } from 'react';
import { Linking, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EventApi } from '@/api/services';
import { Button, Card, Empty, ErrorView, InfoRow, Loading, ProgressBar, PromptModal, StatusBadge } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/store/authStore';
import { EventItem } from '@/types';
import { confirmAction, showMessage } from '@/utils/dialog';
import { fmtPrice, fmtRange } from '@/utils/format';

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user);
  const { data: event, setData, loading, error, retry } = useApi(() => EventApi.detail(id), [id]);
  const [busy, setBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  if (loading) return <Loading />;
  if (error || !event) return <ErrorView message={error || 'Không tìm thấy sự kiện'} onRetry={retry} />;

  const isAttendee = user?.role === 'attendee';
  const isOwner = user?.role === 'organizer' && user.id === event.organizerId;
  const mine = event.myRegistration;
  const full = event.registeredCount >= event.capacity;

  const run = async (fn: () => Promise<EventItem>) => {
    setBusy(true);
    try {
      setData(await fn());
    } finally {
      setBusy(false);
    }
  };

  const register = async (force = false) => {
    setBusy(true);
    try {
      setData(await EventApi.register(event.id, force));
      showMessage('Đăng ký thành công', 'Vé điện tử của bạn đã có trong mục "Lịch của tôi".');
    } catch (e: any) {
      if (e.status === 409 && e.data?.conflict) {
        confirmAction('Trùng lịch', `${e.message}. Bạn vẫn muốn đăng ký?`, () => register(true), { confirmText: 'Vẫn đăng ký' });
      } else {
        showMessage('Không đăng ký được', e.message);
      }
    } finally {
      setBusy(false);
    }
  };

  const cancel = () =>
    confirmAction('Hủy đăng ký', `Bạn muốn hủy đăng ký "${event.title}"?`, async () => {
      try {
        await run(() => EventApi.cancelRegistration(event.id));
      } catch (e: any) {
        showMessage('Không hủy được', e.message);
      }
    }, { confirmText: 'Hủy đăng ký', destructive: true });

  const toggleFavorite = async () => {
    try {
      await run(() => (event.isFavorite ? EventApi.unfavorite(event.id) : EventApi.favorite(event.id)));
    } catch (e: any) {
      showMessage('Lỗi', e.message);
    }
  };

  const openMap = () => {
    const q = event.latitude && event.longitude ? `${event.latitude},${event.longitude}` : encodeURIComponent(event.location);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`).catch(() => showMessage('Không mở được bản đồ'));
  };

  const share = () =>
    Share.share({ message: `${event.title}\n${fmtRange(event.startTime, event.endTime)}\n${event.location}` }).catch(() => {});

  const sendReport = async (reason: string) => {
    try {
      await EventApi.report(event.id, reason);
      setReportOpen(false);
      showMessage('Đã gửi báo cáo', 'Cảm ơn bạn. Quản trị viên sẽ kiểm tra nội dung này.');
    } catch (e: any) {
      showMessage('Không gửi được', e.message);
    }
  };

  const canRegister = event.status === 'approved' && !full;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen options={{ title: 'Chi tiết sự kiện' }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Image source={{ uri: event.image }} style={{ width: '100%', height: 210, backgroundColor: colors.neutralSoft }} contentFit="cover" />
        <View style={{ padding: 16, gap: 14 }}>
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>{event.categoryName}</Text>
              <StatusBadge status={event.status} />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>{event.title}</Text>
            <Text style={{ color: colors.muted }}>Tổ chức bởi {event.organizerName}</Text>
          </View>

          {event.status === 'rejected' && !!event.rejectReason && (
            <Card style={{ backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoft }}>
              <Text style={{ fontWeight: '700', color: colors.danger }}>Lý do bị từ chối</Text>
              <Text style={{ color: colors.danger }}>{event.rejectReason}</Text>
            </Card>
          )}

          <Card style={{ gap: 10 }}>
            <InfoRow label="Thời gian" value={fmtRange(event.startTime, event.endTime)} />
            <InfoRow label="Địa điểm" value={event.location} />
            <InfoRow label="Giá vé" value={fmtPrice(event.price)} />
            <InfoRow label="Đối tượng" value={event.audience} />
            <InfoRow label="Liên hệ" value={event.contact} />
            <View style={{ gap: 6, marginTop: 4 }}>
              <Text style={{ color: colors.muted }}>
                Đã đăng ký {event.registeredCount}/{event.capacity} chỗ
              </Text>
              <ProgressBar value={event.registeredCount} max={event.capacity} color={full ? colors.danger : colors.primary} />
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
              <Button title="Chỉ đường" variant="soft" small onPress={openMap} style={{ flex: 1 }} />
              <Button title="Chia sẻ" variant="soft" small onPress={share} style={{ flex: 1 }} />
            </View>
          </Card>

          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text }}>Giới thiệu</Text>
            <Text style={{ color: colors.text, lineHeight: 22 }}>{event.description}</Text>
          </View>

          {!!event.rules && (
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text }}>Quy định</Text>
              <Text style={{ color: colors.text, lineHeight: 22 }}>{event.rules}</Text>
            </View>
          )}

          {user && user.role !== 'admin' && !isOwner && (
            <Pressable onPress={() => setReportOpen(true)}>
              <Text style={{ color: colors.muted, textDecorationLine: 'underline', textAlign: 'center' }}>Báo cáo vi phạm</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {(isAttendee || !user || isOwner) && (
        <View style={{ padding: 14, paddingBottom: 14 + insets.bottom, backgroundColor: '#fff', borderTopWidth: 1, borderColor: colors.border, flexDirection: 'row', gap: 10 }}>
          {isOwner ? (
            <Button title="Quản lý sự kiện này" onPress={() => router.push(`/organizer/event/${event.id}` as any)} style={{ flex: 1 }} />
          ) : !user ? (
            <Button title="Đăng nhập để đăng ký" onPress={() => router.push('/(auth)/login' as any)} style={{ flex: 1 }} />
          ) : (
            <>
              <Button title={event.isFavorite ? '❤️ Đã lưu' : '🤍 Lưu'} variant="outline" onPress={toggleFavorite} disabled={busy} style={{ width: 110 }} />
              {mine ? (
                <>
                  <Button title="Xem vé" onPress={() => router.push(`/ticket/${event.id}` as any)} style={{ flex: 1 }} />
                  {event.status === 'approved' && !mine.checkedIn && (
                    <Button title="Hủy" variant="outline" onPress={cancel} disabled={busy} style={{ width: 80 }} />
                  )}
                </>
              ) : (
                <Button
                  title={
                    canRegister ? 'Đăng ký tham gia' : full && event.status === 'approved' ? 'Đã hết chỗ'
                      : event.status === 'ongoing' ? 'Sự kiện đang diễn ra' : 'Không nhận đăng ký'
                  }
                  onPress={() => register(false)}
                  loading={busy}
                  disabled={!canRegister}
                  style={{ flex: 1 }}
                />
              )}
            </>
          )}
        </View>
      )}

      <PromptModal
        visible={reportOpen}
        title="Báo cáo vi phạm"
        placeholder="Mô tả nội dung sai lệch hoặc vi phạm…"
        onCancel={() => setReportOpen(false)}
        onSubmit={sendReport}
      />
    </View>
  );
}
