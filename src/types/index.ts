export type Role = 'attendee' | 'organizer' | 'admin';
export type OrganizerRequest = 'none' | 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  locked: boolean;
  organizerRequest: OrganizerRequest;
  orgName?: string;
  notifyReminder: boolean;
  notifyUpdates: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  active: boolean;
}

export type EventStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'ongoing'
  | 'ended'
  | 'hidden'
  | 'cancelled';

export interface MyRegistration {
  id: string;
  code: string;
  status: 'registered' | 'cancelled';
  checkedIn: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  image: string;
  categoryId: string;
  categoryName: string;
  location: string;
  latitude?: number;
  longitude?: number;
  startTime: string;
  endTime: string;
  price: number;
  capacity: number;
  audience: string;
  rules: string;
  contact: string;
  organizerId: string;
  organizerName: string;
  status: EventStatus;
  rejectReason?: string;
  registeredCount: number;
  checkedInCount: number;
  myRegistration?: MyRegistration | null;
  isFavorite?: boolean;
}

export type EventInput = Pick<
  EventItem,
  | 'title'
  | 'description'
  | 'image'
  | 'categoryId'
  | 'location'
  | 'startTime'
  | 'endTime'
  | 'price'
  | 'capacity'
  | 'audience'
  | 'rules'
  | 'contact'
>;

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  code: string;
  status: 'registered' | 'cancelled';
  checkedIn: boolean;
  checkedInAt?: string;
  createdAt: string;
}

export interface RegistrationDto extends Registration {
  event?: EventItem;
  userName?: string;
  userEmail?: string;
}

export type ReportSeverity = 'low' | 'medium' | 'high';
export type ReportStatus = 'pending' | 'accepted' | 'rejected';

export interface Report {
  id: string;
  eventId: string;
  eventTitle: string;
  reporterName: string;
  reason: string;
  severity: ReportSeverity;
  status: ReportStatus;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface Broadcast {
  id: string;
  title: string;
  body: string;
  target: 'all' | 'attendee' | 'organizer';
  recipients: number;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  text: string;
  createdAt: string;
}

export interface AdminStats {
  events: { total: number; pending: number; upcoming: number; ongoing: number; ended: number };
  users: { total: number; newThisWeek: number; organizers: number };
  registrations: number;
  pendingReports: number;
  topCategories: { name: string; count: number }[];
  recent: ActivityLog[];
}

export interface OrganizerStats {
  totalEvents: number;
  totalRegistrations: number;
  totalCheckedIn: number;
  rows: {
    id: string;
    title: string;
    status: EventStatus;
    registered: number;
    capacity: number;
    checkedIn: number;
  }[];
}

export interface CheckinResult {
  userName: string;
  eventTitle: string;
  code: string;
  checkedInAt: string;
}
