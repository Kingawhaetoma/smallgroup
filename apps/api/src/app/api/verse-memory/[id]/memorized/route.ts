import { NextResponse } from "next/server";
import { db } from "@/db";
import { verseMemory, verseMemoryProgress } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getOrSyncUser, getMyGroupId } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getOrSyncUser(request);
  const groupId = await getMyGroupId(request);
  const { id: verseId } = await params;
  if (!user || !groupId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const verse = await db.query.verseMemory.findFirst({
    where: and(
      eq(verseMemory.id, verseId),
      eq(verseMemory.groupId, groupId)
    ),
  });
  if (!verse) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = await request.json();
  const { memorized } = body as { memorized?: boolean };
  const existing = await db.query.verseMemoryProgress.findFirst({
    where: and(
      eq(verseMemoryProgress.verseId, verseId),
      eq(verseMemoryProgress.userId, user.id)
    ),
  });
  if (existing) {
    await db
      .update(verseMemoryProgress)
      .set({ memorized: memorized === true, updatedAt: new Date() })
      .where(eq(verseMemoryProgress.id, existing.id));
  } else {
    await db.insert(verseMemoryProgress).values({
      verseId,
      userId: user.id,
      memorized: memorized === true,
    });
  }
  return NextResponse.json({ memorized: memorized === true });
}
