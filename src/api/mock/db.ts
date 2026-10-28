import {
  ActivityLog,
  AppNotification,
  Broadcast,
  Category,
  EventItem,
  EventStatus,
  Registration,
  Report,
  User,
} from '@/types';

export type UserRecord = User & { password: string };
export type StoredStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'hidden' | 'cancelled';
export type EventRecord = Omit<
  EventItem,
  | 'status'
  | 'categoryName'
  | 'organizerName'
  | 'registeredCount'
  | 'checkedInCount'
  | 'myRegistration'
  | 'isFavorite'
> & { status: StoredStatus; createdAt: string };

const DAY = 86400000;
const HOUR = 3600000;
let counter = 100;
export const uid = (prefix: string) => `${prefix}${++counter}`;
export const genCode = () => 'EVT-' + Math.random().toString(36).slice(2, 8).toUpperCase();
const now = () => Date.now();
const iso = (ms: number) => new Date(ms).toISOString();
/** Mốc thời gian: sau `days` ngày, lúc `hour` giờ. */
const at = (days: number, hour: number) => {
  const d = new Date(now() + days * DAY);
  d.setHours(hour, 0, 0, 0);
  return d.getTime();
};
const img = (seed: string) => `https://picsum.photos/seed/${seed}/900/500`;

const baseUser = {
  locked: false,
  organizerRequest: 'none' as const,
  notifyReminder: true,
  notifyUpdates: true,
};

