import { useState } from 'react';
import { Linking, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EventApi } from '@/api/services';
import { AppText as Text } from '@/components/AppText';
import { Button, Card, ErrorView, InfoRow, Loading, ProgressBar, PromptModal, StatusBadge } from '@/components/ui';
import { radius } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/store/authStore';
import { useT } from '@/i18n';
import { EventItem } from '@/types';
import { refreshReminders } from '@/utils/reminders';
import { confirmAction, showMessage } from '@/utils/dialog';
import { fmtClock12, fmtDate, fmtPrice, fmtRange, weekdayLong } from '@/utils/format';

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const user = useAuth((s) => s.user);
  const { data: event, setData, loading, error, retry } = useApi(() => EventApi.detail(id), [id]);
  const [busy, setBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  if (loading) return <Loading />;
  if (error || !event) return <ErrorView message={error || t('Không tìm thấy sự kiện')} onRetry={retry} />;

  const isAttendee = user?.role === 'attendee';
  const isOwner = user?.role === 'organizer' && user.id === event.organizerId;
  const mine = event.myRegistration;
  const left = Math.max(0, event.capacity - event.registeredCount);
  const full = left <= 0;
  const fewLeft = !full && event.status === 'approved' && (left <= 10 || left / event.capacity <= 0.15);

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
      refreshReminders();
      showMessage(t('Đặt vé thành công'), t('Vé điện tử của bạn đã có trong mục "Lịch của tôi".'));
    } catch (e: any) {
      if (e.status === 409 && e.data?.conflict) {
        confirmAction(t('Trùng lịch'), t('{msg}. Bạn vẫn muốn đặt vé?', { msg: e.message }), () => register(true), { confirmText: t('Vẫn đặt vé') });
      } else {
        showMessage(t('Không đặt được vé'), e.message);
      }
    } finally {
      setBusy(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      await run(() => (event.isFavorite ? EventApi.unfavorite(event.id) : EventApi.favorite(event.id)));
    } catch (e: any) {
      showMessage(t('Lỗi'), e.message);
    }
  };

  const openMap = () => {
    const q = event.latitude && event.longitude ? `${event.latitude},${event.longitude}` : encodeURIComponent(event.location);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`).catch(() => showMessage(t('Không mở được bản đồ')));
  };

  const share = () =>
    Share.share({ message: `${event.title}\n${fmtRange(event.startTime, event.endTime)}\n${event.location}` }).catch(() => {});

  const sendReport = async (reason: string) => {
    try {
      await EventApi.report(event.id, reason);
      setReportOpen(false);
      showMessage(t('Đã gửi báo cáo'), t('Cảm ơn bạn. Quản trị viên sẽ kiểm tra nội dung này.'));
    } catch (e: any) {
      showMessage(t('Không gửi được'), e.message);
    }
  };

  const canRegister = event.status === 'approved' && !full;
  const showBar = isAttendee || !user || isOwner;
  const timeLine = `${weekdayLong(event.startTime)}, ${fmtDate(event.startTime)} · ${fmtClock12(event.startTime)}`;

  const roundBtn = {
    width: 42, height: 42, borderRadius: 21, backgroundColor: colors.floatBtn, alignItems: 'center' as const, justifyContent: 'center' as const,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Đầu trang: gradient + ảnh mờ, nút tròn đè lên */}
        <View style={{ height: 230 + insets.top }}>
          <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          {!!event.image && <Image source={{ uri: event.image }} style={[StyleSheet.absoluteFill, { opacity: 0.35 }]} contentFit="cover" />}
          <View style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/' as any))} style={roundBtn} accessibilityRole="button" accessibilityLabel={t('Quay lại')}>
              <Text style={{ fontSize: 20, color: colors.floatBtnFg, fontWeight: '700' }}>‹</Text>
            </Pressable>
            {isAttendee && (
              <Pressable onPress={toggleFavorite} disabled={busy} style={roundBtn} accessibilityRole="button" accessibilityLabel={event.isFavorite ? t('Bỏ lưu') : t('Lưu')}>
                <Text style={{ fontSize: 18 }}>{event.isFavorite ? '❤️' : '🤍'}</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={{ marginTop: -26, borderTopLeftRadius: 26, borderTopRightRadius: 26, backgroundColor: colors.bg, padding: 16, gap: 16 }}>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5 }}>
                <Text style={{ color: colors.primaryDark, fontWeight: '700', fontSize: 12 }}>{event.categoryName}</Text>
              </View>
              {fewLeft && (
                <View style={{ backgroundColor: colors.warningSoft, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5 }}>
                  <Text style={{ color: colors.warning, fontWeight: '700', fontSize: 12 }}>{t('Còn ít chỗ')}</Text>
                </View>
              )}
              {event.status !== 'approved' && <StatusBadge status={event.status} />}
            </View>
            <Text style={{ fontSize: 26, fontWeight: '800', color: colors.text }}>{event.title}</Text>
            <Text style={{ color: colors.muted }}>{t('Do {name} tổ chức', { name: event.organizerName })}</Text>
          </View>

          {event.status === 'rejected' && !!event.rejectReason && (
            <Card style={{ backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoft }}>
              <Text style={{ fontWeight: '700', color: colors.danger }}>{t('Lý do bị từ chối')}</Text>
              <Text style={{ color: colors.danger }}>{event.rejectReason}</Text>
            </Card>
          )}

          <Card style={{ gap: 14 }}>
            <IconRow icon="📅" title={timeLine} sub={fmtRange(event.startTime, event.endTime)} />
            <Pressable onPress={openMap}>
              <IconRow icon="📍" title={event.location} sub={t('Bấm để chỉ đường')} />
            </Pressable>
            <IconRow icon="👥" title={full ? t('Hết chỗ') : t('Còn {left} / {cap} chỗ', { left, cap: event.capacity })}>
              <ProgressBar value={event.registeredCount} max={event.capacity} color={full ? colors.danger : colors.primary} />
            </IconRow>
            <InfoRow label={t('Đối tượng')} value={event.audience} />
            <InfoRow label={t('Liên hệ')} value={event.contact} />
            <Button title={t('Chia sẻ')} variant="soft" small onPress={share} />
          </Card>

          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text }}>{t('Giới thiệu')}</Text>
            <Text style={{ color: colors.text, lineHeight: 22 }}>{event.description}</Text>
          </View>

          {!!event.rules && (
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text }}>{t('Quy định')}</Text>
              <Text style={{ color: colors.text, lineHeight: 22 }}>{event.rules}</Text>
            </View>
          )}

          {user && user.role !== 'admin' && !isOwner && (
            <Pressable onPress={() => setReportOpen(true)}>
              <Text style={{ color: colors.muted, textDecorationLine: 'underline', textAlign: 'center' }}>{t('Báo cáo vi phạm')}</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {showBar && (
        <View style={{ padding: 14, paddingBottom: 14 + insets.bottom, backgroundColor: colors.card, borderTopWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          {isOwner ? (
            <Button title={t('Quản lý sự kiện này')} onPress={() => router.push(`/organizer/event/${event.id}` as any)} style={{ flex: 1 }} />
          ) : (
            <>
              <View>
                <Text style={{ color: colors.muted, fontSize: 12 }}>{t('Giá vé')}</Text>
                <Text style={{ fontSize: 20, fontWeight: '800', color: event.price === 0 ? colors.success : colors.text }}>{fmtPrice(event.price)}</Text>
              </View>
              {!user ? (
                <Button title={t('Đăng nhập để đặt vé')} onPress={() => router.push('/(auth)/login' as any)} style={{ flex: 1 }} />
              ) : mine ? (
                <Button title={t('Xem vé')} onPress={() => router.push(`/ticket/${event.id}` as any)} style={{ flex: 1 }} />
              ) : (
                <Button
                  title={
                    canRegister ? t('Đặt vé') : full && event.status === 'approved' ? t('Đã hết chỗ')
                      : event.status === 'ongoing' ? t('Sự kiện đang diễn ra') : t('Không nhận đặt vé')
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
        title={t('Báo cáo vi phạm')}
        placeholder={t('Mô tả nội dung sai lệch hoặc vi phạm…')}
        onCancel={() => setReportOpen(false)}
        onSubmit={sendReport}
      />
    </View>
  );
}

function IconRow({ icon, title, sub, children }: { icon: string; title: string; sub?: string; children?: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
      <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 17 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{title}</Text>
        {!!sub && <Text style={{ color: colors.muted, fontSize: 13 }}>{sub}</Text>}
        {children}
      </View>
    </View>
  );
}
