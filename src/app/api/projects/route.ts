import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

// GET /api/projects — list user's projects
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const tier = (session.user as unknown as Record<string, unknown>).tier as string ?? "FREE";
  if (tier === "FREE") {
    return NextResponse.json({ error: "Cloud storage requires PRO or TEAM" }, { status: 403 });
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { assets: true } } },
  });

  return NextResponse.json({
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      thumbnail: p.thumbnail,
      spriteCount: p._count.assets,
      updatedAt: p.updatedAt.toISOString(),
    })),
  });
}

// POST /api/projects — save a project
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const tier = (session.user as unknown as Record<string, unknown>).tier as string ?? "FREE";
  if (tier === "FREE") {
    return NextResponse.json({ error: "Cloud storage requires PRO or TEAM" }, { status: 403 });
  }

  const formData = await req.formData();
  const name = formData.get("name") as string;
  const config = formData.get("config") as string;
  const projectId = formData.get("projectId") as string | null;
  const thumbnailBlob = formData.get("thumbnail") as Blob | null;

  if (!name || !config) {
    return NextResponse.json({ error: "Name and config required" }, { status: 400 });
  }

  // Upload thumbnail if provided
  let thumbnailUrl: string | undefined;
  if (thumbnailBlob) {
    const result = await put(`projects/${session.user.id}/thumb-${Date.now()}.png`, thumbnailBlob, { access: "public" });
    thumbnailUrl = result.url;
  }

  // Upload sprite files
  const spriteFiles: { filename: string; url: string; metadata: string }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("sprite-") && value instanceof Blob) {
      const filename = key.replace("sprite-", "");
      const result = await put(`projects/${session.user.id}/${Date.now()}-${filename}`, value, { access: "public" });
      spriteFiles.push({ filename, url: result.url, metadata: formData.get(`meta-${filename}`) as string || "{}" });
    }
  }

  // Upsert project
  if (projectId) {
    // Update existing
    await prisma.projectAsset.deleteMany({ where: { projectId } });
    const project = await prisma.project.update({
      where: { id: projectId, userId: session.user.id },
      data: {
        name,
        config: JSON.parse(config),
        thumbnail: thumbnailUrl,
        assets: {
          create: spriteFiles.map((sf) => ({
            filename: sf.filename,
            storageUrl: sf.url,
            metadata: JSON.parse(sf.metadata),
          })),
        },
      },
    });
    return NextResponse.json({ id: project.id });
  } else {
    // Create new
    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        name,
        config: JSON.parse(config),
        thumbnail: thumbnailUrl,
        assets: {
          create: spriteFiles.map((sf) => ({
            filename: sf.filename,
            storageUrl: sf.url,
            metadata: JSON.parse(sf.metadata),
          })),
        },
      },
    });
    return NextResponse.json({ id: project.id });
  }
}
