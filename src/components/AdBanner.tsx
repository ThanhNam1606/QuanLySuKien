import { useRef } from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize, useForeground } from 'react-native-google-mobile-ads';
import { AD_UNITS } from '@/constants/ads';

/** Banner thích ứng theo chiều rộng màn hình, đặt ở cuối màn hình. */
export default function AdBanner() {
  const ref = useRef<BannerAd>(null);

  // iOS: banner có thể trắng khi app quay lại từ nền, nên nạp lại.
  useForeground(() => {
    ref.current?.load();
  });

  return (
    <View style={{ alignItems: 'center', backgroundColor: '#fff' }}>
      <BannerAd
        ref={ref}
        unitId={AD_UNITS.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}
