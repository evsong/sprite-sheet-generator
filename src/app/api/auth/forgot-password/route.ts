import { prisma } from "@/lib/prisma";
import { randomUUID, createHash } from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();
  // Always return success to prevent email enumeration
  const ok = NextResponse.json({ ok: true });
  if (!email) return ok;

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, passwordHash: true } });
  if (!user?.passwordHash) return ok;

  const token = randomUUID();
  const hashed = createHash("sha256").update(token).digest("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken: hashed, passwordResetExpires: new Date(Date.now() + 3600_000) },
  });

  const resetUrl = `${process.env.AUTH_URL || process.env.NEXTAUTH_URL}/auth/new-password?token=${token}`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "SpriteForge <onboarding@resend.dev>",
      to: email,
      subject: "Reset your password — SpriteForge",
      html: `<p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    }),
  });

  return ok;
}
