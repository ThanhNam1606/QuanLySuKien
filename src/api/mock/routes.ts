import { EventInput, Role } from '@/types';
import { normalize } from '@/utils/format';
import {
  computeStatus,
  db,
  EventRecord,
  genCode,
  log,
  notify,
  publicUser,
  toEventDto,
  uid,
  UserRecord,
} from './db';

export class HttpError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
  }
}

export interface Ctx {
  params: Record<string, string>;
  query: Record<string, any>;
  body: any;
  user: UserRecord | null;
}

type Access = 'public' | 'auth' | Role[];
interface Route {
  method: string;
  re: RegExp;
  names: string[];
  access: Access;
  handler: (c: Ctx) => any;
}

export const routes: Route[] = [];

function add(method: string, path: string, access: Access, handler: (c: Ctx) => any) {
  const names: string[] = [];
  const re = new RegExp(
    '^' + path.replace(/:([a-zA-Z]+)/g, (_m, n) => { names.push(n); return '([^/]+)'; }) + '$',
  );
  routes.push({ method, re, names, access, handler });
}

const nowIso = () => new Date().toISOString();
const bad = (msg: string) => new HttpError(400, msg);
const notFound = (msg = 'Không tìm thấy dữ liệu') => new HttpError(404, msg);

function findEvent(id: string) {
  const e = db.events.find((x) => x.id === id);
  if (!e) throw notFound('Không tìm thấy sự kiện');
  return e;
}

function ownEvent(c: Ctx) {
  const e = findEvent(c.params.id);
  if (e.organizerId !== c.user!.id) throw new HttpError(403, 'Bạn không có quyền với sự kiện này');
  return e;
}

function validateEvent(b: Partial<EventInput>): EventInput {
  if (!b.title || b.title.trim().length < 3) throw bad('Tên sự kiện tối thiểu 3 ký tự');
  if (!b.description?.trim()) throw bad('Vui lòng nhập mô tả sự kiện');
  if (!b.categoryId || !db.categories.some((c) => c.id === b.categoryId)) throw bad('Vui lòng chọn danh mục');
  if (!b.location?.trim()) throw bad('Vui lòng nhập địa điểm');
  const s = new Date(b.startTime ?? '').getTime();
  const e = new Date(b.endTime ?? '').getTime();
  if (isNaN(s) || isNaN(e)) throw bad('Thời gian không hợp lệ');
  if (e <= s) throw bad('Thời gian kết thúc phải sau thời gian bắt đầu');
  if (!(Number(b.capacity) >= 1)) throw bad('Sức chứa phải từ 1 trở lên');
  if (Number(b.price) < 0 || isNaN(Number(b.price))) throw bad('Giá vé không hợp lệ');
  return {
    title: b.title.trim(),
    description: b.description.trim(),
    image: b.image?.trim() || `https://picsum.photos/seed/${uid('img')}/900/500`,
    categoryId: b.categoryId,
    location: b.location.trim(),
    startTime: new Date(s).toISOString(),
    endTime: new Date(e).toISOString(),
    price: Number(b.price) || 0,
    capacity: Number(b.capacity),
    audience: b.audience?.trim() ?? '',
    rules: b.rules?.trim() ?? '',
    contact: b.contact?.trim() ?? '',
  };
}

function registeredUsers(eventId: string) {
  return db.registrations.filter((r) => r.eventId === eventId && r.status === 'registered');
}

