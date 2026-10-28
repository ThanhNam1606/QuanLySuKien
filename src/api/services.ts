import {
  AdminStats,
  AppNotification,
  Broadcast,
  Category,
  CheckinResult,
  EventInput,
  EventItem,
  OrganizerStats,
  RegistrationDto,
  Report,
  User,
} from '@/types';
import { useAuth } from '@/store/authStore';
import { api } from './client';

const get = <T>(url: string, params?: object) => api.get<T>(url, { params }).then((r) => r.data);
const post = <T>(url: string, body?: object) => api.post<T>(url, body).then((r) => r.data);
const put = <T>(url: string, body?: object) => api.put<T>(url, body).then((r) => r.data);
const del = <T>(url: string) => api.delete<T>(url).then((r) => r.data);

export interface EventQuery {
  q?: string;
  categoryId?: string;
  price?: 'free' | 'paid';
  when?: 'today' | 'week' | 'month';
  area?: string;
  sort?: 'time' | 'popular';
  limit?: number;
}

// ---------- Chung ----------
export const AuthApi = {
  login: (email: string, password: string) => post<{ user: User; token: string }>('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    post<{ user: User; token: string }>('/auth/register', { name, email, password }),
  forgotPassword: (email: string) => post<{ message: string }>('/auth/forgot-password', { email }),
  me: () => get<User>('/me'),
  updateMe: (data: Partial<User>) => put<User>('/me', data),
  changePassword: (oldPassword: string, newPassword: string) =>
    post<{ message: string }>('/me/password', { oldPassword, newPassword }),
  requestOrganizer: (orgName: string) => post<User>('/me/organizer-request', { orgName }),
};

export const NotificationApi = {
  list: () => get<AppNotification[]>('/notifications'),
  readAll: () => post('/notifications/read-all'),
};

// ---------- Người tham gia ----------
export const EventApi = {
  categories: () => get<Category[]>('/categories'),
  list: (query?: EventQuery) => get<EventItem[]>('/events', query),
  detail: (id: string) => get<EventItem>(`/events/${id}`),
  register: (id: string, force = false) => post<EventItem>(`/events/${id}/register`, { force }),
  cancelRegistration: (id: string) => del<EventItem>(`/events/${id}/register`),
  favorite: (id: string) => post<EventItem>(`/events/${id}/favorite`),
  unfavorite: (id: string) => del<EventItem>(`/events/${id}/favorite`),
  report: (id: string, reason: string) => post(`/events/${id}/report`, { reason }),
  myRegistrations: () => get<RegistrationDto[]>('/me/registrations'),
  myFavorites: () => get<EventItem[]>('/me/favorites'),
};

// ---------- Ban tổ chức ----------
export const OrganizerApi = {
  events: () => get<EventItem[]>('/organizer/events'),
  create: (data: EventInput) => post<EventItem>('/organizer/events', data),
  update: (id: string, data: EventInput) => put<EventItem>(`/organizer/events/${id}`, data),
  submit: (id: string) => post<EventItem>(`/organizer/events/${id}/submit`),
  cancel: (id: string) => post<EventItem>(`/organizer/events/${id}/cancel`),
  notify: (id: string, message: string) => post<{ sent: number }>(`/organizer/events/${id}/notify`, { message }),
  registrations: (id: string) => get<RegistrationDto[]>(`/organizer/events/${id}/registrations`),
  checkin: (code: string) => post<CheckinResult>('/organizer/checkin', { code }),
  stats: () => get<OrganizerStats>('/organizer/stats'),
};

// ---------- Admin ----------
export const AdminApi = {
  stats: () => get<AdminStats>('/admin/stats'),
  events: (params?: { status?: string; q?: string }) => get<EventItem[]>('/admin/events', params),
  approve: (id: string) => post<EventItem>(`/admin/events/${id}/approve`),
  reject: (id: string, reason: string) => post<EventItem>(`/admin/events/${id}/reject`, { reason }),
  hide: (id: string) => post<EventItem>(`/admin/events/${id}/hide`),
  unhide: (id: string) => post<EventItem>(`/admin/events/${id}/unhide`),
  categories: () => get<(Category & { eventCount: number })[]>('/admin/categories'),
  createCategory: (data: Partial<Category>) => post<Category>('/admin/categories', data),
  updateCategory: (id: string, data: Partial<Category>) => put<Category>(`/admin/categories/${id}`, data),
  deleteCategory: (id: string) => del(`/admin/categories/${id}`),
  users: (q?: string) => get<User[]>('/admin/users', { q }),
  updateUser: (id: string, data: { role?: string; locked?: boolean }) => put<User>(`/admin/users/${id}`, data),
  decideOrganizer: (id: string, approve: boolean) => post<User>(`/admin/users/${id}/organizer-request`, { approve }),
  reports: () => get<Report[]>('/admin/reports'),
  updateReport: (id: string, data: { status?: string; severity?: string; hideEvent?: boolean }) =>
    put<Report>(`/admin/reports/${id}`, data),
  broadcasts: () => get<Broadcast[]>('/admin/broadcasts'),
  sendNotification: (data: { title: string; body: string; target: string }) => post<Broadcast>('/admin/notifications', data),
};

/** Lấy lại thông tin user mới nhất (vd: sau khi được duyệt làm Ban tổ chức). */
export async function refreshProfile() {
  const user = await AuthApi.me();
  await useAuth.getState().updateUser(user);
  return user;
}
