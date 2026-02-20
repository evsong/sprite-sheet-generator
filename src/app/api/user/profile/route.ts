import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, avatar } = await req.json();
  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: { name: name ?? undefined, avatar: avatar ?? undefined },
    select: { id: true, name: true, avatar: true, email: true, tier: true },
  });
  return NextResponse.json(user);
}