// =====================================================================
// XÁC THỰC & TÀI KHOẢN
// =====================================================================
add('POST', '/auth/login', 'public', ({ body }) => {
  const email = String(body.email ?? '').trim().toLowerCase();
  const u = db.users.find((x) => x.email === email && x.password === body.password);
  if (!u) throw new HttpError(401, 'Sai email hoặc mật khẩu');
  if (u.locked) throw new HttpError(403, 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên');
  return { user: publicUser(u), token: 'mock-token-' + u.id };
});

add('POST', '/auth/register', 'public', ({ body }) => {
  const email = String(body.email ?? '').trim().toLowerCase();
  if (!body.name?.trim()) throw bad('Vui lòng nhập họ tên');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw bad('Email không hợp lệ');
  if (String(body.password ?? '').length < 6) throw bad('Mật khẩu tối thiểu 6 ký tự');
  if (db.users.some((u) => u.email === email)) throw new HttpError(409, 'Email đã được sử dụng');
  const u: UserRecord = {
    id: uid('u'), name: body.name.trim(), email, role: 'attendee', locked: false,
    organizerRequest: 'none', notifyReminder: true, notifyUpdates: true,
    createdAt: nowIso(), password: body.password,
  };
  db.users.push(u);
  log(`Người dùng mới đăng ký: ${u.name}`);
  return { user: publicUser(u), token: 'mock-token-' + u.id };
});

add('POST', '/auth/forgot-password', 'public', ({ body }) => {
  if (!/^\S+@\S+\.\S+$/.test(String(body.email ?? ''))) throw bad('Email không hợp lệ');
  return { message: 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.' };
});

add('GET', '/me', 'auth', ({ user }) => publicUser(user!));

add('PUT', '/me', 'auth', ({ user, body }) => {
  if (body.name !== undefined) {
    if (!String(body.name).trim()) throw bad('Họ tên không được để trống');
    user!.name = String(body.name).trim();
  }
  if (body.phone !== undefined) user!.phone = String(body.phone).trim();
  if (body.orgName !== undefined) user!.orgName = String(body.orgName).trim();
  if (body.notifyReminder !== undefined) user!.notifyReminder = !!body.notifyReminder;
  if (body.notifyUpdates !== undefined) user!.notifyUpdates = !!body.notifyUpdates;
  return publicUser(user!);
});

add('POST', '/me/password', 'auth', ({ user, body }) => {
  if (user!.password !== body.oldPassword) throw bad('Mật khẩu hiện tại không đúng');
  if (String(body.newPassword ?? '').length < 6) throw bad('Mật khẩu mới tối thiểu 6 ký tự');
  user!.password = body.newPassword;
  return { message: 'Đã đổi mật khẩu' };
});

add('POST', '/me/organizer-request', ['attendee'], ({ user, body }) => {
  if (user!.organizerRequest === 'pending') throw bad('Yêu cầu của bạn đang chờ xét duyệt');
  if (!body.orgName?.trim()) throw bad('Vui lòng nhập tên đơn vị tổ chức');
  user!.organizerRequest = 'pending';
  user!.orgName = body.orgName.trim();
  log(`Người dùng ${user!.name} gửi yêu cầu trở thành Ban tổ chức`);
  return publicUser(user!);
});

// =====================================================================
// NGƯỜI THAM GIA – KHÁM PHÁ SỰ KIỆN
// =====================================================================
add('GET', '/categories', 'public', () => db.categories.filter((c) => c.active));

add('GET', '/events', 'public', ({ query, user }) => {
  let list = db.events.filter((e) => ['approved', 'ongoing'].includes(computeStatus(e)));
  if (query.q) {
    const q = normalize(String(query.q));
    list = list.filter((e) => {
      const cat = db.categories.find((c) => c.id === e.categoryId)?.name ?? '';
      const org = db.users.find((u) => u.id === e.organizerId)?.name ?? '';
      return normalize([e.title, e.description, e.location, cat, org].join(' ')).includes(q);
    });
  }
  if (query.categoryId) list = list.filter((e) => e.categoryId === query.categoryId);
  if (query.price === 'free') list = list.filter((e) => e.price === 0);
  if (query.price === 'paid') list = list.filter((e) => e.price > 0);
  if (query.area) {
    const a = normalize(String(query.area));
    list = list.filter((e) => normalize(e.location).includes(a));
  }
  if (query.when) {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const days = query.when === 'today' ? 1 : query.when === 'week' ? 7 : 31;
    const endMs = start.getTime() + days * 86400000;
    list = list.filter((e) => new Date(e.startTime).getTime() < endMs);
  }
  let dtos = list.map((e) => toEventDto(e, user?.id));
  if (query.sort === 'popular') dtos.sort((a, b) => b.registeredCount - a.registeredCount);
  else dtos.sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime));
  if (query.limit) dtos = dtos.slice(0, Number(query.limit));
  return dtos;
});

