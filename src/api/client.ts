import axios, { AxiosError } from 'axios';
import { useAuth } from '@/store/authStore';
import { BASE_URL, USE_MOCK } from './config';
import { mockAdapter } from './mock/adapter';

export const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

// Chế độ mock: axios không gọi mạng mà chạy qua mockAdapter.
if (USE_MOCK) api.defaults.adapter = mockAdapter;

api.interceptors.request.use((config) => {
  const token = useAuth.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    // Token hết hạn hoặc tài khoản không còn tồn tại -> về màn hình đăng nhập
    if (status === 401 && useAuth.getState().token) useAuth.getState().logout();
    const message =
      error.response?.data?.message ??
      (error.request ? 'Không thể kết nối máy chủ. Kiểm tra mạng rồi thử lại.' : error.message);
    const err: any = new Error(message);
    err.status = status;
    err.data = error.response?.data;
    return Promise.reject(err);
  },
);
