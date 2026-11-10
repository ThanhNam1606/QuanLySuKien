import { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { ACCENT_KEYS, ACCENTS, CardStyle, FontScaleKey, ThemeMode } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/themeStore';
import { useT } from '@/i18n';
import { AppText as Text } from './AppText';
import LanguageSwitch from './LanguageSwitch';
import { Card, SectionTitle } from './ui';

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { key: T; label: string }[]; onChange: (v: T) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.neutralSoft, borderRadius: 12, padding: 3 }}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={{ flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center', backgroundColor: on ? colors.card : 'transparent' }}
          >
            <Text style={{ fontSize: 13, fontWeight: on ? '700' : '500', color: on ? colors.primary : colors.muted }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.muted }}>{title}</Text>
      {children}
    </View>
  );
}

/** 5 khối: Chế độ, Màu chủ đạo, Kích thước chữ, Loại thẻ sự kiện, Ngôn ngữ. */
export default function AppearanceSettings() {
  const t = useT();
  const { colors, mode, accent, fontScale, cardStyle } = useTheme();
  const set = useThemeStore.getState();

  return (
    <Card style={{ gap: 16 }}>
      <SectionTitle>{t('Giao diện')}</SectionTitle>

      <Block title={t('Chế độ')}>
        <Segmented<ThemeMode>
          value={mode}
          onChange={set.setMode}
          options={[{ key: 'light', label: t('Sáng') }, { key: 'dark', label: t('Tối') }, { key: 'system', label: t('Hệ thống') }]}
        />
      </Block>

      <Block title={t('Màu chủ đạo')}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {ACCENT_KEYS.map((k) => {
            const on = k === accent;
            return (
              <Pressable
                key={k}
                onPress={() => set.setAccent(k)}
                accessibilityRole="button"
                accessibilityLabel={t(ACCENTS[k].name)}
                accessibilityState={{ selected: on }}
                style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: on ? colors.text : 'transparent' }}
              >
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: ACCENTS[k].main, alignItems: 'center', justifyContent: 'center' }}>
                  {on && <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>✓</Text>}
                </View>
              </Pressable>
            );
          })}
        </View>
      </Block>

      <Block title={t('Cỡ chữ')}>
        <Segmented<FontScaleKey>
          value={fontScale}
          onChange={set.setFontScale}
          options={[{ key: 'small', label: t('Nhỏ') }, { key: 'medium', label: t('Vừa') }, { key: 'large', label: t('Lớn') }]}
        />
      </Block>

      <Block title={t('Loại thẻ sự kiện')}>
        <Segmented<CardStyle>
          value={cardStyle}
          onChange={set.setCardStyle}
          options={[{ key: 'list', label: t('Danh sách') }, { key: 'grid', label: t('Lưới') }, { key: 'poster', label: t('Poster') }]}
        />
      </Block>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.muted }}>{t('Ngôn ngữ')}</Text>
        <LanguageSwitch />
      </View>
    </Card>
  );
}
