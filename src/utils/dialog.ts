import { Alert, Platform } from 'react-native';

/** Hộp thoại thông báo, chạy được cả trên điện thoại và web. */
export function showMessage(title: string, message?: string) {
  if (Platform.OS === 'web') {
    globalThis.alert?.(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

/** Hộp thoại xác nhận trước thao tác quan trọng (xóa, hủy, khóa...). */
export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void,
  options: { confirmText?: string; destructive?: boolean } = {},
) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Hủy', style: 'cancel' },
    {
      text: options.confirmText ?? 'Đồng ý',
      style: options.destructive ? 'destructive' : 'default',
      onPress: onConfirm,
    },
  ]);
}
