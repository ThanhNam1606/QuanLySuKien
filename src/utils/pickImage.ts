import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';

/**
 * Mở thư viện ảnh, cho cắt tỉ lệ 16:9 (đúng khung ảnh bìa), rồi lưu một bản sao vào bộ nhớ app
 * để ảnh không biến mất khi hệ thống dọn bộ nhớ đệm.
 * Trả về URI của ảnh, hoặc null nếu người dùng hủy.
 */
export async function pickCoverImage(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.7,
  });
  if (result.canceled || !result.assets?.[0]) return null;

  const uri = result.assets[0].uri;
  try {
    const dest = new File(Paths.document, `cover_${Date.now()}.jpg`);
    new File(uri).copy(dest);
    return dest.uri;
  } catch {
    return uri; // không sao chép được thì dùng tạm ảnh gốc
  }
}
