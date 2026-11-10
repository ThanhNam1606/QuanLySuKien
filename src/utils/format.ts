import { t, useLang } from '@/i18n';

const pad = (n: number) => String(n).padStart(2, '0');

export function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function fmtTime(iso: string) {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fmtDateTime(iso: string) {
  return `${fmtTime(iso)} ${fmtDate(iso)}`;
}

export function fmtRange(startIso: string, endIso: string) {
  const sameDay = fmtDate(startIso) === fmtDate(endIso);
  return sameDay
    ? `${fmtTime(startIso)} – ${fmtTime(endIso)}, ${fmtDate(startIso)}`
    : `${fmtDateTime(startIso)} – ${fmtDateTime(endIso)}`;
}

export function fmtPrice(price: number) {
  if (!price) return t('Miễn phí');
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
}

const WEEKDAYS = {
  vi: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function weekday(iso: string) {
  return WEEKDAYS[useLang.getState().lang][new Date(iso).getDay()];
}
export function dayOfMonth(iso: string) {
  return pad(new Date(iso).getDate());
}
export function monthLabel(iso: string) {
  const m = new Date(iso).getMonth();
  return useLang.getState().lang === 'en' ? MONTHS_EN[m] : `Th${m + 1}`;
}

/** Chuỗi YYYY-MM-DD HH:mm -> ISO (giờ địa phương). Trả về null nếu sai định dạng. */
export function parseDateTimeInput(text: string): string | null {
  const m = text.trim().match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export function toDateTimeInput(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Bỏ dấu tiếng Việt để tìm kiếm không phân biệt dấu. */
export function normalize(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

const WEEKDAYS_LONG = {
  vi: ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};
/** "Chủ nhật" / "Sunday" */
export function weekdayLong(iso: string) {
  return WEEKDAYS_LONG[useLang.getState().lang][new Date(iso).getDay()];
}
/** "21/12" */
export function fmtDayMonth(iso: string) {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}
/** "20 Th12" hoặc "20 Dec" */
export function fmtBadgeDate(iso: string) {
  return `${dayOfMonth(iso).replace(/^0/, '')} ${monthLabel(iso)}`;
}
/** Lấy phần cuối của địa chỉ làm tên thành phố: "Hoàn Kiếm, Hà Nội" -> "Hà Nội". */
export function cityOf(location: string) {
  const parts = location.split(',').map((x) => x.trim()).filter(Boolean);
  return parts[parts.length - 1] ?? location;
}
/** "Chủ nhật, 21/12 · Hà Nội" */
export function fmtEventLine(startIso: string, location: string) {
  return `${weekdayLong(startIso)}, ${fmtDayMonth(startIso)} · ${cityOf(location)}`;
}
/** 12 giờ kiểu "7:00 tối" (VI) hoặc "7:00 PM" (EN). */
export function fmtClock12(iso: string) {
  const d = new Date(iso);
  const h = d.getHours();
  const m = pad(d.getMinutes());
  if (useLang.getState().lang === 'en') return `${h % 12 === 0 ? 12 : h % 12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
  const part = h < 12 ? 'sáng' : h < 13 ? 'trưa' : h < 18 ? 'chiều' : 'tối';
  return `${h % 12 === 0 ? 12 : h % 12}:${m} ${part}`;
}
