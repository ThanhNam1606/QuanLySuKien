import { useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { AdminApi } from '@/api/services';
import { Button, Card, Empty, ErrorView, Input, Loading, Page, PromptModal, SectionTitle } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { confirmAction, showMessage } from '@/utils/dialog';

export default function Categories() {
  const { data, loading, error, refreshing, refresh, retry, reload } = useApi(AdminApi.categories, []);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [description, setDescription] = useState('');
  const [adding, setAdding] = useState(false);
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);

  const act = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      reload();
    } catch (e: any) {
      showMessage('Không thực hiện được', e.message);
    }
  };

  const add = async () => {
    setAdding(true);
    try {
      await AdminApi.createCategory({ name, icon, description });
      setName('');
      setIcon('');
      setDescription('');
      reload();
    } catch (e: any) {
      showMessage('Không thêm được', e.message);
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={retry} />;

  return (
    <Page refreshing={refreshing} onRefresh={refresh}>
      <Card style={{ gap: 12 }}>
        <SectionTitle>Thêm danh mục</SectionTitle>
        <Input label="Tên danh mục" value={name} onChangeText={setName} placeholder="VD: Giáo dục" />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ width: 90 }}><Input label="Biểu tượng" value={icon} onChangeText={setIcon} placeholder="📚" /></View>
          <View style={{ flex: 1 }}><Input label="Mô tả" value={description} onChangeText={setDescription} placeholder="Mô tả ngắn" /></View>
        </View>
        <Button title="Thêm danh mục" onPress={add} loading={adding} disabled={!name.trim()} />
      </Card>

      <SectionTitle>Tất cả danh mục ({data?.length ?? 0})</SectionTitle>
      {!data?.length && <Empty text="Chưa có danh mục" />}
      {data?.map((c) => (
        <Card key={c.id} style={{ gap: 10, opacity: c.active ? 1 : 0.7 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 28 }}>{c.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '800', color: colors.text }}>{c.name}</Text>
              <Text style={{ color: colors.muted, fontSize: 13 }}>{c.description || 'Chưa có mô tả'}</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{c.eventCount} sự kiện</Text>
            </View>
            <Switch value={c.active} onValueChange={(v) => act(() => AdminApi.updateCategory(c.id, { active: v }))} trackColor={{ true: colors.primary }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button title="Đổi tên" variant="outline" small style={{ flex: 1 }} onPress={() => setRenaming({ id: c.id, name: c.name })} />
            <Button
              title="Xóa"
              variant="danger"
              small
              style={{ flex: 1 }}
              onPress={() =>
                confirmAction('Xóa danh mục', `Xóa "${c.name}"? Chỉ xóa được khi không còn sự kiện nào thuộc danh mục này.`, () =>
                  act(() => AdminApi.deleteCategory(c.id)), { confirmText: 'Xóa', destructive: true })
              }
            />
          </View>
        </Card>
      ))}

      <PromptModal
        visible={!!renaming}
        title="Đổi tên danh mục"
        initialValue={renaming?.name ?? ''}
        submitLabel="Lưu"
        onCancel={() => setRenaming(null)}
        onSubmit={async (text) => {
          if (!renaming) return;
          try {
            await AdminApi.updateCategory(renaming.id, { name: text });
            setRenaming(null);
            reload();
          } catch (e: any) {
            showMessage('Không đổi được tên', e.message);
          }
        }}
      />
    </Page>
  );
}