add('GET', '/events/:id', 'public', ({ params, user }) => {
  const e = findEvent(params.id);
  const status = computeStatus(e);
  const isOwner = user && (user.id === e.organizerId || user.role === 'admin');
  if (!isOwner && !['approved', 'ongoing', 'ended'].includes(status)) {
    throw notFound('Sự kiện không còn tồn tại hoặc chưa được công khai');
  }
  return toEventDto(e, user?.id);
});

// =====================================================================
// NGƯỜI THAM GIA – ĐĂNG KÝ, YÊU THÍCH, BÁO CÁO
// =====================================================================
add('POST', '/events/:id/register', ['attendee'], ({ params, body, user }) => {
  const e = findEvent(params.id);
  if (computeStatus(e) !== 'approved') throw bad('Sự kiện này hiện không nhận đăng ký');
  if (registeredUsers(e.id).some((r) => r.userId === user!.id)) throw bad('Bạn đã đăng ký sự kiện này rồi');
  if (registeredUsers(e.id).length >= e.capacity) throw bad('Sự kiện đã hết chỗ');

  const s = new Date(e.startTime).getTime();
  const en = new Date(e.endTime).getTime();
  const clash = db.registrations
    .filter((r) => r.userId === user!.id && r.status === 'registered')
    .map((r) => db.events.find((x) => x.id === r.eventId)!)
    .find((x) => x && s < new Date(x.endTime).getTime() && en > new Date(x.startTime).getTime());
  if (clash && !body.force) {
    throw new HttpError(409, `Trùng thời gian với sự kiện "${clash.title}"`, { conflict: true, title: clash.title });
  }

  const reg = {
    id: uid('r'), eventId: e.id, userId: user!.id, code: genCode(),
    status: 'registered' as const, checkedIn: false, createdAt: nowIso(),
  };
  db.registrations.push(reg);
  notify(user!.id, 'Đăng ký thành công', `Bạn đã đăng ký "${e.title}". Mã vé: ${reg.code}.`);
  return toEventDto(e, user!.id);
});

add('DELETE', '/events/:id/register', ['attendee'], ({ params, user }) => {
  const e = findEvent(params.id);
  const reg = registeredUsers(e.id).find((r) => r.userId === user!.id);
  if (!reg) throw bad('Bạn chưa đăng ký sự kiện này');
  if (reg.checkedIn) throw bad('Không thể hủy vì bạn đã điểm danh');
  if (Date.now() >= new Date(e.startTime).getTime()) throw bad('Không thể hủy khi sự kiện đã bắt đầu');
  reg.status = 'cancelled';
  notify(user!.id, 'Đã hủy đăng ký', `Bạn đã hủy đăng ký "${e.title}".`);
  return toEventDto(e, user!.id);
});

add('POST', '/events/:id/favorite', 'auth', ({ params, user }) => {
  const e = findEvent(params.id);
  if (!db.favorites.some((f) => f.userId === user!.id && f.eventId === e.id)) {
    db.favorites.push({ userId: user!.id, eventId: e.id });
  }
  return toEventDto(e, user!.id);
});

add('DELETE', '/events/:id/favorite', 'auth', ({ params, user }) => {
  const e = findEvent(params.id);
  db.favorites = db.favorites.filter((f) => !(f.userId === user!.id && f.eventId === e.id));
  return toEventDto(e, user!.id);
});

