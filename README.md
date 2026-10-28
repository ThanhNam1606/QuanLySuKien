# EventApp – Ứng dụng quản lý sự kiện (React Native + Expo + axios mock API)

Ứng dụng 3 vai trò: **Người tham gia**, **Ban tổ chức**, **Admin**. Toàn bộ dữ liệu chạy bằng **mock API**
(axios + adapter giả lập), không cần backend.

## Chạy dự án

```bash
npm install
npx expo start
```

Quét mã QR bằng app **Expo Go** (điện thoại cùng mạng Wi-Fi), hoặc nhấn `a` (Android emulator) / `w` (web).
Nếu lỗi cache: `npx expo start -c`.

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

## Cấu trúc

```
src/
├── app/                 Màn hình (Expo Router, theo thư mục)
│   ├── (auth)/          Đăng nhập, đăng ký, quên mật khẩu
│   ├── attendee/(tabs)/ Khu Người tham gia
│   ├── organizer/       Khu Ban tổ chức (tabs + event/[id] + form)
│   ├── admin/           Khu Admin (tabs + categories + broadcast)
│   ├── event/[id].tsx   Chi tiết sự kiện (dùng chung)
│   └── ticket/[id].tsx  Vé điện tử QR
├── api/
│   ├── config.ts        USE_MOCK và BASE_URL
│   ├── client.ts        axios instance + interceptor token / lỗi
│   ├── services.ts      Các hàm gọi API theo vai trò
│   └── mock/            db.ts (dữ liệu), routes.ts (endpoint), adapter.ts
├── components/          Button, Input, EventCard, ProfileView, ...
├── hooks/               useApi, useDebounced
├── store/authStore.ts   Zustand: phiên đăng nhập
├── constants/theme.ts   Màu sắc, nhãn trạng thái
├── types/ utils/
```

Phân quyền: mỗi khu có `_layout.tsx` kiểm tra vai trò và chuyển hướng; mock API cũng trả 401/403 như server thật.

## Nối backend thật

1. Mở `src/api/config.ts`, đặt `USE_MOCK = false` và `BASE_URL` = địa chỉ server (IP máy tính, không dùng localhost khi test trên điện thoại).
2. Backend cần cung cấp các endpoint giống `src/api/mock/routes.ts` (xem danh sách trong `services.ts`).
   Không phải sửa màn hình nào.
3. Backend phải tự kiểm tra vai trò ở mỗi API, vì ẩn giao diện không đủ bảo mật.

## Chưa có (có thể làm tiếp)

Nhắc lịch bằng push notification (`expo-notifications`), lịch dạng tháng/tuần, chọn ảnh từ thư viện,
thanh toán vé có phí, đánh giá sau sự kiện, quản lý địa điểm riêng.
