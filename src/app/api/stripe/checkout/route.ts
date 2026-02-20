import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tier } = await req.json();
  const priceId = tier === "PRO" ? process.env.STRIPE_PRO_PRICE_ID : tier === "TEAM" ? process.env.STRIPE_TEAM_PRICE_ID : null;
  if (!priceId) return NextResponse.json({ error: "Invalid tier" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, stripeCustomerId: true } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

  const checkout = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/settings?upgraded=1`,
    cancel_url: `${baseUrl}/pricing`,
    customer: user.stripeCustomerId || undefined,
    customer_email: user.stripeCustomerId ? undefined : session.user.email,
    metadata: { userId: user.id, tier },
  });

  return NextResponse.json({ url: checkout.url });
}