add('POST', '/events/:id/report', 'auth', ({ params, body, user }) => {
  const e = findEvent(params.id);
  if (!body.reason?.trim()) throw bad('Vui lòng nhập nội dung báo cáo');
  db.reports.unshift({
    id: uid('p'), eventId: e.id, eventTitle: e.title, reporterName: user!.name,
    reason: body.reason.trim(), severity: 'medium', status: 'pending', createdAt: nowIso(),
  });
  log(`${user!.name} báo cáo sự kiện "${e.title}"`);
  return { message: 'Đã gửi báo cáo' };
});

add('GET', '/me/registrations', ['attendee'], ({ user }) =>
  db.registrations
    .filter((r) => r.userId === user!.id && r.status === 'registered')
    .map((r) => ({ ...r, event: toEventDto(db.events.find((e) => e.id === r.eventId)!, user!.id) }))
    .sort((a, b) => +new Date(a.event.startTime) - +new Date(b.event.startTime)),
);

add('GET', '/me/favorites', 'auth', ({ user }) =>
  db.favorites
    .filter((f) => f.userId === user!.id)
    .map((f) => db.events.find((e) => e.id === f.eventId))
    .filter((e): e is EventRecord => !!e && ['approved', 'ongoing'].includes(computeStatus(e)))
    .map((e) => toEventDto(e, user!.id)),
);

add('GET', '/notifications', 'auth', ({ user }) =>
  db.notifications
    .filter((n) => n.userId === user!.id)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
);

add('POST', '/notifications/read-all', 'auth', ({ user }) => {
  db.notifications.filter((n) => n.userId === user!.id).forEach((n) => (n.read = true));
  return { message: 'ok' };
});

// =====================================================================
// BAN TỔ CHỨC
// =====================================================================
add('GET', '/organizer/events', ['organizer'], ({ user }) =>
  db.events
    .filter((e) => e.organizerId === user!.id)
    .map((e) => toEventDto(e, user!.id))
    .sort((a, b) => +new Date(b.startTime) - +new Date(a.startTime)),
);

add('POST', '/organizer/events', ['organizer'], ({ user, body }) => {
  const input = validateEvent(body);
  const e: EventRecord = { ...input, id: uid('e'), organizerId: user!.id, status: 'draft', createdAt: nowIso() };
  db.events.push(e);
  return toEventDto(e, user!.id);
});

add('PUT', '/organizer/events/:id', ['organizer'], (c) => {
  const e = ownEvent(c);
  if (computeStatus(e) === 'ended') throw bad('Không thể sửa sự kiện đã kết thúc');
  const input = validateEvent(c.body);
  const changed = input.startTime !== e.startTime || input.location !== e.location;
  Object.assign(e, input);
  if (changed && e.status === 'approved') {
    registeredUsers(e.id).forEach((r) =>
      notify(r.userId, 'Sự kiện thay đổi', `"${e.title}" đã cập nhật thời gian hoặc địa điểm. Vui lòng xem lại chi tiết.`),
    );
  }
  return toEventDto(e, c.user!.id);
});

add('POST', '/organizer/events/:id/submit', ['organizer'], (c) => {
  const e = ownEvent(c);
  if (!['draft', 'rejected'].includes(e.status)) throw bad('Chỉ gửi duyệt được sự kiện ở trạng thái Bản nháp hoặc Bị từ chối');
  e.status = 'pending';
  e.rejectReason = undefined;
  log(`${c.user!.name} gửi sự kiện "${e.title}" chờ duyệt`);
  return toEventDto(e, c.user!.id);
});

add('POST', '/organizer/events/:id/cancel', ['organizer'], (c) => {
  const e = ownEvent(c);
  if (computeStatus(e) === 'ended') throw bad('Sự kiện đã kết thúc');
  registeredUsers(e.id).forEach((r) => {
    notify(r.userId, 'Sự kiện bị hủy', `"${e.title}" đã bị Ban tổ chức hủy.`);
    r.status = 'cancelled';
  });
  e.status = 'cancelled';
  log(`${c.user!.name} hủy sự kiện "${e.title}"`);
  return toEventDto(e, c.user!.id);
});

