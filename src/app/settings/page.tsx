import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./SettingsClient";
import { getLimits, type TierName } from "@/lib/tier";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth/signin?callbackUrl=/settings");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true, avatar: true, tier: true, provider: true, passwordHash: true, stripeCustomerId: true, subscription: { select: { status: true, currentPeriodEnd: true } } },
  });
  if (!user) redirect("/auth/signin");

  // AI Usage data
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);

  const [todayUsage, historyRecords] = await Promise.all([
    prisma.aiUsage.findUnique({ where: { userId_date: { userId: user.id, date: today } } }),
    prisma.aiUsage.findMany({ where: { userId: user.id, date: { gte: sevenDaysAgo, lte: today } }, select: { date: true, count: true }, orderBy: { date: "asc" } }),
  ]);

  const limits = getLimits(user.tier as TierName);
  const used = todayUsage?.count ?? 0;
  const recordMap = new Map(historyRecords.map((r) => [r.date.toISOString().slice(0, 10), r.count]));
  const history: { date: string; count: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setUTCDate(d.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    history.push({ date: key, count: recordMap.get(key) ?? 0 });
  }

  const resetsAt = new Date(today);
  resetsAt.setUTCDate(resetsAt.getUTCDate() + 1);

  return <SettingsClient user={{ name: user.name ?? "", email: user.email, avatar: user.avatar ?? "", tier: user.tier, hasPassword: !!user.passwordHash, isOAuth: !!user.provider, hasStripe: !!user.stripeCustomerId, subscription: user.subscription ? { status: user.subscription.status, periodEnd: user.subscription.currentPeriodEnd.toISOString() } : null }} aiUsage={{ used, limit: limits.aiGenerationsPerDay, history, resetsAt: resetsAt.toISOString() }} />;
}
