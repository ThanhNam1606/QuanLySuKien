import { EventStatus, ReportSeverity } from '@/types';

export const colors = {
  primary: '#0f766e',
  primaryDark: '#115e59',
  primarySoft: '#ccfbf1',
  accent: '#b45309',
  accentSoft: '#fef3c7',
  bg: '#f4f5f3',
  card: '#ffffff',
  text: '#14231f',
  muted: '#5f6f6a',
  border: '#dfe4e1',
  danger: '#b91c1c',
  dangerSoft: '#fee2e2',
  success: '#15803d',
  successSoft: '#dcfce7',
  warning: '#b45309',
  warningSoft: '#fef3c7',
  info: '#1d4ed8',
  infoSoft: '#dbeafe',
  neutralSoft: '#eceeed',
};

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };

export const statusMeta: Record<EventStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Bản nháp', color: colors.muted, bg: colors.neutralSoft },
  pending: { label: 'Chờ duyệt', color: colors.warning, bg: colors.warningSoft },
  approved: { label: 'Đã duyệt', color: colors.success, bg: colors.successSoft },
  rejected: { label: 'Bị từ chối', color: colors.danger, bg: colors.dangerSoft },
  ongoing: { label: 'Đang diễn ra', color: colors.info, bg: colors.infoSoft },
  ended: { label: 'Đã kết thúc', color: colors.muted, bg: colors.neutralSoft },
  hidden: { label: 'Đã bị ẩn', color: colors.danger, bg: colors.dangerSoft },
  cancelled: { label: 'Đã hủy', color: colors.danger, bg: colors.dangerSoft },
};

export const severityMeta: Record<ReportSeverity, { label: string; color: string; bg: string }> = {
  low: { label: 'Nhẹ', color: colors.muted, bg: colors.neutralSoft },
  medium: { label: 'Trung bình', color: colors.warning, bg: colors.warningSoft },
  high: { label: 'Nghiêm trọng', color: colors.danger, bg: colors.dangerSoft },
};