add('POST', '/organizer/events/:id/notify', ['organizer'], (c) => {
  const e = ownEvent(c);
  if (!c.body.message?.trim()) throw bad('Vui lòng nhập nội dung thông báo');
  const regs = registeredUsers(e.id);
  regs.forEach((r) => notify(r.userId, `Thông báo từ "${e.title}"`, c.body.message.trim()));
  return { sent: regs.length };
});

add('GET', '/organizer/events/:id/registrations', ['organizer'], (c) => {
  const e = ownEvent(c);
  return registeredUsers(e.id).map((r) => {
    const u = db.users.find((x) => x.id === r.userId);
    return { ...r, userName: u?.name ?? 'Người dùng', userEmail: u?.email ?? '' };
  });
});

add('POST', '/organizer/checkin', ['organizer'], ({ user, body }) => {
  const code = String(body.code ?? '').trim().toUpperCase();
  const reg = db.registrations.find((r) => r.code === code && r.status === 'registered');
  if (!reg) throw notFound('Mã vé không hợp lệ');
  const e = findEvent(reg.eventId);
  if (e.organizerId !== user!.id) throw new HttpError(403, 'Vé này thuộc sự kiện của Ban tổ chức khác');
  const status = computeStatus(e);
  if (status === 'ended') throw bad('Sự kiện đã kết thúc');
  if (status !== 'approved' && status !== 'ongoing') throw bad('Sự kiện chưa được phép diễn ra');
  if (reg.checkedIn) throw new HttpError(409, 'Vé này đã được điểm danh trước đó');
  reg.checkedIn = true;
  reg.checkedInAt = nowIso();
  const u = db.users.find((x) => x.id === reg.userId);
  return { userName: u?.name ?? 'Người dùng', eventTitle: e.title, code: reg.code, checkedInAt: reg.checkedInAt };
});

add('GET', '/organizer/stats', ['organizer'], ({ user }) => {
  const mine = db.events.filter((e) => e.organizerId === user!.id);
  const rows = mine.map((e) => {
    const regs = registeredUsers(e.id);
    return {
      id: e.id, title: e.title, status: computeStatus(e), registered: regs.length,
      capacity: e.capacity, checkedIn: regs.filter((r) => r.checkedIn).length,
    };
  });
  return {
    totalEvents: mine.length,
    totalRegistrations: rows.reduce((s, r) => s + r.registered, 0),
    totalCheckedIn: rows.reduce((s, r) => s + r.checkedIn, 0),
    rows,
  };
});

// =====================================================================
// ADMIN
// =====================================================================
add('GET', '/admin/stats', ['admin'], () => {
  const statuses = db.events.map(computeStatus);
  const weekAgo = Date.now() - 7 * 86400000;
  const catCount: Record<string, number> = {};
  db.events.forEach((e) => {
    const n = db.categories.find((c) => c.id === e.categoryId)?.name ?? 'Khác';
    catCount[n] = (catCount[n] ?? 0) + 1;
  });
  return {
    events: {
      total: db.events.length,
      pending: statuses.filter((s) => s === 'pending').length,
      upcoming: statuses.filter((s) => s === 'approved').length,
      ongoing: statuses.filter((s) => s === 'ongoing').length,
      ended: statuses.filter((s) => s === 'ended').length,
    },
    users: {
      total: db.users.length,
      newThisWeek: db.users.filter((u) => +new Date(u.createdAt) > weekAgo).length,
      organizers: db.users.filter((u) => u.role === 'organizer').length,
    },
    registrations: db.registrations.filter((r) => r.status === 'registered').length,
    pendingReports: db.reports.filter((r) => r.status === 'pending').length,
    topCategories: Object.entries(catCount).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    recent: db.logs.slice(0, 6),
  };
});