export const db = {
  users: [
    { ...baseUser, id: 'u1', name: 'Nguyễn Văn An', email: 'an@test.com', phone: '0901234567', role: 'attendee', createdAt: iso(now() - 40 * DAY), password: '123456' },
    { ...baseUser, id: 'u2', name: 'Trần Thị Bình', email: 'binh@test.com', role: 'attendee', createdAt: iso(now() - 12 * DAY), password: '123456' },
    { ...baseUser, id: 'u3', name: 'CLB Công nghệ Hà Nội', email: 'org@test.com', role: 'organizer', organizerRequest: 'approved', orgName: 'CLB Công nghệ Hà Nội', createdAt: iso(now() - 60 * DAY), password: '123456' },
    { ...baseUser, id: 'u4', name: 'Nhóm Âm nhạc Phố Cổ', email: 'music@test.com', role: 'organizer', organizerRequest: 'approved', orgName: 'Nhóm Âm nhạc Phố Cổ', createdAt: iso(now() - 50 * DAY), password: '123456' },
    { ...baseUser, id: 'u5', name: 'Quản trị viên', email: 'admin@test.com', role: 'admin', createdAt: iso(now() - 90 * DAY), password: '123456' },
    { ...baseUser, id: 'u6', name: 'Lê Văn Cường', email: 'cuong@test.com', role: 'attendee', organizerRequest: 'pending', orgName: 'Công ty Sự kiện Cường Lê', createdAt: iso(now() - 3 * DAY), password: '123456' },
  ] as UserRecord[],

  categories: [
    { id: 'c1', name: 'Công nghệ', icon: '💻', description: 'Hội thảo, workshop, hackathon', active: true },
    { id: 'c2', name: 'Âm nhạc', icon: '🎵', description: 'Đêm nhạc, liveshow, festival', active: true },
    { id: 'c3', name: 'Hội thảo', icon: '🎤', description: 'Diễn đàn, talkshow, hội nghị', active: true },
    { id: 'c4', name: 'Thể thao', icon: '🏃', description: 'Giải chạy, giải đấu, hoạt động ngoài trời', active: true },
    { id: 'c5', name: 'Nghệ thuật', icon: '🎨', description: 'Triển lãm, workshop sáng tạo', active: true },
    { id: 'c6', name: 'Ẩm thực', icon: '🍜', description: 'Lễ hội ẩm thực (đang tạm tắt)', active: false },
  ] as Category[],

  events: [
    {
      id: 'e1', title: 'Hội thảo AI và Tương lai việc làm', categoryId: 'c3', organizerId: 'u3', status: 'approved',
      description: 'Các chuyên gia từ doanh nghiệp và trường đại học chia sẻ cách AI đang thay đổi thị trường lao động, kèm phiên hỏi đáp trực tiếp.',
      image: img('ai-hoi-thao'), location: 'Hội trường A, ĐH Bách Khoa, 1 Đại Cồ Việt, Hà Nội', latitude: 21.0045, longitude: 105.8437,
      startTime: iso(at(3, 8) + 30 * 60000), endTime: iso(at(3, 12)), price: 0, capacity: 150,
      audience: 'Sinh viên, người đi làm quan tâm đến AI', rules: 'Mang theo thẻ sinh viên hoặc CCCD. Không quay phim trong phiên thảo luận kín.', contact: 'org@test.com | 0988 111 222', createdAt: iso(now() - 20 * DAY),
    },
    {
      id: 'e2', title: 'Workshop xây ứng dụng React Native', categoryId: 'c1', organizerId: 'u3', status: 'approved',
      description: 'Thực hành 4 giờ: dựng ứng dụng đầu tiên với Expo, điều hướng, gọi API và đóng gói bản chạy thử.',
      image: img('react-native-ws'), location: 'Phòng Lab 3, Tòa B1, ĐH Bách Khoa, Hà Nội', latitude: 21.0052, longitude: 105.8431,
      startTime: iso(at(5, 13) + 30 * 60000), endTime: iso(at(5, 17) + 30 * 60000), price: 50000, capacity: 40,
      audience: 'Người đã biết JavaScript cơ bản', rules: 'Tự mang laptop đã cài Node.js.', contact: 'org@test.com', createdAt: iso(now() - 18 * DAY),
    },
    {
      id: 'e3', title: 'Đêm nhạc Acoustic Phố Cổ', categoryId: 'c2', organizerId: 'u4', status: 'approved',
      description: 'Đêm nhạc acoustic cuối tuần với ba nghệ sĩ trẻ, không gian nhỏ, gần gũi giữa lòng phố cổ.',
      image: img('acoustic-night'), location: 'Cà phê Sân Khấu, 18 Hàng Bồ, Hoàn Kiếm, Hà Nội', latitude: 21.0341, longitude: 105.8497,
      startTime: iso(at(7, 19)), endTime: iso(at(7, 22)), price: 120000, capacity: 60,
      audience: 'Mọi lứa tuổi từ 16 trở lên', rules: 'Vé đã mua không hoàn lại sau khi sự kiện bắt đầu.', contact: 'music@test.com | 0977 333 444', createdAt: iso(now() - 15 * DAY),
    },
    {
      id: 'e4', title: 'Giải chạy bộ Vòng Hồ Tây 10K', categoryId: 'c4', organizerId: 'u4', status: 'approved',
      description: 'Đường chạy 10 km quanh Hồ Tây vào sáng sớm, có trạm nước và huy chương cho người hoàn thành.',
      image: img('ho-tay-run'), location: 'Công viên Nước Hồ Tây, Quảng An, Tây Hồ, Hà Nội', latitude: 21.0636, longitude: 105.8228,
      startTime: iso(at(12, 5) + 30 * 60000), endTime: iso(at(12, 9)), price: 200000, capacity: 300,
      audience: 'Người từ 18 tuổi, sức khỏe tốt', rules: 'Mang theo bib khi nhận áo. Không chạy nếu có bệnh tim mạch.', contact: 'music@test.com', createdAt: iso(now() - 10 * DAY),
    },
    {
      id: 'e5', title: 'Triển lãm Nghệ thuật Số 2026', categoryId: 'c5', organizerId: 'u4', status: 'approved',
      description: 'Hơn 40 tác phẩm nghệ thuật số, thực tế tăng cường và trình diễn ánh sáng tương tác.',
      image: img('digital-art'), location: 'Bảo tàng Mỹ thuật, 66 Nguyễn Thái Học, Ba Đình, Hà Nội', latitude: 21.0319, longitude: 105.8374,
      startTime: iso(at(2, 9)), endTime: iso(at(2, 18)), price: 0, capacity: 100,
      audience: 'Mọi người', rules: 'Không dùng đèn flash khi chụp ảnh.', contact: 'music@test.com', createdAt: iso(now() - 9 * DAY),
    },
    {
      id: 'e6', title: 'Ngày hội việc làm Công nghệ', categoryId: 'c3', organizerId: 'u3', status: 'approved',
      description: 'Gặp gỡ hơn 30 doanh nghiệp tuyển dụng, phỏng vấn nhanh tại chỗ và tư vấn CV.',
      image: img('job-fair'), location: 'Trung tâm Hội nghị Quốc gia, Mễ Trì, Hà Nội', latitude: 21.0063, longitude: 105.7845,
      startTime: iso(now() - 1 * HOUR), endTime: iso(now() + 4 * HOUR), price: 0, capacity: 500,
      audience: 'Sinh viên năm cuối và người mới đi làm', rules: 'Mang theo CV bản in.', contact: 'org@test.com', createdAt: iso(now() - 30 * DAY),
    },
    {
      id: 'e7', title: 'Hackathon 24 giờ: Giải pháp cho Thành phố', categoryId: 'c1', organizerId: 'u3', status: 'pending',
      description: 'Đội 3–5 người thi xây dựng giải pháp công nghệ cho giao thông và môi trường đô thị trong 24 giờ.',
      image: img('hackathon'), location: 'Không gian sáng tạo Hanoi Hub, Cầu Giấy, Hà Nội', latitude: 21.0285, longitude: 105.7826,
      startTime: iso(at(20, 8)), endTime: iso(at(21, 8)), price: 0, capacity: 120,
      audience: 'Sinh viên và lập trình viên', rules: 'Đăng ký theo đội, tối đa 5 người.', contact: 'org@test.com', createdAt: iso(now() - 2 * DAY),
    },
    {
      id: 'e8', title: 'Meetup Quản lý Sản phẩm', categoryId: 'c3', organizerId: 'u3', status: 'draft',
      description: 'Buổi chia sẻ về cách xây dựng roadmap và đo lường sản phẩm.',
      image: img('product-meetup'), location: 'Cà phê Workspace, Đống Đa, Hà Nội',
      startTime: iso(at(25, 18)), endTime: iso(at(25, 21)), price: 30000, capacity: 50,
      audience: 'Product manager, founder', rules: '', contact: 'org@test.com', createdAt: iso(now() - 1 * DAY),
    },
    {
      id: 'e9', title: 'Workshop Vẽ minh họa kỹ thuật số', categoryId: 'c5', organizerId: 'u4', status: 'rejected',
      rejectReason: 'Thiếu thông tin địa điểm cụ thể và chưa có thông tin liên hệ. Vui lòng bổ sung rồi gửi lại.',
      description: 'Học vẽ minh họa trên máy tính bảng từ cơ bản.',
      image: img('illustration'), location: 'Chưa xác định',
      startTime: iso(at(9, 14)), endTime: iso(at(9, 17)), price: 80000, capacity: 25,
      audience: 'Người mới bắt đầu', rules: '', contact: '', createdAt: iso(now() - 5 * DAY),
    },
    {
      id: 'e10', title: 'Hội nghị Chuyển đổi số 2026', categoryId: 'c3', organizerId: 'u3', status: 'approved',
      description: 'Hội nghị thường niên về chuyển đổi số trong doanh nghiệp vừa và nhỏ.',
      image: img('digital-transform'), location: 'Khách sạn Melia, 44 Lý Thường Kiệt, Hà Nội', latitude: 21.0252, longitude: 105.8561,
      startTime: iso(at(-6, 8)), endTime: iso(at(-6, 17)), price: 150000, capacity: 200,
      audience: 'Doanh nghiệp vừa và nhỏ', rules: '', contact: 'org@test.com', createdAt: iso(now() - 45 * DAY),
    },
  ] as EventRecord[],

  registrations: [
    { id: 'r1', eventId: 'e1', userId: 'u1', code: 'EVT-A1B2C3', status: 'registered', checkedIn: false, createdAt: iso(now() - 2 * DAY) },
    { id: 'r2', eventId: 'e3', userId: 'u1', code: 'EVT-D4E5F6', status: 'registered', checkedIn: false, createdAt: iso(now() - 1 * DAY) },
    { id: 'r3', eventId: 'e10', userId: 'u1', code: 'EVT-G7H8J9', status: 'registered', checkedIn: true, checkedInAt: iso(at(-6, 8)), createdAt: iso(now() - 12 * DAY) },
    { id: 'r4', eventId: 'e1', userId: 'u2', code: 'EVT-K1L2M3', status: 'registered', checkedIn: false, createdAt: iso(now() - 2 * DAY) },
    { id: 'r5', eventId: 'e2', userId: 'u2', code: 'EVT-N4P5Q6', status: 'registered', checkedIn: false, createdAt: iso(now() - 1 * DAY) },
    { id: 'r6', eventId: 'e6', userId: 'u2', code: 'EVT-R7S8T9', status: 'registered', checkedIn: false, createdAt: iso(now() - 3 * DAY) },
  ] as Registration[],

  favorites: [{ userId: 'u1', eventId: 'e5' }, { userId: 'u1', eventId: 'e4' }] as { userId: string; eventId: string }[],

  reports: [
    { id: 'p1', eventId: 'e3', eventTitle: 'Đêm nhạc Acoustic Phố Cổ', reporterName: 'Trần Thị Bình', reason: 'Thông tin giá vé trên mô tả không khớp với giá thực tế tại quầy.', severity: 'medium', status: 'pending', createdAt: iso(now() - 1 * DAY) },
    { id: 'p2', eventId: 'e5', eventTitle: 'Triển lãm Nghệ thuật Số 2026', reporterName: 'Nguyễn Văn An', reason: 'Hình ảnh sự kiện sử dụng ảnh của người khác, chưa ghi nguồn.', severity: 'low', status: 'pending', createdAt: iso(now() - 2 * DAY) },
  ] as Report[],

  notifications: [
    { id: 'n1', userId: 'u1', title: 'Đăng ký thành công', body: 'Bạn đã đăng ký "Hội thảo AI và Tương lai việc làm". Mã vé: EVT-A1B2C3.', createdAt: iso(now() - 2 * DAY), read: false },
    { id: 'n2', userId: 'u1', title: 'Đăng ký thành công', body: 'Bạn đã đăng ký "Đêm nhạc Acoustic Phố Cổ". Mã vé: EVT-D4E5F6.', createdAt: iso(now() - 1 * DAY), read: true },
  ] as AppNotification[],

  broadcasts: [] as Broadcast[],

  logs: [
    { id: 'l1', text: 'Admin duyệt sự kiện "Hội thảo AI và Tương lai việc làm"', createdAt: iso(now() - 19 * DAY) },
    { id: 'l2', text: 'Người dùng Lê Văn Cường gửi yêu cầu trở thành Ban tổ chức', createdAt: iso(now() - 3 * DAY) },
    { id: 'l3', text: 'CLB Công nghệ Hà Nội gửi sự kiện "Hackathon 24 giờ" chờ duyệt', createdAt: iso(now() - 2 * DAY) },
  ] as ActivityLog[],
};

