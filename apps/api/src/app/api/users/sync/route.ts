import { NextResponse } from "next/server";
import { getOrSyncUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getOrSyncUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
  });
}
