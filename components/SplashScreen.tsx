'use client';
import Image from 'next/image';

/**
 * Lightweight splash. Shown only for the brief window while auth state resolves.
 * Kept deliberately minimal (a quick fade-in, no slow pulse/bounce) so it reads
 * as an instant transition rather than a multi-second loading screen.
 */
export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center animate-fade-in">
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/logo.png"
          alt="Forsati"
          width={96}
          height={96}
          className="rounded-2xl shadow-2xl shadow-primary/20"
          priority
        />
        <h1
          className="text-2xl font-black text-white italic tracking-tighter"
          style={{ fontFamily: "'Sacrifice', 'Inter', system-ui, sans-serif" }}
        >
          Forsati
        </h1>
        {/* Thin eco-green progress sliver — subtle, not a spinner */}
        <div className="h-1 w-24 overflow-hidden rounded-full bg-surface">
          <div className="h-full w-1/2 rounded-full bg-primary animate-loading-slide" />
        </div>
      </div>
    </div>
  );
}
