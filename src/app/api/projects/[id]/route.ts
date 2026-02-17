import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { del } from "@vercel/blob";

// GET /api/projects/[id] — load a project
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id, userId: session.user.id },
    include: { assets: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: project.id,
    name: project.name,
    config: project.config,
    thumbnail: project.thumbnail,
    assets: project.assets.map((a) => ({
      id: a.id,
      filename: a.filename,
      storageUrl: a.storageUrl,
      metadata: a.metadata,
    })),
  });
}

// DELETE /api/projects/[id] — delete a project and its assets
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id, userId: session.user.id },
    include: { assets: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Delete blobs
  const urls = project.assets.map((a) => a.storageUrl);
  if (project.thumbnail) urls.push(project.thumbnail);
  if (urls.length > 0) {
    await del(urls);
  }

  // Delete from database (cascade deletes assets)
  await prisma.project.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
