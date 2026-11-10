import { create } from 'zustand';
import { AccentKey, CardStyle, FontScaleKey, ThemeMode } from '@/constants/theme';
import { storage } from '@/utils/storage';

const KEY = 'event_app_theme';

interface Persisted {
  mode: ThemeMode;
  accent: AccentKey;
  fontScale: FontScaleKey;
  cardStyle: CardStyle;
}

type ThemeState = Persisted & {
  loaded: boolean;
  load: () => Promise<void>;
  setMode: (v: ThemeMode) => void;
  setAccent: (v: AccentKey) => void;
  setFontScale: (v: FontScaleKey) => void;
  setCardStyle: (v: CardStyle) => void;
};

const DEFAULTS: Persisted = { mode: 'system', accent: 'purple', fontScale: 'medium', cardStyle: 'list' };

const persist = (s: Persisted) =>
  storage.set(KEY, JSON.stringify({ mode: s.mode, accent: s.accent, fontScale: s.fontScale, cardStyle: s.cardStyle }));

export const useThemeStore = create<ThemeState>((set, get) => {
  const update = (patch: Partial<Persisted>) => {
    set(patch);
    persist({ ...get(), ...patch });
  };
  return {
    ...DEFAULTS,
    loaded: false,
    load: async () => {
      try {
        const raw = await storage.get(KEY);
        if (raw) set({ ...DEFAULTS, ...JSON.parse(raw) });
      } catch {}
      set({ loaded: true });
    },
    setMode: (mode) => update({ mode }),
    setAccent: (accent) => update({ accent }),
    setFontScale: (fontScale) => update({ fontScale }),
    setCardStyle: (cardStyle) => update({ cardStyle }),
  };
});
