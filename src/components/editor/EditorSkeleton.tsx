export function EditorSkeleton() {
  return (
    <div className="h-screen w-screen bg-[#050505] text-white flex flex-col overflow-hidden animate-pulse">
      {/* Toolbar skeleton */}
      <div className="h-10 bg-[#0D0D0D] border-b border-[#1E1E1E] flex items-center px-3 gap-3">
        <div className="w-20 h-4 bg-[#1A1A1A] rounded" />
        <div className="w-px h-5 bg-[#1E1E1E]" />
        <div className="flex gap-1">
          <div className="w-7 h-7 bg-[#1A1A1A] rounded" />
          <div className="w-7 h-7 bg-[#1A1A1A] rounded" />
          <div className="w-7 h-7 bg-[#1A1A1A] rounded" />
        </div>
        <div className="flex-1" />
        <div className="w-16 h-7 bg-[#1A1A1A] rounded" />
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left sidebar skeleton */}
        <div className="w-56 bg-[#0D0D0D] border-r border-[#1E1E1E] p-3 space-y-2">
          <div className="w-16 h-3 bg-[#1A1A1A] rounded" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#1A1A1A] rounded" />
              <div className="flex-1 space-y-1">
                <div className="w-20 h-3 bg-[#1A1A1A] rounded" />
                <div className="w-12 h-2 bg-[#1A1A1A] rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Canvas skeleton */}
        <div className="flex-1 bg-[#080808] flex items-center justify-center">
          <div className="w-64 h-64 bg-[#0A0A0A] border border-[#1E1E1E] rounded" />
        </div>

        {/* Right sidebar skeleton */}
        <div className="w-56 bg-[#0D0D0D] border-l border-[#1E1E1E] p-3 space-y-4">
          <div className="w-16 h-3 bg-[#1A1A1A] rounded" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="w-20 h-2 bg-[#1A1A1A] rounded" />
              <div className="w-full h-7 bg-[#1A1A1A] rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Timeline skeleton */}
      <div className="h-24 bg-[#0D0D0D] border-t border-[#1E1E1E] p-3">
        <div className="w-16 h-3 bg-[#1A1A1A] rounded mb-2" />
        <div className="flex gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-14 h-14 bg-[#0A0A0A] border border-[#1E1E1E] rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
