import { useEffect, useState } from 'react';
import { Switch, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { useRouter } from 'expo-router';
import { AuthApi, refreshProfile } from '@/api/services';
import { useApi } from '@/hooks/useApi';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/store/authStore';
import { Role } from '@/types';
import { confirmAction, showMessage } from '@/utils/dialog';
import { refreshReminders } from '@/utils/reminders';
import AppearanceSettings from './AppearanceSettings';
import { Badge, Button, Card, Input, Page, SectionTitle } from './ui';
import { useT } from '@/i18n';

const ROLE_LABEL: Record<Role, string> = {
  attendee: 'Người tham gia',
  organizer: 'Ban tổ chức',
  admin: 'Quản trị viên',
};

export default function ProfileView() {
  const { colors } = useTheme();
  const t = useT();
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
      showMessage(t('Đã lưu'), t('Thông tin cá nhân đã được cập nhật.'));
    } catch (e: any) {
      showMessage(t('Không lưu được'), e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (key: 'notifyReminder' | 'notifyUpdates', value: boolean) => {
    await updateUser({ ...user, [key]: value });
    try {
      await AuthApi.updateMe({ [key]: value });
    } catch (e: any) {
      showMessage(t('Không lưu được cài đặt'), e.message);
    }
    if (key === 'notifyReminder') refreshReminders();
  };

  const changePassword = async () => {
    setPwBusy(true);
    try {
      await AuthApi.changePassword(oldPw, newPw);
      setOldPw('');
      setNewPw('');
      showMessage(t('Đã đổi mật khẩu'));
    } catch (e: any) {
      showMessage(t('Không đổi được mật khẩu'), e.message);
    } finally {
      setPwBusy(false);
    }
  };

  const requestOrganizer = async () => {
    setReqBusy(true);
    try {
      const u = await AuthApi.requestOrganizer(orgName);
      await updateUser(u);
      showMessage(t('Đã gửi yêu cầu'), t('Quản trị viên sẽ xem xét và thông báo kết quả cho bạn.'));
    } catch (e: any) {
      showMessage(t('Không gửi được yêu cầu'), e.message);
    } finally {
      setReqBusy(false);
    }
  };

  const onLogout = () =>
    confirmAction(t('Đăng xuất'), t('Bạn có chắc muốn đăng xuất?'), async () => {
      await logout();
      router.replace('/(auth)/login' as any);
    });

  return (
    <Page>
      <Card style={{ alignItems: 'center', paddingVertical: 20 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.onPrimary, fontSize: 26, fontWeight: '800' }}>{user.name.trim().charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={{ fontSize: 19, fontWeight: '800', color: colors.text }}>{user.name}</Text>
        <Text style={{ color: colors.muted }}>{user.email}</Text>
        <Badge label={t(ROLE_LABEL[user.role])} color={colors.primaryDark} bg={colors.primarySoft} />
      </Card>

      <AppearanceSettings />

      <Card style={{ gap: 12 }}>
        <SectionTitle>{t('Thông tin cá nhân')}</SectionTitle>
        <Input label={t('Họ và tên')} value={name} onChangeText={setName} />
        <Input label={t('Số điện thoại')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder={t('Chưa cập nhật')} />
        {user.role === 'organizer' && <Input label={t('Tên đơn vị tổ chức')} value={orgName} onChangeText={setOrgName} />}
        <Button title={t('Lưu thay đổi')} onPress={save} loading={saving} />
      </Card>

      {user.role === 'attendee' && (
        <>
          <Card style={{ gap: 12 }}>
            <SectionTitle>{t('Cài đặt thông báo')}</SectionTitle>
            <Row label={t('Nhắc lịch trước sự kiện')} value={user.notifyReminder} onChange={(v) => toggle('notifyReminder', v)} />
            <Row label={t('Báo khi sự kiện thay đổi')} value={user.notifyUpdates} onChange={(v) => toggle('notifyUpdates', v)} />
          </Card>

          <Card style={{ gap: 10 }}>
            <SectionTitle>{t('Trở thành Ban tổ chức')}</SectionTitle>
            {user.organizerRequest === 'pending' ? (
              <Text style={{ color: colors.warning }}>{t('Yêu cầu của bạn ({org}) đang chờ quản trị viên xét duyệt.', { org: String(user.orgName ?? '') })}</Text>
            ) : (
              <>
                <Text style={{ color: colors.muted }}>
                  {user.organizerRequest === 'rejected'
                    ? t('Yêu cầu trước đó chưa được chấp nhận. Bạn có thể bổ sung thông tin và gửi lại.')
                    : t('Muốn tự tạo và quản lý sự kiện? Gửi yêu cầu để quản trị viên cấp quyền.')}
                </Text>
                <Input label={t('Tên đơn vị tổ chức')} value={orgName} onChangeText={setOrgName} placeholder={t('VD: CLB Sách Hà Nội')} />
                <Button title={t('Gửi yêu cầu')} variant="outline" onPress={requestOrganizer} loading={reqBusy} disabled={!orgName.trim()} />
              </>
            )}
          </Card>
        </>
      )}

      <Card style={{ gap: 12 }}>
        <SectionTitle>{t('Đổi mật khẩu')}</SectionTitle>
        <Input label={t('Mật khẩu hiện tại')} value={oldPw} onChangeText={setOldPw} secureTextEntry />
        <Input label={t('Mật khẩu mới')} value={newPw} onChangeText={setNewPw} secureTextEntry placeholder={t('Tối thiểu 6 ký tự')} />
        <Button title={t('Đổi mật khẩu')} variant="outline" onPress={changePassword} loading={pwBusy} disabled={!oldPw || !newPw} />
      </Card>

      <Button title={t('Đăng xuất')} variant="danger" onPress={onLogout} />
    </Page>
  );
}

function Row({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={{ color: colors.text, flex: 1 }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary }} />
    </View>
  );
}
