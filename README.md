# EventApp – Ứng dụng quản lý sự kiện (React Native + Expo + axios mock API + Google AdMob)

Ứng dụng 3 vai trò: **Người tham gia**, **Ban tổ chức**, **Admin**. Toàn bộ dữ liệu chạy bằng **mock API**
(axios + adapter giả lập), không cần backend. Ứng dụng tích hợp **Google AdMob** (Banner + Interstitial).

## Mục lục

1. [Chạy dự án](#chạy-dự-án)
2. [Tài khoản thử nghiệm](#tài-khoản-thử-nghiệm-mật-khẩu-123456)
3. [Chức năng](#chức-năng)
4. [Quảng cáo Google AdMob](#quảng-cáo-google-admob)
5. [Cấu trúc](#cấu-trúc)
6. [Nối backend thật](#nối-backend-thật)
7. [Xử lý sự cố](#xử-lý-sự-cố)
8. [Chưa có](#chưa-có-có-thể-làm-tiếp)

## Chạy dự án

Cài thư viện (dùng cho mọi cách chạy bên dưới):

```bash
npm install
```

Có **hai cách chạy**, tùy bạn có cần xem quảng cáo hay không.

### Cách 1: Chạy trên web (nhanh nhất, không có quảng cáo)

```bash
npx expo start
```

Nhấn `w` để mở trên trình duyệt. Quảng cáo bị tắt trên web nên giao diện chạy bình thường, rất tiện để sửa giao diện và logic.
Nếu lỗi cache: `npx expo start -c`.

### Cách 2: Chạy trên điện thoại Android (có quảng cáo)

Vì dự án dùng thư viện native của AdMob, **không còn chạy được bằng Expo Go**. Bạn cần cài một **bản development build** lên điện thoại (xem chi tiết ở phần [Quảng cáo Google AdMob](#quảng-cáo-google-admob)):

```bash
npx eas-cli login
npx eas-cli build --profile development --platform android
```

Cài file `.apk` vừa build lên điện thoại, rồi chạy server:

```bash
npx expo start --dev-client
```

> Chỉ cần build lại khi thêm hoặc đổi **thư viện native** (ví dụ đổi App ID AdMob). Sửa code giao diện hoặc logic thông thường thì chỉ cần lưu file, app tự cập nhật.

## Tài khoản thử nghiệm (mật khẩu `123456`)

| Vai trò | Email |
|---|---|
| Người tham gia | an@test.com, binh@test.com |
| Ban tổ chức | org@test.com, music@test.com |
| Admin | admin@test.com |

Màn hình đăng nhập có sẵn nút điền nhanh. Dữ liệu mock nằm trong bộ nhớ nên **reload app là về dữ liệu mẫu**.

## Chức năng

**Người tham gia (khách xem được sự kiện công khai khi chưa đăng nhập)**
- Khám phá: sự kiện nổi bật, lọc theo danh mục
- Tìm kiếm (không phân biệt dấu) + lọc danh mục / giá / thời gian / khu vực
- Chi tiết sự kiện: bản đồ chỉ đường, chia sẻ, báo cáo vi phạm
- Đăng ký / hủy đăng ký, cảnh báo trùng lịch, kiểm tra hết chỗ
- Vé điện tử có mã QR, Lịch của tôi (sắp tới / đã qua / yêu thích), thông báo
- Hồ sơ, cài đặt thông báo, đổi mật khẩu, yêu cầu trở thành Ban tổ chức

**Ban tổ chức**
- Tạo / sửa sự kiện, lưu nháp, gửi duyệt, xem lý do bị từ chối và gửi lại, hủy sự kiện
- Danh sách người đăng ký, xuất CSV, gửi thông báo cho người đã đăng ký
- Quét QR điểm danh (camera) hoặc nhập mã thủ công, chặn quét trùng
- Thống kê đăng ký / điểm danh theo từng sự kiện

**Admin**
- Dashboard thống kê và hoạt động gần đây
- Duyệt / từ chối (bắt buộc lý do) / ẩn / bỏ ẩn sự kiện
- Quản lý danh mục (thêm, đổi tên, bật/tắt, xóa có kiểm tra ràng buộc)
- Quản lý người dùng: đổi vai trò, khóa/mở khóa, duyệt yêu cầu làm Ban tổ chức
- Xử lý báo cáo vi phạm (phân loại mức độ, ẩn sự kiện), gửi thông báo hệ thống

**Quảng cáo (mọi vai trò)**
- Banner Ads ở cuối mọi màn hình
- Nút "Chuyển sang trang 2" kèm quảng cáo toàn màn hình theo chu kỳ 3 phút

## Quảng cáo Google AdMob

### Chức năng

- **Banner Ads** hiển thị ở **cuối mọi màn hình** của ứng dụng.
- Dưới mỗi màn hình có nút **"Chuyển sang trang 2"**.
- Khi bấm nút, **Interstitial Ads** (quảng cáo toàn màn hình) hiện ra. Người dùng **phải đóng quảng cáo** thì mới được chuyển sang Trang 2.
- Quảng cáo toàn màn hình theo **chu kỳ 3 phút**: sau khi đã hiện một lần, trong 3 phút tiếp theo bấm nút sẽ chuyển trang ngay, không hiện quảng cáo.
- Nếu quảng cáo chưa nạp xong hoặc lỗi mạng, ứng dụng chuyển trang ngay để không chặn người dùng.
- Trên Trang 2, nút đổi thành **"Quay lại trang 1"** và cũng đi qua cùng cơ chế quảng cáo.

### Cách hoạt động

1. `src/app/_layout.tsx` gọi `initAds()` một lần khi mở app: khởi tạo AdMob và nạp sẵn một Interstitial.
2. `AdFooter` được đặt ở layout gốc nên xuất hiện ở mọi màn hình (đăng nhập, các tab, chi tiết sự kiện, vé, trang 2...).
3. Bấm nút gọi `showInterstitial(onDone)`:
   - Đã đủ 3 phút và quảng cáo đã nạp xong: hiện quảng cáo, chỉ khi người dùng đóng thì `onDone` (chuyển trang) mới chạy. Sau đó tự nạp quảng cáo mới cho lần sau.
   - Ngược lại: chạy `onDone` ngay.
4. Khi bàn phím đang mở (trang đăng nhập, đăng ký), chân trang tự ẩn để không che ô nhập.

### Các file liên quan

```
├── package.json                  react-native-google-mobile-ads, expo-dev-client
├── app.json                      Plugin AdMob (App ID), package, bundleIdentifier
├── eas.json                      Cấu hình build trên EAS (development/preview/production)
└── src/
    ├── app/_layout.tsx           Gọi initAds(), gắn chân trang quảng cáo cho mọi màn hình
    ├── app/page2.tsx             Trang 2 (đích của nút chuyển trang)
    ├── components/AdBanner.tsx   Banner cho Android/iOS
    ├── components/AdBanner.web.tsx  Bản rỗng cho web (AdMob không hỗ trợ web)
    ├── components/AdFooter.tsx   Chân trang: nút chuyển trang + banner
    ├── constants/ads.ts          ID đơn vị quảng cáo và chu kỳ 3 phút
    ├── utils/ads.ts              Khởi tạo AdMob, nạp và hiện Interstitial
    └── utils/ads.web.ts          Bản rỗng cho web
```

### Yêu cầu

- Node.js và npm.
- Tài khoản **Expo** miễn phí (https://expo.dev) để build bằng EAS.
- Điện thoại **Android** để cài bản build thử.
- Quảng cáo **không chạy trên Expo Go** và **không hiện trên web**, vì AdMob cần code native.

### Build và cài lên điện thoại

**Bước 1: Cài thư viện**

```powershell
cd D:\QuanLySuKien-main\QuanLySuKien-main
npm install
```

**Bước 2: Build bản development bằng EAS**

```powershell
npx eas-cli login
npx eas-cli build --profile development --platform android
```

Khi được hỏi:

- Tạo git repository: chọn **yes**.
- Cài `expo-dev-client`: chọn **y**.
- Tài khoản sở hữu project: chọn tài khoản **Personal**.
- Tạo Android Keystore: chọn **Yes**.
- Chạy trên emulator: chọn **n**.

Build chạy trên máy chủ Expo, thường mất 10 đến 20 phút (bước `Run gradlew` lâu nhất). Có thể đóng terminal, build vẫn tiếp tục, theo dõi tại expo.dev → Projects → EventApp → Builds. Xong sẽ có **link và mã QR** để tải file `.apk`.

**Bước 3: Cài app lên điện thoại**

Mở link (hoặc quét QR) trên điện thoại Android, tải `.apk` và cài. Nếu máy hỏi, cho phép cài ứng dụng từ nguồn không xác định.

**Bước 4: Chạy server để app lấy code**

```powershell
npx expo start --dev-client
```

Điện thoại và máy tính phải cùng Wi-Fi. Mở app **EventApp** vừa cài và chọn server trong danh sách. Nếu không kết nối được, thử:

```powershell
npx expo start --dev-client --tunnel
```

### Kiểm tra quảng cáo hoạt động

- Mọi màn hình có banner ở cuối, ghi chữ **Test Ad**.
- Bấm **Chuyển sang trang 2** lần đầu: hiện quảng cáo toàn màn hình, đóng xong mới sang Trang 2. Nếu vừa mở app, đợi vài giây cho quảng cáo nạp xong rồi bấm.
- Bấm **Quay lại trang 1** rồi bấm lại trong vòng 3 phút: chuyển trang ngay, không có quảng cáo.
- Sau 3 phút bấm lại: quảng cáo xuất hiện.

### Chuyển sang quảng cáo thật khi phát hành

Hiện tại ứng dụng dùng **ID test của Google**. Trong chế độ dev (`__DEV__`), code luôn dùng ID test nên bạn có thể bấm thoải mái.

1. Đăng ký tại https://admob.google.com, thêm ứng dụng Android (và iOS nếu cần).
2. Tạo 2 đơn vị quảng cáo: **Banner** và **Interstitial**.
3. Trong `app.json`, thay 2 App ID test:

   ```json
   ["react-native-google-mobile-ads", {
     "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY",
     "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ"
   }]
   ```

4. Trong `src/constants/ads.ts`, thay ID đơn vị quảng cáo:

   ```ts
   const PROD = {
     banner: 'ca-app-pub-XXXXXXXXXXXXXXXX/AAAAAAAAAA',
     interstitial: 'ca-app-pub-XXXXXXXXXXXXXXXX/BBBBBBBBBB',
   };
   ```

5. Đổi `package` (Android) và `bundleIdentifier` (iOS) trong `app.json` thành tên của bạn nếu cần.
6. Build bản phát hành:

   ```powershell
   npx eas-cli build --profile production --platform android
   ```

> **Cảnh báo:** Không bao giờ tự bấm vào quảng cáo thật của chính mình. Google có thể xem đó là click giả và khóa tài khoản AdMob.

### Tùy chỉnh quảng cáo

| Việc cần làm | Sửa ở đâu |
|---|---|
| Đổi chu kỳ hiện quảng cáo (ví dụ 5 phút) | `INTERSTITIAL_COOLDOWN_MS` trong `src/constants/ads.ts` |
| Hiện quảng cáo ở mọi lần bấm | Đặt `INTERSTITIAL_COOLDOWN_MS = 0` |
| Đổi chữ hoặc đích của nút | `src/components/AdFooter.tsx` (biến `go`) |
| Dùng Interstitial ở nút khác | Bọc hành động: `onPress={() => showInterstitial(() => router.push('/...'))}` |
| Ẩn chân trang ở một số màn hình | Điều kiện theo `pathname` trong `src/components/AdFooter.tsx` |

## Cấu trúc

```
src/
├── app/                 Màn hình (Expo Router, theo thư mục)
│   ├── _layout.tsx      Layout gốc: khởi tạo AdMob + chân trang quảng cáo cho mọi màn hình
│   ├── (auth)/          Đăng nhập, đăng ký, quên mật khẩu
│   ├── attendee/(tabs)/ Khu Người tham gia
│   ├── organizer/       Khu Ban tổ chức (tabs + event/[id] + form)
│   ├── admin/           Khu Admin (tabs + categories + broadcast)
│   ├── event/[id].tsx   Chi tiết sự kiện (dùng chung)
│   ├── ticket/[id].tsx  Vé điện tử QR
│   └── page2.tsx        Trang 2 (đích của nút chuyển trang quảng cáo)
├── api/
│   ├── config.ts        USE_MOCK và BASE_URL
│   ├── client.ts        axios instance + interceptor token / lỗi
│   ├── services.ts      Các hàm gọi API theo vai trò
│   └── mock/            db.ts (dữ liệu), routes.ts (endpoint), adapter.ts
├── components/          Button, Input, EventCard, ProfileView, AdBanner, AdFooter, ...
├── constants/           theme.ts (màu sắc, nhãn trạng thái), ads.ts (ID quảng cáo, chu kỳ)
├── hooks/               useApi, useDebounced
├── store/authStore.ts   Zustand: phiên đăng nhập
├── types/
└── utils/               format, dialog, storage, ads (khởi tạo + Interstitial)
```

Phân quyền: mỗi khu có `_layout.tsx` kiểm tra vai trò và chuyển hướng; mock API cũng trả 401/403 như server thật.

## Nối backend thật

1. Mở `src/api/config.ts`, đặt `USE_MOCK = false` và `BASE_URL` = địa chỉ server (IP máy tính, không dùng localhost khi test trên điện thoại).
2. Backend cần cung cấp các endpoint giống `src/api/mock/routes.ts` (xem danh sách trong `services.ts`).
   Không phải sửa màn hình nào.
3. Backend phải tự kiểm tra vai trò ở mỗi API, vì ẩn giao diện không đủ bảo mật.

## Xử lý sự cố

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