// Web không hỗ trợ AdMob: để hàm rỗng cho cùng một API.
export async function initAds() {}
export function showInterstitial(onDone: () => void) {
  onDone();
}
