import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth/signin?callbackUrl=/settings");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { name: true, email: true, avatar: true, tier: true, provider: true, passwordHash: true, stripeCustomerId: true, subscription: { select: { status: true, currentPeriodEnd: true } } },
  });
  if (!user) redirect("/auth/signin");

  return <SettingsClient user={{ name: user.name ?? "", email: user.email, avatar: user.avatar ?? "", tier: user.tier, hasPassword: !!user.passwordHash, isOAuth: !!user.provider, hasStripe: !!user.stripeCustomerId, subscription: user.subscription ? { status: user.subscription.status, periodEnd: user.subscription.currentPeriodEnd.toISOString() } : null }} />;
}
