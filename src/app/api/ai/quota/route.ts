import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTierFromSession, getLimits } from "@/lib/tier";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const tier = getTierFromSession(session as unknown as { user?: Record<string, unknown> });
  const limits = getLimits(tier);
  const limit = limits.aiGenerationsPerDay;

  // Today's usage
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const usage = await prisma.aiUsage.findUnique({
    where: { userId_date: { userId, date: today } },
  });
  const used = usage?.count ?? 0;

  // Next reset time (next midnight UTC)
  const resetsAt = new Date(today);
  resetsAt.setUTCDate(resetsAt.getUTCDate() + 1);

  // Last 7 days history
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);

  const records = await prisma.aiUsage.findMany({
    where: { userId, date: { gte: sevenDaysAgo, lte: today } },
    select: { date: true, count: true },
    orderBy: { date: "asc" },
  });

  // Fill missing dates with 0
  const recordMap = new Map(records.map((r) => [r.date.toISOString().slice(0, 10), r.count]));
  const history: { date: string; count: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setUTCDate(d.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    history.push({ date: key, count: recordMap.get(key) ?? 0 });
  }

  return NextResponse.json({ used, limit, tier, resetsAt: resetsAt.toISOString(), history });
}
