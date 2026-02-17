import { NextResponse } from "next/server";
import { db } from "@/db";
import { snackSlots, snackSignups, users } from "@/db/schema";
import { eq, asc, and, gte } from "drizzle-orm";
import { getOrSyncUser, getMyGroupId } from "@/lib/auth";

function nextMeetingDates(count: number): string[] {
  const out: string[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 7);
  }
  return out;
}

export async function GET(request: Request) {
  const user = await getOrSyncUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const groupId = await getMyGroupId(request);
  if (!groupId) {
    return NextResponse.json({ slots: [] });
  }

  const today = new Date().toISOString().slice(0, 10);
  let slots = await db
    .select()
    .from(snackSlots)
    .where(eq(snackSlots.groupId, groupId))
    .orderBy(asc(snackSlots.slotDate));

  if (slots.length < 8) {
    const existingDates = new Set(slots.map((s) => s.slotDate));
    const toCreate = nextMeetingDates(12).filter(
      (d) => d >= today && !existingDates.has(d)
    );
    for (const slotDate of toCreate.slice(0, 8 - slots.length)) {
      await db.insert(snackSlots).values({ groupId, slotDate });
    }
    slots = await db
      .select()
      .from(snackSlots)
      .where(eq(snackSlots.groupId, groupId))
      .orderBy(asc(snackSlots.slotDate));
  }

  const slotsWithSignups = await Promise.all(
    slots.map(async (slot) => {
      const signups = await db
        .select({
          id: users.id,
          displayName: users.displayName,
          email: users.email,
        })
        .from(snackSignups)
        .innerJoin(users, eq(snackSignups.userId, users.id))
        .where(eq(snackSignups.slotId, slot.id));
      return {
        id: slot.id,
        slotDate: slot.slotDate,
        signups,
      };
    })
  );

  return NextResponse.json({
    slots: slotsWithSignups.filter((s) => s.slotDate >= today).slice(0, 8),
  });
}
