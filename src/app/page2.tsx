import { Text } from 'react-native';
import { Card, Page } from '@/components/ui';
import { colors } from '@/constants/theme';

/** Trang 2: đích của nút "Chuyển sang trang 2". Chân trang (nút + banner) do layout gốc hiển thị. */
export default function Page2() {
  return (
    <Page>
      <Card style={{ gap: 8 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>Trang 2</Text>
        <Text style={{ color: colors.muted, lineHeight: 22 }}>
          Bạn đã đóng quảng cáo toàn màn hình và chuyển sang trang này thành công.
        </Text>
      </Card>
    </Page>
  );
}
