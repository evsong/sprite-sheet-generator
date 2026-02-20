import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();
  if (!newPassword || newPassword.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { passwordHash: true } });
  if (!user?.passwordHash) return NextResponse.json({ error: "No password set" }, { status: 400 });

  const valid = await compare(currentPassword, user.passwordHash);
  if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

  await prisma.user.update({ where: { email: session.user.email }, data: { passwordHash: await hash(newPassword, 10) } });
  return NextResponse.json({ ok: true });
}
