import { NextResponse } from "next/server";
import { db } from "@/db";
import { prayerRequests } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getOrSyncUser, getMyGroupId } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getOrSyncUser(request);
  const groupId = await getMyGroupId(request);
  const { id } = await params;
  if (!user || !groupId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const existing = await db.query.prayerRequests.findFirst({
    where: and(
      eq(prayerRequests.id, id),
      eq(prayerRequests.groupId, groupId)
    ),
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = await request.json();
  const { prayed } = body as { prayed?: boolean };
  const [updated] = await db
    .update(prayerRequests)
    .set({ prayed: prayed === true })
    .where(eq(prayerRequests.id, id))
    .returning();
  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getOrSyncUser(request);
  const groupId = await getMyGroupId(request);
  const { id } = await params;
  if (!user || !groupId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const existing = await db.query.prayerRequests.findFirst({
    where: and(
      eq(prayerRequests.id, id),
      eq(prayerRequests.groupId, groupId)
    ),
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.authorId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await db.delete(prayerRequests).where(eq(prayerRequests.id, id));
  return NextResponse.json({ ok: true });
}
