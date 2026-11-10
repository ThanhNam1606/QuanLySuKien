import { createContext, useContext } from 'react';
import { StyleSheet, Text as RNText, TextProps } from 'react-native';
import { FONT_SCALES } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';

const Nested = createContext(false);

const INTER: Record<string, string> = {
  '100': 'Inter_400Regular', '200': 'Inter_400Regular', '300': 'Inter_400Regular', '400': 'Inter_400Regular',
  normal: 'Inter_400Regular', '500': 'Inter_500Medium', '600': 'Inter_600SemiBold',
  '700': 'Inter_700Bold', bold: 'Inter_700Bold',
};
/** Tiêu đề và số (fontWeight 800+) dùng Plus Jakarta Sans, còn lại dùng Inter. */
const JAKARTA: Record<string, string> = { '800': 'PlusJakartaSans_800ExtraBold', '900': 'PlusJakartaSans_800ExtraBold' };

/**
 * Thay thế <Text>: tự nhân cỡ chữ theo cài đặt và chọn font theo độ đậm.
 * Dùng bằng `import { AppText as Text } from '@/components/AppText'` nên không phải sửa JSX.
 */
export function AppText({ style, children, ...rest }: TextProps) {
  const fontScale = useThemeStore((s) => s.fontScale);
  const nested = useContext(Nested);
  const k = FONT_SCALES[fontScale];
  const flat = (StyleSheet.flatten(style) ?? {}) as Record<string, any>;

  const out: Record<string, any> = {};
  if (flat.fontSize != null) out.fontSize = Math.round(flat.fontSize * k * 10) / 10;
  else if (!nested) out.fontSize = Math.round(14 * k * 10) / 10;
  if (flat.lineHeight != null) out.lineHeight = Math.round(flat.lineHeight * k * 10) / 10;

  if (!flat.fontFamily && (flat.fontWeight != null || !nested)) {
    const w = String(flat.fontWeight ?? '400');
    out.fontFamily = JAKARTA[w] ?? INTER[w] ?? 'Inter_400Regular';
    out.fontWeight = 'normal'; // đã chọn đúng file font, tránh Android làm đậm lần nữa
  }

  return (
    <RNText {...rest} style={[flat, out]}>
      <Nested.Provider value={true}>{children}</Nested.Provider>
    </RNText>
  );
}
