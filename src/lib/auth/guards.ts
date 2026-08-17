import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "./session";

/** Use in server components/pages that require a logged-in parent. */
export async function requireParent() {
  const user = await getCurrentUser();
  if (!user || user.role !== "PARENT" || !user.parentProfile) {
    redirect("/login?as=parent");
  }
  return { user, parentProfile: user.parentProfile! };
}

/** Use in server components/pages that require a logged-in student. */
export async function requireStudent() {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT" || !user.studentProfile) {
    redirect("/login?as=student");
  }
  return { user, studentProfile: user.studentProfile! };
}

/** Use in server components/pages that require a logged-in admin. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/admin/login");
  }
  return { user };
}
