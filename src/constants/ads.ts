import { TestIds } from 'react-native-google-mobile-ads';

/**
 * ID đơn vị quảng cáo.
 * - Khi dev (__DEV__) luôn dùng ID TEST của Google để tránh bị khóa tài khoản vì tự bấm quảng cáo.
 * - Khi phát hành, thay 2 chuỗi 'ca-app-pub-xxx/yyy' bằng ID thật lấy từ https://admob.google.com
 */
const PROD = {
  banner: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy',
  interstitial: 'ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz',
};

export const AD_UNITS = {
  banner: __DEV__ ? TestIds.ADAPTIVE_BANNER : PROD.banner,
  interstitial: __DEV__ ? TestIds.INTERSTITIAL : PROD.interstitial,
};

/** Khoảng cách tối thiểu giữa 2 lần hiện quảng cáo toàn màn hình (ms) - chu kỳ 3 phút. */
export const INTERSTITIAL_COOLDOWN_MS = 3 * 60 * 1000;
