/**
 * true  = dùng dữ liệu giả (mock) chạy ngay trong app, không cần server.
 * false = gọi backend thật tại BASE_URL.
 */
export const USE_MOCK = true;

/** Khi test trên điện thoại thật, dùng IP máy tính cùng mạng Wi-Fi, không dùng localhost. */
export const BASE_URL = 'http://192.168.1.10:3000/api';
