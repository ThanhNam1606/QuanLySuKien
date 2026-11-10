import { useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { buildColors, Scheme, FONT_SCALES } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';

/** Nguồn duy nhất của màu, chế độ sáng/tối và cỡ chữ trong component. */
export function useTheme() {
  const mode = useThemeStore((s) => s.mode);
  const accent = useThemeStore((s) => s.accent);
  const fontScale = useThemeStore((s) => s.fontScale);
  const cardStyle = useThemeStore((s) => s.cardStyle);
  const system = useColorScheme();

  const scheme: Scheme = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
  const colors = useMemo(() => buildColors(scheme, accent), [scheme, accent]);
  const factor = FONT_SCALES[fontScale];
  /** Nhân cỡ chữ theo lựa chọn của người dùng: fs(15) -> 14 / 15 / 17. */
  const fs = useCallback((n: number) => Math.round(n * factor * 10) / 10, [factor]);

  return { colors, scheme, isDark: scheme === 'dark', mode, accent, fontScale, cardStyle, fs };
}

export const useColors = () => useTheme().colors;
