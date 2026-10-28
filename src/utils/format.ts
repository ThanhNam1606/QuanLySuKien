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
  if (!price) return 'Miễn phí';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
}

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
export function weekday(iso: string) {
  return WEEKDAYS[new Date(iso).getDay()];
}
export function dayOfMonth(iso: string) {
  return pad(new Date(iso).getDate());
}
export function monthLabel(iso: string) {
  return `Th${new Date(iso).getMonth() + 1}`;
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
