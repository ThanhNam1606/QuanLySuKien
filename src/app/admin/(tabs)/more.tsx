import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Page } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useAuth } from '@/store/authStore';
import { confirmAction } from '@/utils/dialog';

const ITEMS = [
  { icon: '🏷️', title: 'Danh mục sự kiện', desc: 'Thêm, đổi tên, bật/tắt, xóa danh mục', href: '/admin/categories' },
  { icon: '📣', title: 'Thông báo hệ thống', desc: 'Gửi thông báo tới người dùng và xem lịch sử gửi', href: '/admin/broadcast' },
  { icon: '👤', title: 'Tài khoản của tôi', desc: 'Thông tin cá nhân và đổi mật khẩu', href: '/admin/profile' },
];

export default function More() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  return (
    <Page>
      <Text style={{ color: colors.muted }}>Đăng nhập với tư cách {user?.name}</Text>
      {ITEMS.map((i) => (
        <Pressable key={i.href} onPress={() => router.push(i.href as any)}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Text style={{ fontSize: 26 }}>{i.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '800', color: colors.text }}>{i.title}</Text>
              <Text style={{ color: colors.muted }}>{i.desc}</Text>
            </View>
            <Text style={{ color: colors.muted, fontSize: 20 }}>›</Text>
          </Card>
        </Pressable>
      ))}
      <Button
        title="Đăng xuất"
        variant="danger"
        onPress={() =>
          confirmAction('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', async () => {
            await logout();
            router.replace('/(auth)/login' as any);
          })
        }
      />
    </Page>
  );
}
