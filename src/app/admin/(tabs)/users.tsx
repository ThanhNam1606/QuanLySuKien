import { useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { AdminApi } from '@/api/services';
import { Badge, Button, Card, Chip, Empty, ErrorView, Input, Loading } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { useDebounced } from '@/hooks/useDebounced';
import { useAuth } from '@/store/authStore';
import { Role, User } from '@/types';
import { confirmAction, showMessage } from '@/utils/dialog';
import { fmtDate } from '@/utils/format';

const ROLES: { value: Role; label: string }[] = [
  { value: 'attendee', label: 'Người tham gia' },
  { value: 'organizer', label: 'Ban tổ chức' },
  { value: 'admin', label: 'Admin' },
];

export default function Users() {
  const me = useAuth((s) => s.user);
  const [q, setQ] = useState('');
  const dq = useDebounced(q);
  const [open, setOpen] = useState<string | null>(null);
  const { data, loading, error, refreshing, refresh, retry, reload } = useApi(() => AdminApi.users(dq.trim() || undefined), [dq]);

  const act = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      reload();
    } catch (e: any) {
      showMessage('Không thực hiện được', e.message);
    }
  };

  const setRole = (u: User, role: Role) => {
    if (u.role === role) return;
    confirmAction('Đổi vai trò', `Đổi vai trò của ${u.name} thành "${ROLES.find((r) => r.value === role)?.label}"?`, () =>
      act(() => AdminApi.updateUser(u.id, { role })),
    );
  };

  const toggleLock = (u: User) =>
    confirmAction(
      u.locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản',
      u.locked ? `Cho phép ${u.name} đăng nhập trở lại?` : `${u.name} sẽ không thể đăng nhập cho đến khi được mở khóa.`,
      () => act(() => AdminApi.updateUser(u.id, { locked: !u.locked })),
      { confirmText: u.locked ? 'Mở khóa' : 'Khóa', destructive: !u.locked },
    );

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={retry} />;

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      data={data ?? []}
      keyExtractor={(u) => u.id}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      ListHeaderComponent={<Input value={q} onChangeText={setQ} placeholder="Tìm theo tên, email hoặc mã tài khoản" />}
      ListEmptyComponent={<Empty text="Không tìm thấy người dùng" />}
      renderItem={({ item: u }) => {
        const self = u.id === me?.id;
        const expanded = open === u.id;
        return (
          <Card style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '800', color: colors.text }}>{u.name}{self ? ' (bạn)' : ''}</Text>
                <Text style={{ color: colors.muted }}>{u.email}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>Tham gia {fmtDate(u.createdAt)} · mã {u.id}</Text>
              </View>
              <View style={{ gap: 6, alignItems: 'flex-end' }}>
                <Badge label={ROLES.find((r) => r.value === u.role)!.label} color={colors.primaryDark} bg={colors.primarySoft} />
                {u.locked && <Badge label="Đã khóa" color={colors.danger} bg={colors.dangerSoft} />}
              </View>
            </View>

            {u.organizerRequest === 'pending' && (
              <View style={{ backgroundColor: colors.warningSoft, padding: 12, borderRadius: 10, gap: 8 }}>
                <Text style={{ color: colors.warning, fontWeight: '700' }}>Yêu cầu làm Ban tổ chức: {u.orgName}</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Button title="Chấp nhận" small onPress={() => act(() => AdminApi.decideOrganizer(u.id, true))} style={{ flex: 1 }} />
                  <Button title="Từ chối" small variant="danger" onPress={() => act(() => AdminApi.decideOrganizer(u.id, false))} style={{ flex: 1 }} />
                </View>
              </View>
            )}

            {!self && (
              <>
                <Button title={expanded ? 'Thu gọn' : 'Quản lý tài khoản'} variant="ghost" small onPress={() => setOpen(expanded ? null : u.id)} />
                {expanded && (
                  <View style={{ gap: 10 }}>
                    <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600' }}>Vai trò</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {ROLES.map((r) => (
                        <Chip key={r.value} label={r.label} active={u.role === r.value} onPress={() => setRole(u, r.value)} />
                      ))}
                    </View>
                    <Button
                      title={u.locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                      variant={u.locked ? 'outline' : 'danger'}
                      small
                      onPress={() => toggleLock(u)}
                    />
                  </View>
                )}
              </>
            )}
          </Card>
        );
      }}
    />
  );
}
