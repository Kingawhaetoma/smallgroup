import { NextResponse } from "next/server";
import { db } from "@/db";
import { verseMemory, verseMemoryProgress } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getOrSyncUser, getMyGroupId, requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getOrSyncUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const groupId = await getMyGroupId(request);
  if (!groupId) {
    return NextResponse.json({ verses: [] });
  }
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const verses = await db
    .select()
    .from(verseMemory)
    .where(
      and(
        eq(verseMemory.groupId, groupId),
        eq(verseMemory.month, month),
        eq(verseMemory.year, year)
      )
    );
  const withProgress = await Promise.all(
    verses.map(async (v) => {
      const progress = await db.query.verseMemoryProgress.findFirst({
        where: and(
          eq(verseMemoryProgress.verseId, v.id),
          eq(verseMemoryProgress.userId, user.id)
        ),
      });
      return {
        id: v.id,
        verseReference: v.verseReference,
        verseSnippet: v.verseSnippet,
        month: v.month,
        year: v.year,
        memorized: progress?.memorized ?? false,
      };
    })
  );
  return NextResponse.json({ verses: withProgress });
}

export async function POST(request: Request) {
  let user;
  try {
    user = await requireAdmin(request);
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }
  const groupId = await getMyGroupId(request);
  if (!groupId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { verseReference, verseSnippet } = body as {
    verseReference?: string;
    verseSnippet?: string;
  };
  if (!verseReference || !verseReference.trim()) {
    return NextResponse.json(
      { error: "verseReference is required" },
      { status: 400 }
    );
  }
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const existing = await db.query.verseMemory.findFirst({
    where: and(
      eq(verseMemory.groupId, groupId),
      eq(verseMemory.month, month),
      eq(verseMemory.year, year)
    ),
  });
  if (existing) {
    const [updated] = await db
      .update(verseMemory)
      .set({
        verseReference: verseReference.trim(),
        verseSnippet: verseSnippet?.trim() ?? null,
      })
      .where(eq(verseMemory.id, existing.id))
      .returning();
    return NextResponse.json({ verse: updated });
  }
  const [created] = await db
    .insert(verseMemory)
    .values({
      groupId,
      verseReference: verseReference.trim(),
      verseSnippet: verseSnippet?.trim() ?? null,
      month,
      year,
    })
    .returning();
  return NextResponse.json({ verse: created });
}