add('GET', '/admin/events', ['admin'], ({ query }) => {
  let list = db.events.map((e) => toEventDto(e));
  if (query.status) list = list.filter((e) => e.status === query.status);
  if (query.q) {
    const q = normalize(String(query.q));
    list = list.filter((e) => normalize(e.title + ' ' + e.organizerName).includes(q));
  }
  return list.sort((a, b) => +new Date(b.startTime) - +new Date(a.startTime));
});

add('POST', '/admin/events/:id/approve', ['admin'], (c) => {
  const e = findEvent(c.params.id);
  if (e.status !== 'pending') throw bad('Chỉ duyệt được sự kiện đang chờ duyệt');
  e.status = 'approved';
  e.rejectReason = undefined;
  notify(e.organizerId, 'Sự kiện đã được duyệt', `"${e.title}" đã được phê duyệt và hiển thị công khai.`);
  log(`Admin duyệt sự kiện "${e.title}"`);
  return toEventDto(e);
});

add('POST', '/admin/events/:id/reject', ['admin'], (c) => {
  const e = findEvent(c.params.id);
  if (e.status !== 'pending') throw bad('Chỉ từ chối được sự kiện đang chờ duyệt');
  if (!c.body.reason?.trim()) throw bad('Vui lòng nhập lý do từ chối');
  e.status = 'rejected';
  e.rejectReason = c.body.reason.trim();
  notify(e.organizerId, 'Sự kiện bị từ chối', `"${e.title}": ${e.rejectReason}`);
  log(`Admin từ chối sự kiện "${e.title}"`);
  return toEventDto(e);
});

add('POST', '/admin/events/:id/hide', ['admin'], (c) => {
  const e = findEvent(c.params.id);
  e.status = 'hidden';
  notify(e.organizerId, 'Sự kiện bị ẩn', `"${e.title}" đã bị quản trị viên ẩn do vi phạm quy định.`);
  log(`Admin ẩn sự kiện "${e.title}"`);
  return toEventDto(e);
});

add('POST', '/admin/events/:id/unhide', ['admin'], (c) => {
  const e = findEvent(c.params.id);
  if (e.status !== 'hidden') throw bad('Sự kiện không ở trạng thái ẩn');
  e.status = 'approved';
  log(`Admin bỏ ẩn sự kiện "${e.title}"`);
  return toEventDto(e);
});

add('GET', '/admin/categories', ['admin'], () =>
  db.categories.map((c) => ({ ...c, eventCount: db.events.filter((e) => e.categoryId === c.id).length })),
);

add('POST', '/admin/categories', ['admin'], ({ body }) => {
  if (!body.name?.trim()) throw bad('Vui lòng nhập tên danh mục');
  const c = { id: uid('c'), name: body.name.trim(), icon: body.icon?.trim() || '📌', description: body.description?.trim() ?? '', active: true };
  db.categories.push(c);
  log(`Admin thêm danh mục "${c.name}"`);
  return c;
});

add('PUT', '/admin/categories/:id', ['admin'], ({ params, body }) => {
  const c = db.categories.find((x) => x.id === params.id);
  if (!c) throw notFound('Không tìm thấy danh mục');
  if (body.name !== undefined) {
    if (!String(body.name).trim()) throw bad('Tên danh mục không được để trống');
    c.name = String(body.name).trim();
  }
  if (body.icon !== undefined) c.icon = String(body.icon).trim() || c.icon;
  if (body.description !== undefined) c.description = String(body.description).trim();
  if (body.active !== undefined) c.active = !!body.active;
  return c;
});

add('DELETE', '/admin/categories/:id', ['admin'], ({ params }) => {
  const c = db.categories.find((x) => x.id === params.id);
  if (!c) throw notFound('Không tìm thấy danh mục');
  if (db.events.some((e) => e.categoryId === c.id)) {
    throw bad('Danh mục đang có sự kiện, không thể xóa. Bạn có thể tắt danh mục thay vì xóa.');
  }
  db.categories = db.categories.filter((x) => x.id !== c.id);
  log(`Admin xóa danh mục "${c.name}"`);
  return { message: 'Đã xóa' };
});

