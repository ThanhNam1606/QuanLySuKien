import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { db } from './db';
import { HttpError, routes } from './routes';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Adapter của axios: thay vì gửi request qua mạng, nó tìm handler trong routes.ts
 * và trả kết quả như một server thật (có độ trễ, mã lỗi 401/403/404/409...).
 */
export async function mockAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  await sleep(250);

  const method = (config.method ?? 'get').toUpperCase();
  const url = (config.url ?? '').split('?')[0].replace(/\/+$/, '') || '/';
  const query = config.params ?? {};
  let body: any = {};
  if (config.data) body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;

  const headers: any = config.headers;
  const auth = String(headers?.Authorization ?? headers?.get?.('Authorization') ?? '');
  const userId = auth.startsWith('Bearer mock-token-') ? auth.replace('Bearer mock-token-', '') : null;
  const user = userId ? db.users.find((u) => u.id === userId) ?? null : null;

  const respond = (status: number, data: any): AxiosResponse => ({
    data: JSON.parse(JSON.stringify(data ?? null)), // trả bản sao, giống dữ liệu qua mạng
    status,
    statusText: String(status),
    headers: {},
    config,
  });

  const fail = (status: number, message: string, data?: any) => {
    const res = respond(status, { message, ...(data ?? {}) });
    return Promise.reject(new AxiosError(message, String(status), config, null, res));
  };

  for (const r of routes) {
    if (r.method !== method) continue;
    const m = url.match(r.re);
    if (!m) continue;

    if (r.access !== 'public') {
      if (!user) return fail(401, 'Phiên đăng nhập đã hết hạn');
      if (user.locked) return fail(403, 'Tài khoản đã bị khóa');
      if (Array.isArray(r.access) && !r.access.includes(user.role)) {
        return fail(403, 'Bạn không có quyền thực hiện thao tác này');
      }
    }

    const params: Record<string, string> = {};
    r.names.forEach((n, i) => (params[n] = decodeURIComponent(m[i + 1])));
    try {
      return respond(200, r.handler({ params, query, body, user }));
    } catch (e) {
      if (e instanceof HttpError) return fail(e.status, e.message, e.data);
      return fail(500, 'Lỗi máy chủ giả lập: ' + (e as Error).message);
    }
  }
  return fail(404, `Không tìm thấy API ${method} ${url}`);
}
