import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token, password } = await req.json();
  if (!token || !password || password.length < 6) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const hashed = createHash("sha256").update(token).digest("hex");
  const user = await prisma.user.findFirst({
    where: { passwordResetToken: hashed, passwordResetExpires: { gt: new Date() } },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "Token expired or invalid" }, { status: 400 });

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hash(password, 10), passwordResetToken: null, passwordResetExpires: null },
  });

  return NextResponse.json({ ok: true });
}
