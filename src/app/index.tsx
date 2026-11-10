import { useAuth } from "@/store/authStore";
import { Redirect } from "expo-router";

/** Khách xem sự kiện công khai ở khu Người tham gia; người đã đăng nhập vào đúng khu theo vai trò. */
export default function Index() {
  const user = useAuth((s) => s.user);
  return <Redirect href={(user ? `/${user.role}` : "/attendee") as any} />;
}
