"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface ProjectSummary {
  id: string;
  name: string;
  thumbnail: string | null;
  spriteCount: number;
  updatedAt: string;
}

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const tier = (session?.user as Record<string, unknown> | undefined)?.tier as string ?? "FREE";
  const isPaid = tier === "PRO" || tier === "TEAM";

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && isPaid) fetchProjects();
    else setLoading(false);
  }, [status, isPaid, fetchProjects]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) setProjects((p) => p.filter((proj) => proj.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#1E1E1E]">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <rect x="2" y="2" width="12" height="12" rx="2" fill="#06B6D4" />
            <rect x="18" y="2" width="12" height="12" rx="2" fill="#F59E0B" />
            <rect x="2" y="18" width="12" height="12" rx="2" fill="#22C55E" />
            <rect x="18" y="18" width="12" height="12" rx="2" fill="#06B6D4" opacity="0.5" />
          </svg>
          <span className="font-[family-name:var(--font-display)] font-bold text-white">SpriteForge</span>
        </Link>
        <Link href="/editor" className="px-4 py-2 text-sm font-semibold text-black bg-[#22C55E] rounded-lg hover:brightness-110 transition-all duration-200 cursor-pointer">
          Open Editor
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-white mb-6">Your Projects</h1>

        {status === "unauthenticated" && (
          <div className="text-center py-16">
            <p className="text-[#666] text-sm mb-4">Sign in to access cloud projects</p>
            <Link href="/auth/signin" className="px-4 py-2 text-sm text-white bg-[#1A1A1A] border border-[#1E1E1E] rounded-lg hover:bg-[#222] transition-colors cursor-pointer">
              Sign in
            </Link>
          </div>
        )}

        {status === "authenticated" && !isPaid && (
          <div className="text-center py-16">
            <p className="text-[#666] text-sm mb-2">Cloud storage requires PRO or TEAM</p>
            <p className="text-[#444] text-xs font-[family-name:var(--font-mono)]">Use local .spriteforge files on the FREE tier</p>
          </div>
        )}

        {status === "authenticated" && isPaid && loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#0D0D0D] border border-[#1E1E1E] rounded-xl h-48 animate-pulse" />
            ))}
          </div>
        )}

        {status === "authenticated" && isPaid && !loading && projects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#666] text-sm mb-4">No projects yet</p>
            <Link href="/editor" className="px-4 py-2 text-sm text-black bg-[#06B6D4] rounded-lg hover:brightness-110 transition-all cursor-pointer">
              Create your first project
            </Link>
          </div>
        )}

        {status === "authenticated" && isPaid && !loading && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <div key={p.id} className="bg-[#0D0D0D] border border-[#1E1E1E] rounded-xl overflow-hidden group hover:border-[#333] transition-colors cursor-pointer">
                <Link href={`/editor?project=${p.id}`}>
                  <div className="h-32 bg-[#111] flex items-center justify-center">
                    {p.thumbnail ? (
                      <img src={p.thumbnail} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-[#333]">
                        <rect x="2" y="2" width="12" height="12" rx="2" fill="currentColor" />
                        <rect x="18" y="2" width="12" height="12" rx="2" fill="currentColor" />
                        <rect x="2" y="18" width="12" height="12" rx="2" fill="currentColor" />
                        <rect x="18" y="18" width="12" height="12" rx="2" fill="currentColor" />
                      </svg>
                    )}
                  </div>
                </Link>
                <div className="p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[12px] text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-[#666] font-[family-name:var(--font-mono)]">
                      {p.spriteCount} sprites · {new Date(p.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    disabled={deleting === p.id}
                    className="p-1.5 text-[#666] hover:text-red-400 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Delete project"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