add('GET', '/admin/users', ['admin'], ({ query }) => {
  let list = db.users.map(publicUser);
  if (query.q) {
    const q = normalize(String(query.q));
    list = list.filter((u) => normalize(u.name + ' ' + u.email + ' ' + u.id).includes(q));
  }
  return list;
});

add('PUT', '/admin/users/:id', ['admin'], ({ user, params, body }) => {
  const u = db.users.find((x) => x.id === params.id);
  if (!u) throw notFound('Không tìm thấy người dùng');
  if (u.id === user!.id) throw bad('Bạn không thể tự thay đổi quyền hoặc khóa chính mình');
  if (body.role !== undefined) {
    if (!['attendee', 'organizer', 'admin'].includes(body.role)) throw bad('Vai trò không hợp lệ');
    u.role = body.role;
    log(`Admin đổi vai trò của ${u.name} thành ${body.role}`);
  }
  if (body.locked !== undefined) {
    u.locked = !!body.locked;
    log(`Admin ${u.locked ? 'khóa' : 'mở khóa'} tài khoản ${u.name}`);
  }
  return publicUser(u);
});

add('POST', '/admin/users/:id/organizer-request', ['admin'], ({ params, body }) => {
  const u = db.users.find((x) => x.id === params.id);
  if (!u) throw notFound('Không tìm thấy người dùng');
  if (u.organizerRequest !== 'pending') throw bad('Người dùng này không có yêu cầu đang chờ');
  if (body.approve) {
    u.organizerRequest = 'approved';
    u.role = 'organizer';
    notify(u.id, 'Yêu cầu được chấp nhận', 'Bạn đã trở thành Ban tổ chức. Hãy đăng nhập lại để bắt đầu tạo sự kiện.');
  } else {
    u.organizerRequest = 'rejected';
    notify(u.id, 'Yêu cầu bị từ chối', 'Yêu cầu trở thành Ban tổ chức của bạn chưa được chấp nhận.');
  }
  log(`Admin ${body.approve ? 'duyệt' : 'từ chối'} yêu cầu Ban tổ chức của ${u.name}`);
  return publicUser(u);
});

add('GET', '/admin/reports', ['admin'], () => db.reports);

add('PUT', '/admin/reports/:id', ['admin'], ({ params, body }) => {
  const r = db.reports.find((x) => x.id === params.id);
  if (!r) throw notFound('Không tìm thấy báo cáo');
  if (body.severity) r.severity = body.severity;
  if (body.status) {
    r.status = body.status;
    if (body.status === 'accepted' && body.hideEvent) {
      const e = db.events.find((x) => x.id === r.eventId);
      if (e) {
        e.status = 'hidden';
        notify(e.organizerId, 'Sự kiện bị ẩn', `"${e.title}" bị ẩn sau khi xử lý báo cáo vi phạm.`);
      }
    }
    log(`Admin ${body.status === 'accepted' ? 'chấp nhận' : 'từ chối'} báo cáo về "${r.eventTitle}"`);
  }
  return r;
});

add('GET', '/admin/broadcasts', ['admin'], () => db.broadcasts);

add('POST', '/admin/notifications', ['admin'], ({ body }) => {
  if (!body.title?.trim() || !body.body?.trim()) throw bad('Vui lòng nhập tiêu đề và nội dung');
  const target = body.target ?? 'all';
  const recipients = db.users.filter((u) => u.role !== 'admin' && (target === 'all' || u.role === target));
  recipients.forEach((u) => notify(u.id, body.title.trim(), body.body.trim()));
  const b = { id: uid('b'), title: body.title.trim(), body: body.body.trim(), target, recipients: recipients.length, createdAt: nowIso() };
  db.broadcasts.unshift(b);
  log(`Admin gửi thông báo "${b.title}" tới ${recipients.length} người`);
  return b;
});
