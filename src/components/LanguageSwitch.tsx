import { ComponentRef, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { AppText as Text } from './AppText';
import { Lang, useLang } from '@/i18n';

const OPTIONS: { code: Lang; short: string; name: string }[] = [
  { code: 'vi', short: 'VI', name: 'Tiếng Việt' },
  { code: 'en', short: 'EN', name: 'English' },
];

/**
 * Nút ngôn ngữ ở góc trên bên phải: chỉ hiện ngôn ngữ đang dùng (VI hoặc EN).
 * Bấm vào thì mở danh sách VI / EN ngay bên dưới nút. Lựa chọn được lưu cho lần mở app sau.
 */
export default function LanguageSwitch() {
  const { colors } = useTheme();
  const lang = useLang((s) => s.lang);
  const setLang = useLang((s) => s.setLang);
  const { width } = useWindowDimensions();
  const buttonRef = useRef<ComponentRef<typeof Pressable>>(null);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);

  const current = OPTIONS.find((o) => o.code === lang) ?? OPTIONS[0];

  // Đo vị trí nút để danh sách hiện đúng ngay dưới nút, căn lề phải.
  const open = () =>
    buttonRef.current?.measureInWindow((x, y, w, h) =>
      setPos({ top: y + h + 6, right: Math.max(8, width - (x + w)) }),
    );
  const close = () => setPos(null);

  return (
    <>
      <Pressable
        ref={buttonRef}
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel="Ngôn ngữ / Language"
        hitSlop={8}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
        }}
      >
        <Text style={{ fontWeight: '800', fontSize: 13, color: colors.primaryDark }}>{current.short}</Text>
        <Text style={{ fontSize: 10, color: colors.muted }}>▼</Text>
      </Pressable>

      <Modal visible={!!pos} transparent animationType="fade" statusBarTranslucent onRequestClose={close}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close}>
          {pos && (
            <View
              style={{
                position: 'absolute',
                top: pos.top,
                right: pos.right,
                minWidth: 170,
                backgroundColor: colors.card,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                paddingVertical: 4,
                shadowColor: '#000',
                shadowOpacity: 0.15,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 8,
              }}
            >
              {OPTIONS.map((o) => (
                <Pressable
                  key={o.code}
                  onPress={() => {
                    setLang(o.code);
                    close();
                  }}
                  accessibilityRole="menuitem"
                  accessibilityState={{ selected: lang === o.code }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 11 }}
                >
                  <Text style={{ width: 28, fontWeight: '800', color: colors.primaryDark }}>{o.short}</Text>
                  <Text style={{ flex: 1, color: colors.text, fontWeight: lang === o.code ? '700' : '400' }}>{o.name}</Text>
                  {lang === o.code && <Text style={{ color: colors.primary, fontWeight: '800' }}>✓</Text>}
                </Pressable>
              ))}
            </View>
          )}
        </Pressable>
      </Modal>
    </>
  );
}

/** Dùng cho `headerRight` của thanh tiêu đề: nút ngôn ngữ ở góc trên bên phải mọi màn hình có tiêu đề. */
export const languageHeaderRight = () => (
  <View style={{ marginRight: 12 }}>
    <LanguageSwitch />
  </View>
);
