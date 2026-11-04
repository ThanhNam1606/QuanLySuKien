import { AppState, Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import { db, getCounter, setCounter } from './db';

/**
 * Lưu dữ liệu mock ra bộ nhớ máy để không mất khi đóng/mở lại app.
 * - Điện thoại: file JSON trong thư mục tài liệu của app (expo-file-system).
 * - Web: localStorage.
 * Mọi lỗi đọc/ghi đều được bỏ qua: nếu lưu không được thì app vẫn chạy như trước (dữ liệu mẫu).
 *
 * Đổi cấu trúc dữ liệu trong db.ts thì tăng VERSION để bỏ bản lưu cũ.
 */
const VERSION = 1;
const FILE_NAME = 'event_app_mock_db.json';
const WEB_KEY = 'event_app_mock_db';
const KEYS = [
  'users',
  'categories',
  'events',
  'registrations',
  'favorites',
  'reports',
  'notifications',
  'broadcasts',
  'logs',
] as const;

async function readRaw(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') return globalThis.localStorage?.getItem(WEB_KEY) ?? null;
    const file = new File(Paths.document, FILE_NAME);
    return file.exists ? await file.text() : null;
  } catch {
    return null;
  }
}

function writeRaw(text: string) {
  try {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(WEB_KEY, text);
      return;
    }
    const file = new File(Paths.document, FILE_NAME);
    if (!file.exists) file.create();
    file.write(text);
  } catch {
    // bỏ qua: không lưu được thì lần sau mở app sẽ dùng dữ liệu mẫu
  }
}

async function loadDb() {
  const raw = await readRaw();
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    if (saved?.version !== VERSION || typeof saved.data !== 'object' || !saved.data) return;
    for (const k of KEYS) {
      const arr = saved.data[k];
      const target = (db as any)[k] as unknown[];
      // Sửa tại chỗ (không thay mảng) để mọi nơi đang giữ tham chiếu tới db vẫn đúng.
      if (Array.isArray(arr)) target.splice(0, target.length, ...arr);
    }
    if (typeof saved.counter === 'number') setCounter(Math.max(getCounter(), saved.counter));
  } catch {
    // dữ liệu hỏng: dùng dữ liệu mẫu
  }
}

/** Promise hoàn tất khi đã nạp xong dữ liệu đã lưu. Adapter chờ nó trước request đầu tiên. */
let loaded = false;
export const dbReady: Promise<void> = loadDb().then(() => {
  loaded = true;
});

let timer: ReturnType<typeof setTimeout> | undefined;

function save() {
  timer = undefined;
  if (!loaded) return; // chưa nạp xong dữ liệu cũ thì không được ghi đè bằng dữ liệu mẫu
  const data: Record<string, unknown> = {};
  for (const k of KEYS) data[k] = (db as any)[k];
  writeRaw(JSON.stringify({ version: VERSION, counter: getCounter(), data }));
}

/** Gọi sau mỗi request có thể làm thay đổi dữ liệu. Gộp nhiều thay đổi liên tiếp thành một lần ghi. */
export function scheduleSave() {
  if (timer) return;
  timer = setTimeout(save, 300);
}

// Ghi ngay khi app xuống nền để không mất thay đổi nếu hệ thống tắt app.
AppState.addEventListener('change', (state) => {
  if (state !== 'active') {
    if (timer) clearTimeout(timer);
    save();
  }
});
