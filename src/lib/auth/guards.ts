import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser, DEFAULT_CURRICULUM_SLUG, DEFAULT_YEAR_GROUP_LABEL } from "./session";

/** Use in server components/pages that require a logged-in parent. Also
 * resolves the family's national curriculum (see prisma/schema.prisma's
 * Curriculum model) — every query that looks up a Topic needs this
 * alongside yearGroup, since the same subject/strand/yearGroup combination
 * can exist under more than one curriculum. `yearGroupLabel` ("Year" /
 * "Grade") is for display only — use `lib/curriculum/label.ts`'s
 * `formatYearGroup` to apply it. */
export async function requireParent() {
  const user = await getCurrentUser();
  if (!user || user.role !== "PARENT" || !user.parentProfile) {
    redirect("/login?as=parent");
  }
  const parentProfile = user.parentProfile!;
  const curriculumSlug = parentProfile.family.curriculum?.slug ?? DEFAULT_CURRICULUM_SLUG;
  const yearGroupLabel = parentProfile.family.curriculum?.yearGroupLabel ?? DEFAULT_YEAR_GROUP_LABEL;
  return { user, parentProfile, curriculumSlug, yearGroupLabel };
}

/** Use in server components/pages that require a logged-in student. */
export async function requireStudent() {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT" || !user.studentProfile) {
    redirect("/login?as=student");
  }
  const studentProfile = user.studentProfile!;
  const curriculumSlug = studentProfile.parent.family.curriculum?.slug ?? DEFAULT_CURRICULUM_SLUG;
  const yearGroupLabel = studentProfile.parent.family.curriculum?.yearGroupLabel ?? DEFAULT_YEAR_GROUP_LABEL;
  return { user, studentProfile, curriculumSlug, yearGroupLabel };
}

/** Use in server components/pages that require a logged-in admin. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/admin/login");
  }
  return { user };
}
