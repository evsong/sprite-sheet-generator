import { prisma } from "@/lib/prisma";

const DAILY_LIMITS: Record<string, number> = {
  FREE: 3,
  PRO: 50,
  TEAM: Infinity,
};

export async function checkQuota(userId: string, tier: string): Promise<{ allowed: boolean; used: number; limit: number }> {
  const limit = DAILY_LIMITS[tier] ?? DAILY_LIMITS.FREE;
  if (limit === Infinity) return { allowed: true, used: 0, limit };

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const usage = await prisma.aiUsage.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  const used = usage?.count ?? 0;
  return { allowed: used < limit, used, limit };
}

export async function recordUsage(userId: string, count: number = 1): Promise<void> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  await prisma.aiUsage.upsert({
    where: { userId_date: { userId, date: today } },
    update: { count: { increment: count } },
    create: { userId, date: today, count },
  });
}
