import { NextResponse } from "next/server";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireSyncedUser, getMyGroupId } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireSyncedUser(request);
  const groupId = await getMyGroupId(request);
  const { id } = await params;
  if (!groupId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const existing = await db.query.announcements.findFirst({
    where: and(
      eq(announcements.id, id),
      eq(announcements.groupId, groupId)
    ),
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { groupMembers } = await import("@/db/schema");
  const membership = await db.query.groupMembers.findFirst({
    where: eq(groupMembers.userId, user.id),
  });
  if (membership?.role !== "admin" && existing.authorId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await db.delete(announcements).where(eq(announcements.id, id));
  return NextResponse.json({ ok: true });
}
