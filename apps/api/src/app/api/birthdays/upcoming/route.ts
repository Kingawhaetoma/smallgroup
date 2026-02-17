import { NextResponse } from "next/server";
import { db } from "@/db";
import { groupMembers, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOrSyncUser, getMyGroupId } from "@/lib/auth";

function isUpcoming(month: number | null, day: number | null, withinDays: number): boolean {
  if (month == null || day == null) return false;
  const today = new Date();
  const thisYear = today.getFullYear();
  let cur = new Date(thisYear, month - 1, day);
  if (cur < today) cur = new Date(thisYear + 1, month - 1, day);
  const diff = Math.floor((cur.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  return diff >= 0 && diff <= withinDays;
}

export async function GET(request: Request) {
  const user = await getOrSyncUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const groupId = await getMyGroupId(request);
  if (!groupId) {
    return NextResponse.json({ birthdays: [] });
  }
  const { searchParams } = new URL(request.url);
  const within = Math.min(90, Math.max(1, parseInt(searchParams.get("within") ?? "30", 10) || 30));

  const members = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      birthdayMonth: users.birthdayMonth,
      birthdayDay: users.birthdayDay,
    })
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .where(eq(groupMembers.groupId, groupId));

  const birthdays = members
    .filter((m) => isUpcoming(m.birthdayMonth, m.birthdayDay, within))
    .map((m) => ({
      id: m.id,
      displayName: m.displayName,
      birthdayMonth: m.birthdayMonth,
      birthdayDay: m.birthdayDay,
    }))
    .sort((a, b) => {
      const ad = (a.birthdayMonth! - 1) * 31 + (a.birthdayDay ?? 0);
      const bd = (b.birthdayMonth! - 1) * 31 + (b.birthdayDay ?? 0);
      return ad - bd;
    });

  return NextResponse.json({ birthdays });
}
