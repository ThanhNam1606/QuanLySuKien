# EventApp – Ứng dụng quản lý sự kiện
#Link Báo cáo BTL: https://1drv.ms/w/c/a285388a2c142c54/IQDaOZcNHeoQT6UhNLrMxYx7AZ8iwTPtJuljO7pRU5qmp0U?e=1d8xtg
# LINK VIDEO:
# EventApp – Ứng dụng quản lý sự kiện (React Native + Expo + axios mock API + Google AdMob)

Ứng dụng di động quản lý và tham gia sự kiện, dành cho 3 vai trò: **Người tham gia**, **Ban tổ chức** và **Admin**.
Toàn bộ dữ liệu chạy bằng **mock API** (axios + adapter giả lập), không cần backend. Ứng dụng đã tích hợp
**Google AdMob**, lưu dữ liệu bền trên máy, nhắc lịch, thêm sự kiện vào lịch điện thoại và hỗ trợ **Tiếng Việt / English**.

## Mục lục

1. [Công nghệ](#công-nghệ)
2. [Cài đặt và chạy dự án](#cài-đặt-và-chạy-dự-án)
3. [Tài khoản thử nghiệm](#tài-khoản-thử-nghiệm-mật-khẩu-123456)
4. [Chức năng](#chức-năng)
5. [Quảng cáo Google AdMob](#quảng-cáo-google-admob)
6. [Lưu dữ liệu bền](#lưu-dữ-liệu-bền)
7. [Ảnh bìa, thêm vào lịch, nhắc lịch](#ảnh-bìa-thêm-vào-lịch-nhắc-lịch)
8. [Đa ngôn ngữ](#đa-ngôn-ngữ)
9. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
10. [Nối backend thật](#nối-backend-thật)
11. [Làm việc nhóm với Git](#làm-việc-nhóm-với-git)
12. [Xử lý sự cố](#xử-lý-sự-cố)
13. [Chưa có và hướng phát triển](#chưa-có-và-hướng-phát-triển)

## Công nghệ

| Nhóm       | Thư viện                                                                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nền tảng   | Expo SDK 58, React Native 0.88, React 19, TypeScript (strict)                                                                                             |
| Điều hướng | Expo Router (theo cấu trúc thư mục)                                                                                                                       |
| Dữ liệu    | axios + mock adapter, Zustand (phiên đăng nhập, ngôn ngữ)                                                                                                 |
| Lưu trữ    | `expo-secure-store` (phiên, ngôn ngữ), `expo-file-system` (dữ liệu mock)                                                                                  |
| Tính năng  | `expo-camera` (quét QR), `react-native-qrcode-svg` (vé), `expo-image-picker` (ảnh bìa), `expo-calendar` (thêm vào lịch), `expo-notifications` (nhắc lịch) |
| Quảng cáo  | `react-native-google-mobile-ads` (AdMob)                                                                                                                  |

## Cài đặt và chạy dự án

### Yêu cầu

- Node.js và npm.
- Tài khoản **Expo** miễn phí tại https://expo.dev (để build bản chạy trên điện thoại).
- Điện thoại **Android** (hoặc trình duyệt nếu chỉ chạy web).
- Ổ đĩa còn trống tối thiểu 3 đến 5 GB cho `node_modules` và bộ nhớ đệm.

### Bước 1: Cài thư viện

```powershell
cd D:\QuanLySuKien-main\QuanLySuKien-main
npm install
```

### Bước 2: Chọn cách chạy

Dự án dùng thư viện native (AdMob, chọn ảnh, lịch, thông báo) nên **không chạy được trên Expo Go**. Có hai cách:

#### Cách A: Chạy trên web (nhanh, để sửa giao diện và logic)

```powershell
npx expo start
```

Nhấn `w` để mở trình duyệt. Trên web: không có quảng cáo, nhắc lịch và chọn ảnh từ thư viện (vẫn dán link ảnh được). Nút "Thêm vào lịch" mở Google Calendar.
Nếu gặp lỗi cache: `npx expo start -c`.

#### Cách B: Chạy trên điện thoại Android (đầy đủ tính năng)

Cần **bản development build** cài trên điện thoại. Build bằng đám mây của Expo (EAS), không cần cài Android Studio:

```powershell
npx eas-cli login
npx eas-cli build --profile development --platform android
```

Khi được hỏi:

- Tạo git repository: chọn **yes**.
- Cài `expo-dev-client`: chọn **y**.
- Tài khoản sở hữu project: chọn tài khoản **Personal**.
- Tạo Android Keystore: chọn **Yes**.
- Install and run on an emulator: chọn **n** (nếu chọn yes sẽ cố tải file về máy và có thể báo `ENOSPC`).

Build chạy trên máy chủ Expo, thường mất 10 đến 20 phút (bước `Run gradlew` lâu nhất). Có thể đóng terminal, build vẫn tiếp tục. Theo dõi tại expo.dev, mục **Projects → EventApp → Builds**.

Xong build:

1. Mở link build (hoặc quét mã QR) bằng **điện thoại Android**, bấm **Install** để tải file `.apk`.
2. Mở file và cài đặt. Cài đè lên app cũ, không cần gỡ. Nếu máy hỏi, cho phép cài từ nguồn không xác định.
3. Trên máy tính, chạy server:

```powershell
npx expo start --dev-client -c
```

4. Mở app **EventApp** trên điện thoại (không phải Expo Go) và chọn server trong danh sách. Điện thoại và máy tính phải **cùng Wi-Fi**. Nếu không thấy server:

```powershell
npx expo start --dev-client --tunnel -c
```

#### Khi nào phải build và cài lại `.apk`?

| Thay đổi                                     | Cần build lại?                 |
| -------------------------------------------- | ------------------------------ |
| Sửa code giao diện, logic, thêm bản dịch     | Không, lưu file rồi reload app |
| Thêm hoặc đổi thư viện native                | **Có**                         |
| Đổi `app.json` (plugin, quyền, App ID AdMob) | **Có**                         |

### Lưu ý khi ổ C gần đầy

Nếu gặp lỗi `ENOSPC: no space left on device`, chuyển bộ nhớ đệm và thư mục tạm sang ổ D:

```powershell
mkdir D:\npm-cache
mkdir D:\temp
npm config set cache D:\npm-cache
$env:TEMP = "D:\temp"
$env:TMP = "D:\temp"
```

Hai biến `TEMP` và `TMP` chỉ có hiệu lực trong cửa sổ PowerShell đang mở, mở cửa sổ mới phải đặt lại.

## Tài khoản thử nghiệm (mật khẩu `123456`)

| Vai trò        | Email                        |
| -------------- | ---------------------------- |
| Người tham gia | an@test.com, binh@test.com   |
| Ban tổ chức    | org@test.com, music@test.com |
| Admin          | admin@test.com               |

Màn hình đăng nhập có sẵn nút điền nhanh.

## Chức năng

### Dùng chung

- Đăng nhập, đăng ký, quên mật khẩu. Phiên đăng nhập lưu bằng `expo-secure-store`.
- Phân quyền: mỗi khu có layout kiểm tra vai trò và chuyển hướng. Mock API cũng trả lỗi 401/403 như server thật.
- Khách chưa đăng nhập xem được sự kiện công khai.
- Chi tiết sự kiện: chỉ đường trên Google Maps, chia sẻ, báo cáo vi phạm.
- Vé điện tử có mã QR.
- Hồ sơ: sửa thông tin, đổi mật khẩu, đổi ngôn ngữ, thông báo của tôi.

### Người tham gia

- **Khám phá:** sự kiện nổi bật, lọc theo danh mục.
- **Tìm kiếm** (không phân biệt dấu) kèm bộ lọc: danh mục, giá (mọi giá, miễn phí, có phí), thời gian (hôm nay, tuần này, tháng này), khu vực.
- **Đăng ký và hủy đăng ký**: báo lỗi khi hết chỗ, cảnh báo trùng lịch (cho phép đăng ký tiếp nếu xác nhận). Đã điểm danh thì không hủy được.
- **Yêu thích** sự kiện.
- **Lịch của tôi** gồm 3 nhóm: Sắp tới, Đã qua, Yêu thích.
- **Thêm vào lịch điện thoại** và **nhắc lịch** cho sự kiện đã đăng ký.
- Thông báo, yêu cầu trở thành Ban tổ chức.

### Ban tổ chức

- Tạo và sửa sự kiện bằng form, **chọn ảnh bìa từ thư viện**, lưu nháp, gửi duyệt, xem lý do bị từ chối rồi gửi lại, hủy sự kiện.
- Danh sách người đăng ký của từng sự kiện, **xuất CSV**, gửi thông báo cho người đã đăng ký.
- **Quét QR điểm danh** bằng camera hoặc nhập mã thủ công, chặn quét trùng.
- Thống kê đăng ký và điểm danh theo từng sự kiện.

### Admin

- Dashboard thống kê và hoạt động gần đây.
- Duyệt, từ chối (bắt buộc nhập lý do), ẩn, bỏ ẩn sự kiện.
- Quản lý danh mục: thêm, đổi tên, bật/tắt, xóa (có kiểm tra ràng buộc).
- Quản lý người dùng: tìm kiếm, đổi vai trò, khóa/mở khóa, duyệt yêu cầu làm Ban tổ chức.
- Xử lý báo cáo vi phạm: đổi trạng thái, mức độ, ẩn sự kiện.
- Gửi thông báo hệ thống và xem lịch sử gửi.

## Quảng cáo Google AdMob

### Chức năng

- **Banner Ads** ở cuối mọi màn hình.
- **Interstitial Ads** (toàn màn hình) hiện khi người dùng **chuyển sang trang khác** (đổi tab, mở chi tiết, mở vé, quay lại...). Quảng cáo phủ kín màn hình nên phải đóng thì mới thao tác tiếp được.
- Chu kỳ **3 phút**: sau một lần hiện, trong 3 phút tiếp theo chuyển trang không hiện quảng cáo. Lần đầu hiện ở lần chuyển trang đầu tiên (khi quảng cáo đã nạp xong).
- Bước tự chuyển hướng lúc mở app không tính là chuyển trang.
- Quảng cáo chưa nạp xong hoặc lỗi mạng thì bỏ qua, không chặn người dùng.
- Khi bàn phím mở (đăng nhập, đăng ký), banner tự ẩn.
- Trên web quảng cáo tắt vì AdMob không hỗ trợ trình duyệt.

### Cách hoạt động

1. `src/app/_layout.tsx` gọi `initAds()` một lần khi mở app: khởi tạo AdMob và nạp sẵn một Interstitial.
2. `AdFooter` nằm ở layout gốc nên xuất hiện ở mọi màn hình, và theo dõi đường dẫn trang bằng `usePathname`.
3. Mỗi khi đường dẫn đổi, `AdFooter` gọi `showInterstitial()`. Nếu đã đủ 3 phút và quảng cáo đã nạp xong thì hiện, sau khi đóng tự nạp quảng cáo mới cho lần sau.

### Các file liên quan

```
├── app.json                      Plugin AdMob (App ID)
├── eas.json                      Cấu hình build EAS
└── src/
    ├── components/AdBanner.tsx       Banner cho Android/iOS
    ├── components/AdBanner.web.tsx   Bản rỗng cho web
    ├── components/AdFooter.tsx       Banner cuối trang + hiện Interstitial khi đổi trang
    ├── constants/ads.ts              ID đơn vị quảng cáo, chu kỳ 3 phút
    ├── utils/ads.ts                  Khởi tạo AdMob, nạp và hiện Interstitial
    └── utils/ads.web.ts              Bản rỗng cho web
```

### Kiểm tra quảng cáo

- Mọi màn hình có banner ghi chữ **Test Ad**.
- Mở app, đợi vài giây cho quảng cáo nạp xong, đổi tab hoặc mở một sự kiện: quảng cáo toàn màn hình hiện ra, đóng xong mới dùng tiếp được.
- Chuyển trang tiếp trong vòng 3 phút: không có quảng cáo. Sau 3 phút: quảng cáo hiện lại.

### Chuyển sang quảng cáo thật khi phát hành

Hiện ứng dụng dùng **ID test của Google**. Trong chế độ dev (`__DEV__`), code luôn dùng ID test nên bấm thoải mái.

1. Đăng ký tại https://admob.google.com, thêm ứng dụng, tạo 2 đơn vị quảng cáo: **Banner** và **Interstitial**.
2. Trong `app.json`, thay 2 App ID test:

   ```json
   [
     "react-native-google-mobile-ads",
     {
       "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY",
       "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ"
     }
   ]
   ```

3. Trong `src/constants/ads.ts`, thay ID đơn vị quảng cáo:

   ```ts
   const PROD = {
     banner: "ca-app-pub-XXXXXXXXXXXXXXXX/AAAAAAAAAA",
     interstitial: "ca-app-pub-XXXXXXXXXXXXXXXX/BBBBBBBBBB",
   };
   ```

4. Đổi `package` (Android) và `bundleIdentifier` (iOS) trong `app.json` thành tên của bạn nếu cần.
5. Build bản phát hành: `npx eas-cli build --profile production --platform android`.

> **Cảnh báo:** không bao giờ tự bấm vào quảng cáo thật của chính mình. Google có thể xem đó là click giả và khóa tài khoản AdMob.

### Tùy chỉnh quảng cáo

| Việc cần làm                                   | Sửa ở đâu                                                                                     |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Đổi chu kỳ hiện quảng cáo                      | `INTERSTITIAL_COOLDOWN_MS` trong `src/constants/ads.ts`                                       |
| Hiện quảng cáo ở mọi lần chuyển trang          | Đặt `INTERSTITIAL_COOLDOWN_MS = 0`                                                            |
| Không hiện quảng cáo ngay lần chuyển trang đầu | Trong `src/utils/ads.ts`, đặt `let lastShownAt = Date.now();`                                 |
| Bỏ qua quảng cáo ở một số trang                | Thêm điều kiện theo `pathname` trước `showInterstitial()` trong `src/components/AdFooter.tsx` |

## Lưu dữ liệu bền

Dữ liệu mock không còn mất khi đóng mở app. Sau mỗi thao tác làm đổi dữ liệu (đăng ký sự kiện, tạo sự kiện, duyệt, đổi hồ sơ...), app ghi toàn bộ dữ liệu ra một file JSON trong bộ nhớ máy (trên web là `localStorage`), và nạp lại khi mở app.

- Khi app xuống nền, dữ liệu được ghi ngay.
- Bộ đếm id cũng được lưu để id mới không trùng id cũ.
- Lỗi đọc/ghi được bỏ qua: nếu không lưu được thì app dùng dữ liệu mẫu như ban đầu.
- Nếu đổi cấu trúc dữ liệu trong `src/api/mock/db.ts`, tăng hằng số `VERSION` trong `src/api/mock/persist.ts` để bỏ bản lưu cũ.

**Quay về dữ liệu mẫu ban đầu:** Cài đặt Android → Ứng dụng → EventApp → Bộ nhớ → Xóa dữ liệu. Lưu ý ngày của sự kiện mẫu tính theo ngày mở app lần đầu, nên sau vài ngày một số sự kiện mẫu sẽ thành "đã qua".

File chính: `src/api/mock/persist.ts`.

## Ảnh bìa, thêm vào lịch, nhắc lịch

### Ảnh bìa sự kiện

Trong form tạo/sửa sự kiện, Ban tổ chức bấm **Chọn ảnh từ thư viện**, cắt khung 16:9 và xem trước. Ảnh được sao chép vào bộ nhớ app. Vẫn có thể dán link ảnh. Trên web nút chọn ảnh bị ẩn. (`src/utils/pickImage.ts`, `src/app/organizer/form.tsx`)

### Thêm vào lịch điện thoại

Ở trang chi tiết sự kiện đã đăng ký, nút **Thêm vào lịch điện thoại** mở form của ứng dụng Lịch trên máy với tên, giờ, địa điểm, mô tả và nhắc trước 1 giờ đã điền sẵn. Vì dùng form hệ thống nên app không cần xin quyền lịch. Trên web mở Google Calendar. (`src/utils/calendar.ts`)

### Nhắc lịch

Đây là **thông báo hẹn giờ ngay trên máy** (local notification), không cần server: mỗi sự kiện đã đăng ký được nhắc **trước 1 ngày và trước 1 giờ**, kể cả khi đã đóng app.

- Lịch nhắc tự cập nhật khi đăng ký, hủy đăng ký, đăng nhập, đăng xuất, hoặc bật/tắt "Nhắc lịch trước sự kiện" trong hồ sơ.
- Sự kiện bị hủy, bị ẩn, đã điểm danh hoặc đã quá giờ nhắc thì không nhắc.
- Bấm vào thông báo mở trang chi tiết sự kiện.
- App chỉ xin quyền thông báo khi thật sự có lịch cần nhắc.
- Thông báo trên Android có thể trễ vài phút nếu máy đang tiết kiệm pin.
- Push từ server (khi đổi giờ, duyệt sự kiện...) cần thêm Firebase và backend thật, chưa có.

File chính: `src/utils/reminders.ts`, `src/components/ReminderBridge.tsx`.

**Cách thử nhắc lịch nhanh:** tạo sự kiện bắt đầu sau khoảng 1 giờ 5 phút bằng `org@test.com`, gửi duyệt; duyệt bằng `admin@test.com`; đăng ký bằng `an@test.com` và cho phép thông báo. Khoảng 5 phút sau thông báo "Diễn ra sau 1 giờ nữa" sẽ hiện.

## Đa ngôn ngữ

Ứng dụng hỗ trợ **Tiếng Việt** và **English**. Nút **VI | EN** nằm ở màn hình đăng nhập/đăng ký, đầu tab Khám phá và trong mục **Ngôn ngữ** của hồ sơ. Lựa chọn được lưu cho lần mở sau và áp dụng ngay, không cần khởi động lại.

### Trạng thái dịch

| Phần                                                                          | Trạng thái                |
| ----------------------------------------------------------------------------- | ------------------------- |
| Đăng nhập, đăng ký, quên mật khẩu                                             | Đã dịch                   |
| Các tab Người tham gia (Khám phá, Tìm kiếm, Lịch của tôi, Thông báo, Cá nhân) | Đã dịch                   |
| Thành phần dùng chung (nút, trạng thái rỗng, lỗi), nhãn trạng thái sự kiện    | Đã dịch                   |
| Chi tiết sự kiện, vé điện tử                                                  | Chưa dịch (đợt tiếp theo) |
| Khu Ban tổ chức                                                               | Chưa dịch                 |
| Khu Admin                                                                     | Chưa dịch                 |
| Thông báo lỗi từ mock API                                                     | Chưa dịch                 |

Nội dung dữ liệu mẫu (tên sự kiện, mô tả) giữ tiếng Việt vì đó là dữ liệu, không phải giao diện.

### Cách thêm chuỗi mới

Chuỗi tiếng Việt gốc là khóa. Trong code:

```tsx
import { useT } from "@/i18n";

function MyScreen() {
  const t = useT(); // trong component: tự vẽ lại khi đổi ngôn ngữ
  return <Text>{t("Xin chào, {name}", { name: "An" })}</Text>;
}
```

Ngoài component (hàm tiện ích, xử lý sự kiện) dùng `import { t } from '@/i18n'`. Sau đó thêm một dòng bản dịch vào `src/i18n/en.ts`:

```ts
"Xin chào, {name}": "Hello, {name}",
```

Chuỗi chưa có bản dịch sẽ hiện tiếng Việt và terminal in cảnh báo `[i18n] Chưa có bản dịch tiếng Anh: "..."` để dễ tìm. Với các nhãn khai báo ở cấp module (mảng, object hằng số), giữ tiếng Việt trong hằng số và gọi `t(nhãn)` lúc hiển thị.

## Cấu trúc thư mục

```
src/
├── app/                 Màn hình (Expo Router, theo thư mục)
│   ├── _layout.tsx      Layout gốc: nạp ngôn ngữ, khởi tạo AdMob, banner/Interstitial, nhắc lịch
│   ├── (auth)/          Đăng nhập, đăng ký, quên mật khẩu
│   ├── attendee/(tabs)/ Khu Người tham gia
│   ├── organizer/       Khu Ban tổ chức (tabs, event/[id], form)
│   ├── admin/           Khu Admin (tabs, categories, broadcast)
│   ├── event/[id].tsx   Chi tiết sự kiện (dùng chung)
│   └── ticket/[id].tsx  Vé điện tử QR
├── api/
│   ├── config.ts        USE_MOCK và BASE_URL
│   ├── client.ts        axios instance, interceptor token và lỗi
│   ├── services.ts      Các hàm gọi API theo vai trò
│   └── mock/            db.ts (dữ liệu), routes.ts (endpoint), adapter.ts, persist.ts (lưu bền)
├── components/          Button, Input, EventCard, ProfileView, AdBanner, AdFooter,
│                        LanguageSwitch, ReminderBridge, ...
├── constants/           theme.ts (màu sắc, nhãn trạng thái), ads.ts (ID quảng cáo, chu kỳ)
├── hooks/               useApi, useDebounced
├── i18n/                index.ts (bộ dịch, lưu ngôn ngữ), en.ts (từ điển tiếng Anh)
├── store/authStore.ts   Zustand: phiên đăng nhập
├── types/
└── utils/               format, dialog, storage, ads, calendar, reminders, pickImage
```

Các file có đuôi `.web.ts` / `.web.tsx` là bản dành riêng cho web (thường để rỗng khi tính năng chỉ có trên điện thoại).

Phân quyền: mỗi khu có `_layout.tsx` kiểm tra vai trò và chuyển hướng.

## Nối backend thật

1. Mở `src/api/config.ts`, đặt `USE_MOCK = false` và `BASE_URL` là địa chỉ server (dùng IP máy tính, không dùng `localhost` khi thử trên điện thoại).
2. Backend cần cung cấp các endpoint giống `src/api/mock/routes.ts` (danh sách trong `services.ts`). Không phải sửa màn hình nào.
3. Backend phải tự kiểm tra vai trò ở mỗi API, vì ẩn giao diện không đủ bảo mật.
4. Khi có backend thật, phần lưu dữ liệu bền (`persist.ts`) không còn cần thiết.

## Làm việc nhóm với Git

Phần quảng cáo và các nâng cấp gần đây nên làm trên nhánh riêng, không đẩy thẳng lên nhánh chính của nhóm:

```powershell
git checkout -b feature/admob
git add .
git commit -m "Mô tả thay đổi"
git push -u origin feature/admob
```

Sau đó tạo Pull Request trên GitHub để cả nhóm xem trước khi merge.

Lưu ý khi chia sẻ dự án:

- `extra.eas.projectId` trong `app.json` gắn với tài khoản Expo của người build đầu tiên. Thành viên khác muốn build bằng EAS cần chạy `npx eas-cli init` với tài khoản riêng.
- Không đưa `google-services.json` hay khóa bí mật lên repo công khai.

## Xử lý sự cố

| Triệu chứng                                                                    | Cách xử lý                                                                                                         |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `ENOSPC: no space left on device`                                              | Chuyển cache và thư mục tạm sang ổ D (xem phần Cài đặt)                                                            |
| Lỗi `EPERM` khi cài, `node_modules` hỏng                                       | Đóng VS Code, xóa bằng `cmd /c rmdir /s /q node_modules` rồi `npm install` lại                                     |
| `npx start` báo `could not determine executable to run`                        | Gõ nhầm lệnh, dùng `npx expo start --dev-client` hoặc `npm start`                                                  |
| Gõ `eas` báo không nhận ra lệnh                                                | Dùng `npx eas-cli ...`, hoặc thêm `D:\npm-global` vào PATH                                                         |
| Build EAS xong rồi báo `ENOSPC`                                                | Do chọn yes ở câu hỏi chạy trên emulator. Build vẫn ổn, tải `.apk` từ link build bằng điện thoại. Lần sau chọn `n` |
| Màn hình trắng khi mở app                                                      | Chạy lại `npx expo start --dev-client --tunnel -c`, hoặc lắc máy chọn Reload và xem lỗi trong terminal             |
| Báo thiếu module `expo-image-picker`, `expo-calendar`, `expo-notifications`... | Chưa cài thư viện hoặc chưa cài `.apk` mới. Chạy `npx expo install ...`, build lại và cài lại                      |
| Mở bằng Expo Go bị lỗi module native                                           | Bình thường. Dùng bản development build, hoặc chạy web                                                             |
| Không thấy quảng cáo                                                           | Phải dùng bản build EAS (không phải Expo Go), điện thoại có mạng, đợi vài giây cho quảng cáo nạp                   |
| Chuyển trang mà không có quảng cáo toàn màn hình                               | Bình thường nếu chưa đủ 3 phút kể từ lần hiện trước, hoặc quảng cáo chưa nạp xong                                  |
| Banner trắng hoặc trống                                                        | Thường do chưa nạp được quảng cáo (mạng yếu). Đợi hoặc mở lại app                                                  |
| Không nhận được thông báo nhắc                                                 | Kiểm tra quyền thông báo của app và mục "Nhắc lịch trước sự kiện" trong Cá nhân đang bật                           |
| Điện thoại không tìm thấy máy tính                                             | Cùng Wi-Fi, cho Node.js qua tường lửa Windows, hoặc dùng `--tunnel`                                                |
| Chọn EN nhưng một số chữ vẫn tiếng Việt                                        | Màn hình đó chưa được dịch (xem bảng trạng thái dịch)                                                              |
| Lỗi cache Metro                                                                | `npx expo start -c`                                                                                                |
| VS Code báo `INVALID_PLUGIN_IMPORT` trong `app.json`                           | Cảnh báo của tiện ích Expo Tools trong trình soạn thảo, bỏ qua nếu build vẫn chạy                                  |
| Build EAS có cảnh báo vàng ở `Run expo doctor`                                 | Chỉ là ghi chú kiểm tra, không làm build thất bại. Bấm vào biểu tượng bong bóng để đọc nội dung                    |
| `npm audit` báo vulnerabilities                                                | Bỏ qua, không chạy `npm audit fix --force` vì có thể làm hỏng phiên bản gói                                        |

## Chưa có và hướng phát triển

- Dịch tiếng Anh cho các màn hình còn lại (chi tiết sự kiện, vé, Ban tổ chức, Admin, thông báo lỗi của API).
- Backend thật, push notification từ server (cần Firebase).
- Lịch dạng tháng/tuần, đánh giá sau sự kiện, thanh toán vé có phí, quản lý địa điểm riêng.
- Điểm danh khi mất mạng (lưu tạm rồi đồng bộ sau).
- Nút "Khôi phục dữ liệu mẫu" ngay trong app.
- Kiểm thử tự động cho logic đăng ký, trùng lịch và điểm danh.
| Triệu chứng | Cách xử lý |
|---|---|
| `ENOSPC: no space left on device` khi cài | Chuyển cache sang ổ D: `npm config set cache D:\npm-cache`, và đặt `$env:TEMP = "D:\temp"`, `$env:TMP = "D:\temp"` |
| Lỗi `EPERM` khi cài, `node_modules` hỏng | Đóng VS Code, xóa bằng `cmd /c rmdir /s /q node_modules` rồi `npm install` lại |
| Gõ `eas` báo không nhận ra lệnh | Dùng `npx eas-cli ...`, hoặc thêm `D:\npm-global` vào PATH |
| Mở bằng Expo Go bị lỗi module native | Bình thường, AdMob không chạy trên Expo Go. Dùng bản development build hoặc chạy web |
| Không thấy quảng cáo | Đảm bảo đang dùng bản build EAS, điện thoại có mạng, đợi vài giây cho quảng cáo nạp |
| Bấm nút mà chuyển trang ngay, không có quảng cáo | Bình thường nếu chưa đủ 3 phút kể từ lần hiện trước, hoặc quảng cáo chưa nạp xong |
| Banner trắng hoặc trống | Thường do chưa nạp được quảng cáo (mạng yếu). Đợi hoặc mở lại app |
| Điện thoại không tìm thấy máy tính | Kiểm tra cùng Wi-Fi, tắt tường lửa chặn, hoặc dùng `--tunnel` |
| Lỗi cache Metro | `npx expo start -c` |
| VS Code báo `INVALID_PLUGIN_IMPORT` trong `app.json` | Cảnh báo của tiện ích Expo Tools trong trình soạn thảo, có thể bỏ qua nếu build vẫn chạy |
| `npm audit` báo 8 vulnerabilities | Bỏ qua, không chạy `npm audit fix --force` vì có thể làm hỏng phiên bản gói |

Lưu ý thêm:
- `google-services.json` **không cần** cho AdMob. Chỉ cần khi dùng Firebase (thông báo đẩy, đăng nhập Google...).
- Khi phát hành lên Google Play, nên khai báo việc dùng quảng cáo trong mục **Data safety** và **App content** của Play Console.

## Chưa có (có thể làm tiếp)

Nhắc lịch bằng push notification (`expo-notifications`), lịch dạng tháng/tuần, chọn ảnh từ thư viện,
thanh toán vé có phí, đánh giá sau sự kiện, quản lý địa điểm riêng.
