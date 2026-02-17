import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();

  if (!email || !password || password.length < 6) {
    return NextResponse.json({ error: "Email and password (min 6 chars) required" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  await prisma.user.create({
    data: { email, name: name || null, passwordHash: await hash(password, 10), provider: "credentials" },
  });

  return NextResponse.json({ ok: true });
}
