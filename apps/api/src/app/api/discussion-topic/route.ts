import { NextResponse } from "next/server";
import { db } from "@/db";
import { discussionTopics } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getOrSyncUser, getMyGroupId, requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getOrSyncUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const groupId = await getMyGroupId(request);
  if (!groupId) {
    return NextResponse.json({ topic: null });
  }
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const topic = await db.query.discussionTopics.findFirst({
    where: and(
      eq(discussionTopics.groupId, groupId),
      eq(discussionTopics.month, month),
      eq(discussionTopics.year, year)
    ),
  });
  return NextResponse.json({ topic });
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
  const {
    title,
    description,
    bibleReference,
    bibleText,
    month,
    year,
  } = body as {
    title?: string;
    description?: string;
    bibleReference?: string;
    bibleText?: string;
    month?: number;
    year?: number;
  };
  if (!title) {
    return NextResponse.json(
      { error: "title is required" },
      { status: 400 }
    );
  }
  const now = new Date();
  const m = month ?? now.getMonth() + 1;
  const y = year ?? now.getFullYear();

  const existing = await db.query.discussionTopics.findFirst({
    where: and(
      eq(discussionTopics.groupId, groupId),
      eq(discussionTopics.month, m),
      eq(discussionTopics.year, y)
    ),
  });

  if (existing) {
    const [updated] = await db
      .update(discussionTopics)
      .set({
        title,
        description: description ?? null,
        bibleReference: bibleReference ?? null,
        bibleText: bibleText ?? null,
        updatedAt: new Date(),
      })
      .where(eq(discussionTopics.id, existing.id))
      .returning();
    return NextResponse.json({ topic: updated });
  }

  const [created] = await db
    .insert(discussionTopics)
    .values({
      groupId,
      title,
      description: description ?? null,
      bibleReference: bibleReference ?? null,
      bibleText: bibleText ?? null,
      month: m,
      year: y,
    })
    .returning();
  return NextResponse.json({ topic: created });
}
