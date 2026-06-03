'use client';

/**
 * ODEJ Béjaïa branding mark, pinned to the top corner of every in-app page.
 * Moved here out of the individual event/institution cards so the partner logo
 * shows once, consistently, instead of repeating on each card.
 *
 * Uses the logical `end` edge: in LTR (FR/EN) that's the top-RIGHT corner; in
 * RTL (AR) it flips to the top-left so it never sits on top of the page's
 * back button (which is always on the leading/start edge). pointer-events-none
 * means it can never intercept a tap meant for the content underneath.
 */
export function OdejCorner() {
  return (
    <div className="fixed top-2.5 end-2.5 z-50 pointer-events-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo_ODEJ.png"
        alt="ODEJ Béjaïa"
        title="ODEJ Béjaïa"
        className="w-9 h-9 rounded-full object-contain bg-white/5 ring-1 ring-border shadow-md"
        onError={e => { e.currentTarget.style.display = 'none'; }}
      />
    </div>
  );
}
