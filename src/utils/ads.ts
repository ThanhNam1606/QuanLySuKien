import mobileAds, { AdEventType, InterstitialAd } from 'react-native-google-mobile-ads';
import { AD_UNITS, INTERSTITIAL_COOLDOWN_MS } from '@/constants/ads';

let interstitial: InterstitialAd | null = null;
let loaded = false;
let showing = false;
let lastShownAt = 0;

function loadInterstitial() {
  loaded = false;
  const ad = InterstitialAd.createForAdRequest(AD_UNITS.interstitial, {
    requestNonPersonalizedAdsOnly: true,
  });
  interstitial = ad;
  ad.addAdEventListener(AdEventType.LOADED, () => {
    loaded = true;
  });
  ad.addAdEventListener(AdEventType.ERROR, () => {
    loaded = false;
    // Nạp lại sau 30 giây nếu lỗi (mất mạng, hết quảng cáo...).
    setTimeout(() => {
      if (interstitial === ad) loadInterstitial();
    }, 30_000);
  });
  ad.load();
}

/** Gọi 1 lần khi app khởi động (trong app/_layout.tsx). */
export async function initAds() {
  try {
    await mobileAds().initialize();
    loadInterstitial();
  } catch {
    // Không có quảng cáo thì app vẫn phải dùng bình thường.
  }
}

/**
 * Chuyển trang kèm quảng cáo toàn màn hình.
 * - Nếu đã đủ 3 phút kể từ lần hiện trước và quảng cáo đã nạp xong: hiện quảng cáo,
 *   người dùng PHẢI đóng quảng cáo thì `onDone` (chuyển trang) mới chạy.
 * - Ngược lại: chạy `onDone` ngay để không chặn người dùng.
 */
export function showInterstitial(onDone: () => void) {
  if (showing) return; // đang hiện quảng cáo, bỏ qua lần bấm thêm

  const ad = interstitial;
  const due = Date.now() - lastShownAt >= INTERSTITIAL_COOLDOWN_MS;
  if (!ad || !loaded || !due) {
    onDone();
    return;
  }

  showing = true;
  const finish = () => {
    unsubscribeClosed();
    unsubscribeError();
    showing = false;
    onDone();
  };
  const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
    lastShownAt = Date.now();
    loadInterstitial(); // nạp sẵn cho lần sau
    finish();
  });
  const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, finish);
  ad.show().catch(finish);
}