// ---------- helpers ----------

export function log(text: string) {
  db.logs.unshift({ id: uid('l'), text, createdAt: iso(now()) });
}

export function notify(userId: string, title: string, body: string) {
  db.notifications.unshift({ id: uid('n'), userId, title, body, createdAt: iso(now()), read: false });
}

export function computeStatus(e: EventRecord): EventStatus {
  if (e.status !== 'approved') return e.status;
  const t = now();
  if (t > new Date(e.endTime).getTime()) return 'ended';
  if (t >= new Date(e.startTime).getTime()) return 'ongoing';
  return 'approved';
}

export function toEventDto(e: EventRecord, viewerId?: string): EventItem {
  const regs = db.registrations.filter((r) => r.eventId === e.id && r.status === 'registered');
  const mine = viewerId ? regs.find((r) => r.userId === viewerId) : undefined;
  const { createdAt: _c, ...rest } = e;
  return {
    ...rest,
    status: computeStatus(e),
    categoryName: db.categories.find((c) => c.id === e.categoryId)?.name ?? 'Khác',
    organizerName: db.users.find((u) => u.id === e.organizerId)?.name ?? 'Không rõ',
    registeredCount: regs.length,
    checkedInCount: regs.filter((r) => r.checkedIn).length,
    myRegistration: mine
      ? { id: mine.id, code: mine.code, status: mine.status, checkedIn: mine.checkedIn }
      : null,
    isFavorite: viewerId ? db.favorites.some((f) => f.userId === viewerId && f.eventId === e.id) : false,
  };
}

/** Không bao giờ trả mật khẩu ra ngoài. */
export function publicUser(u: UserRecord): User {
  const { password: _p, ...rest } = u;
  return rest;
}
