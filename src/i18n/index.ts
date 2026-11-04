import { useCallback } from 'react';
import { create } from 'zustand';
import { storage } from '@/utils/storage';
import { en } from './en';

export type Lang = 'vi' | 'en';
type Params = Record<string, string | number>;

const KEY = 'event_app_lang';
const warned = new Set<string>();

/**
 * Cách dùng: viết chuỗi gốc tiếng Việt làm khóa, ví dụ t('Đăng nhập').
 * - Tiếng Việt: trả lại đúng chuỗi gốc.
 * - Tiếng Anh: tra trong ./en.ts, chưa có bản dịch thì dùng tạm chuỗi gốc.
 * Chèn giá trị bằng {tên}: t('Còn {n} chỗ', { n: 5 }).
 */
export function translate(lang: Lang, text: string, params?: Params): string {
  let out = text;
  if (lang === 'en') {
    const hit = en[text];
    if (hit !== undefined) out = hit;
    else if (__DEV__ && !warned.has(text)) {
      warned.add(text);
      console.warn(`[i18n] Chưa có bản dịch tiếng Anh: "${text}"`);
    }
  }
  if (params) out = out.replace(/\{(\w+)\}/g, (m, k) => (k in params ? String(params[k]) : m));
  return out;
}

type LangState = {
  lang: Lang;
  load: () => Promise<void>;
  setLang: (lang: Lang) => Promise<void>;
};

export const useLang = create<LangState>((set) => ({
  lang: 'vi',
  load: async () => {
    const saved = await storage.get(KEY);
    if (saved === 'vi' || saved === 'en') set({ lang: saved });
  },
  setLang: async (lang) => {
    set({ lang });
    await storage.set(KEY, lang);
  },
}));

/** Dùng ngoài component (hàm tiện ích, xử lý sự kiện): lấy ngôn ngữ tại thời điểm gọi. */
export const t = (text: string, params?: Params) => translate(useLang.getState().lang, text, params);

/** Dùng trong component: đăng ký theo dõi ngôn ngữ nên giao diện tự vẽ lại khi người dùng đổi. */
export function useT() {
  const lang = useLang((s) => s.lang);
  return useCallback((text: string, params?: Params) => translate(lang, text, params), [lang]);
}
