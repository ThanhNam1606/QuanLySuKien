import { EventStatus, ReportSeverity } from '@/types';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Scheme = 'light' | 'dark';
export type AccentKey = 'purple' | 'blue' | 'pink' | 'orange' | 'green' | 'teal';
export type FontScaleKey = 'small' | 'medium' | 'large';
export type CardStyle = 'list' | 'grid' | 'poster';

/** 6 màu chủ đạo: main = nút/nhấn, dark = chữ trên nền nhạt & cuối gradient, soft = nền nhạt, bright = bản sáng dùng ở chế độ tối. */
export const ACCENTS: Record<AccentKey, { name: string; main: string; dark: string; soft: string; bright: string }> = {
  purple: { name: 'Tím', main: '#6C3BDB', dark: '#4A1FA0', soft: '#C4B5FD', bright: '#9B7BF0' },
  blue: { name: 'Xanh dương', main: '#2563EB', dark: '#1E3A8A', soft: '#BFDBFE', bright: '#60A5FA' },
  pink: { name: 'Hồng', main: '#DB2777', dark: '#9D174D', soft: '#FBCFE8', bright: '#F472B6' },
  orange: { name: 'Cam', main: '#C2410C', dark: '#7C2D12', soft: '#FED7AA', bright: '#FB923C' },
  green: { name: 'Xanh lá', main: '#15803D', dark: '#14532D', soft: '#BBF7D0', bright: '#4ADE80' },
  teal: { name: 'Xanh ngọc', main: '#0F766E', dark: '#134E4A', soft: '#99F6E4', bright: '#2DD4BF' },
};
export const ACCENT_KEYS = Object.keys(ACCENTS) as AccentKey[];

/** Hệ số cỡ chữ: nhỏ / vừa / lớn. */
export const FONT_SCALES: Record<FontScaleKey, number> = { small: 0.9, medium: 1, large: 1.15 };

export interface Colors {
  primary: string;
  primaryDark: string;
  primarySoft: string;
  accent: string;
  accentSoft: string;
  bg: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  danger: string;
  dangerSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  info: string;
  infoSoft: string;
  neutralSoft: string;
  onPrimary: string;
  placeholder: string;
  unreadBg: string;
  /** Hai màu của dải gradient (thẻ nổi bật, đầu trang chi tiết). */
  gradient: [string, string];
  /** Nền nút tròn đặt trên ảnh/gradient. */
  floatBtn: string;
  floatBtnFg: string;
}

export function buildColors(scheme: Scheme, accent: AccentKey): Colors {
  const A = ACCENTS[accent];
  if (scheme === 'dark') {
    return {
      primary: A.bright,
      primaryDark: A.soft,
      primarySoft: A.dark + 'cc',
      accent: '#FBBF24',
      accentSoft: '#3A2A0E',
      bg: '#14111F',
      card: '#1E1A2E',
      text: '#F1EEFA',
      muted: '#A9A3C2',
      border: '#2F2A45',
      danger: '#F87171',
      dangerSoft: '#3B1620',
      success: '#4ADE80',
      successSoft: '#12301F',
      warning: '#FBBF24',
      warningSoft: '#3A2A0E',
      info: '#60A5FA',
      infoSoft: '#14284A',
      neutralSoft: '#2A2640',
      onPrimary: '#14111F',
      placeholder: '#7C7699',
      unreadBg: A.dark + '55',
      gradient: [A.main, A.dark],
      floatBtn: '#1E1A2Ecc',
      floatBtnFg: '#F1EEFA',
    };
  }
  return {
    primary: A.main,
    primaryDark: A.dark,
    primarySoft: A.soft,
    accent: '#B45309',
    accentSoft: '#FEF3C7',
    bg: '#F8F7FC',
    card: '#FFFFFF',
    text: '#25213A',
    muted: '#625E7D',
    border: '#E4E1F0',
    danger: '#B91C1C',
    dangerSoft: '#FEE2E2',
    success: '#15803D',
    successSoft: '#DCFCE7',
    warning: '#B45309',
    warningSoft: '#FEF3C7',
    info: '#1D4ED8',
    infoSoft: '#DBEAFE',
    neutralSoft: '#ECEAF4',
    onPrimary: '#FFFFFF',
    placeholder: '#9A96B3',
    unreadBg: A.soft + '55',
    gradient: [A.main, A.dark],
    floatBtn: '#FFFFFF',
    floatBtnFg: '#25213A',
  };
}

/** Bảng màu sáng + tím mặc định, chỉ dùng cho code ngoài component. Trong component hãy dùng useTheme(). */
export const colors = buildColors('light', 'purple');

export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 };

type Meta = { label: string; color: string; bg: string };

export const getStatusMeta = (c: Colors): Record<EventStatus, Meta> => ({
  draft: { label: 'Bản nháp', color: c.muted, bg: c.neutralSoft },
  pending: { label: 'Chờ duyệt', color: c.warning, bg: c.warningSoft },
  approved: { label: 'Đã duyệt', color: c.success, bg: c.successSoft },
  rejected: { label: 'Bị từ chối', color: c.danger, bg: c.dangerSoft },
  ongoing: { label: 'Đang diễn ra', color: c.info, bg: c.infoSoft },
  ended: { label: 'Đã kết thúc', color: c.muted, bg: c.neutralSoft },
  hidden: { label: 'Đã bị ẩn', color: c.danger, bg: c.dangerSoft },
  cancelled: { label: 'Đã hủy', color: c.danger, bg: c.dangerSoft },
});

export const getSeverityMeta = (c: Colors): Record<ReportSeverity, Meta> => ({
  low: { label: 'Nhẹ', color: c.muted, bg: c.neutralSoft },
  medium: { label: 'Trung bình', color: c.warning, bg: c.warningSoft },
  high: { label: 'Nghiêm trọng', color: c.danger, bg: c.dangerSoft },
});
