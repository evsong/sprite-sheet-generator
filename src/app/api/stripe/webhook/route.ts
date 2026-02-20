import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const tier = session.metadata?.tier as "PRO" | "TEAM";
      if (!userId || !tier) break;

      const subId = session.subscription as string;
      const sub = await stripe.subscriptions.retrieve(subId) as unknown as { current_period_end: number };
      const periodEnd = new Date(sub.current_period_end * 1000);

      await prisma.user.update({ where: { id: userId }, data: { tier, stripeCustomerId: session.customer as string } });
      await prisma.subscription.upsert({
        where: { userId },
        create: { userId, stripeSubscriptionId: subId, tier, status: "ACTIVE", currentPeriodEnd: periodEnd },
        update: { stripeSubscriptionId: subId, tier, status: "ACTIVE", currentPeriodEnd: periodEnd },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const dbSub = await prisma.subscription.findUnique({ where: { stripeSubscriptionId: sub.id } });
      if (dbSub) {
        await prisma.subscription.update({ where: { id: dbSub.id }, data: { status: "CANCELED" } });
        await prisma.user.update({ where: { id: dbSub.userId }, data: { tier: "FREE" } });
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as unknown as { subscription: string };
      if (invoice.subscription) {
        await prisma.subscription.updateMany({ where: { stripeSubscriptionId: invoice.subscription }, data: { status: "PAST_DUE" } });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
