import { useEffect, useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthApi, refreshProfile } from '@/api/services';
import { useApi } from '@/hooks/useApi';
import { colors } from '@/constants/theme';
import { useAuth } from '@/store/authStore';
import { Role } from '@/types';
import { confirmAction, showMessage } from '@/utils/dialog';
import { Badge, Button, Card, Input, Page, SectionTitle } from './ui';

const ROLE_LABEL: Record<Role, string> = {
  attendee: 'Người tham gia',
  organizer: 'Ban tổ chức',
  admin: 'Quản trị viên',
};

export default function ProfileView() {
  const router = useRouter();
  const user = useAuth((s) => s.user)!;
  const updateUser = useAuth((s) => s.updateUser);
  const logout = useAuth((s) => s.logout);

  // Mỗi lần mở lại tab, lấy hồ sơ mới nhất (vd: vừa được duyệt làm Ban tổ chức)
  useApi(refreshProfile, []);

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [orgName, setOrgName] = useState(user.orgName ?? '');
  const [saving, setSaving] = useState(false);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [reqBusy, setReqBusy] = useState(false);

  useEffect(() => {
    setName(user.name);
    setPhone(user.phone ?? '');
  }, [user.name, user.phone]);

  const save = async () => {
    setSaving(true);
    try {
      const u = await AuthApi.updateMe({
        name,
        phone,
        ...(user.role === 'organizer' ? { orgName } : {}),
      });
      await updateUser(u);
      showMessage('Đã lưu', 'Thông tin cá nhân đã được cập nhật.');
    } catch (e: any) {
      showMessage('Không lưu được', e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (key: 'notifyReminder' | 'notifyUpdates', value: boolean) => {
    await updateUser({ ...user, [key]: value });
    try {
      await AuthApi.updateMe({ [key]: value });
    } catch (e: any) {
      showMessage('Không lưu được cài đặt', e.message);
    }
  };

  const changePassword = async () => {
    setPwBusy(true);
    try {
      await AuthApi.changePassword(oldPw, newPw);
      setOldPw('');
      setNewPw('');
      showMessage('Đã đổi mật khẩu');
    } catch (e: any) {
      showMessage('Không đổi được mật khẩu', e.message);
    } finally {
      setPwBusy(false);
    }
  };

  const requestOrganizer = async () => {
    setReqBusy(true);
    try {
      const u = await AuthApi.requestOrganizer(orgName);
      await updateUser(u);
      showMessage('Đã gửi yêu cầu', 'Quản trị viên sẽ xem xét và thông báo kết quả cho bạn.');
    } catch (e: any) {
      showMessage('Không gửi được yêu cầu', e.message);
    } finally {
      setReqBusy(false);
    }
  };

  const onLogout = () =>
    confirmAction('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', async () => {
      await logout();
      router.replace('/(auth)/login' as any);
    });

  return (
    <Page>
      <Card style={{ alignItems: 'center', paddingVertical: 20 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800' }}>{user.name.trim().charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={{ fontSize: 19, fontWeight: '800', color: colors.text }}>{user.name}</Text>
        <Text style={{ color: colors.muted }}>{user.email}</Text>
        <Badge label={ROLE_LABEL[user.role]} color={colors.primaryDark} bg={colors.primarySoft} />
      </Card>

      <Card style={{ gap: 12 }}>
        <SectionTitle>Thông tin cá nhân</SectionTitle>
        <Input label="Họ và tên" value={name} onChangeText={setName} />
        <Input label="Số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Chưa cập nhật" />
        {user.role === 'organizer' && <Input label="Tên đơn vị tổ chức" value={orgName} onChangeText={setOrgName} />}
        <Button title="Lưu thay đổi" onPress={save} loading={saving} />
      </Card>

      {user.role === 'attendee' && (
        <>
          <Card style={{ gap: 12 }}>
            <SectionTitle>Cài đặt thông báo</SectionTitle>
            <Row label="Nhắc lịch trước sự kiện" value={user.notifyReminder} onChange={(v) => toggle('notifyReminder', v)} />
            <Row label="Báo khi sự kiện thay đổi" value={user.notifyUpdates} onChange={(v) => toggle('notifyUpdates', v)} />
          </Card>

          <Card style={{ gap: 10 }}>
            <SectionTitle>Trở thành Ban tổ chức</SectionTitle>
            {user.organizerRequest === 'pending' ? (
              <Text style={{ color: colors.warning }}>Yêu cầu của bạn ({user.orgName}) đang chờ quản trị viên xét duyệt.</Text>
            ) : (
              <>
                <Text style={{ color: colors.muted }}>
                  {user.organizerRequest === 'rejected'
                    ? 'Yêu cầu trước đó chưa được chấp nhận. Bạn có thể bổ sung thông tin và gửi lại.'
                    : 'Muốn tự tạo và quản lý sự kiện? Gửi yêu cầu để quản trị viên cấp quyền.'}
                </Text>
                <Input label="Tên đơn vị tổ chức" value={orgName} onChangeText={setOrgName} placeholder="VD: CLB Sách Hà Nội" />
                <Button title="Gửi yêu cầu" variant="outline" onPress={requestOrganizer} loading={reqBusy} disabled={!orgName.trim()} />
              </>
            )}
          </Card>
        </>
      )}

      <Card style={{ gap: 12 }}>
        <SectionTitle>Đổi mật khẩu</SectionTitle>
        <Input label="Mật khẩu hiện tại" value={oldPw} onChangeText={setOldPw} secureTextEntry />
        <Input label="Mật khẩu mới" value={newPw} onChangeText={setNewPw} secureTextEntry placeholder="Tối thiểu 6 ký tự" />
        <Button title="Đổi mật khẩu" variant="outline" onPress={changePassword} loading={pwBusy} disabled={!oldPw || !newPw} />
      </Card>

      <Button title="Đăng xuất" variant="danger" onPress={onLogout} />
    </Page>
  );
}

function Row({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={{ color: colors.text, flex: 1 }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary }} />
    </View>
  );
}
