import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, stripeCustomerId: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Cancel Stripe subscription if exists
  if (user.stripeCustomerId) {
    const stripe = getStripe();
    const subs = await stripe.subscriptions.list({ customer: user.stripeCustomerId, status: "active" });
    for (const sub of subs.data) {
      await stripe.subscriptions.cancel(sub.id);
    }
  }

  await prisma.user.delete({ where: { id: user.id } });
  return NextResponse.json({ ok: true });
}
