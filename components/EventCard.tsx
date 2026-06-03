'use client';
import { MapPin, Calendar, ArrowRight, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { localize, type Lang } from '@/lib/localize';
import { ODEJ_DATA } from '@/lib/data';
import { localizeEvent, type Event } from '@/lib/events';

export function EventCard({ event }: { event: Event }) {
  const { t, language } = useLanguage();
  const lang = language as Lang;

  const { title } = localizeEvent(event, language);

  // Find hosting institution
  const rawInst = ODEJ_DATA.institutions.find((i: any) => i.id === event.institutionId);
  const instName = rawInst ? localize(rawInst as any, lang).name : event.institutionId;

  // Format date safely
  let formattedDate = 'TBD';
  try {
    if (event.date) {
      formattedDate = new Date(event.date).toLocaleDateString(
        lang === 'ar' ? 'ar-DZ' : lang === 'fr' ? 'fr-DZ' : 'en-US',
        { day: 'numeric', month: 'short', year: 'numeric' }
      );
    }
  } catch { /* ignore invalid dates */ }

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/events/${event.id}` : '';
    // The shared message always credits the ODEJ platform.
    const text = `${title} — ${event.wilaya}\n${t('common', 'shareText')}\n${url}`;
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title, text, url });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        alert(t('common', 'linkCopied'));
      }
    } catch { /* user cancelled the share sheet */ }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-4 hover:border-primary/40 transition-colors flex flex-col h-full">
      <div className="mb-3">
        <div className="min-w-0">
          <h3 className="font-bold text-white text-base leading-tight mb-1">{title}</h3>
          <p className="text-xs text-textMuted truncate">{instName}</p>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-textMuted">
          <MapPin size={12} className="shrink-0 text-primary/70" />
          <span className="truncate">{event.wilaya}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-textMuted">
          <Calendar size={12} className="shrink-0 text-primary/70" />
          <span>{formattedDate}</span>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2">
        <Link
          href={`/events/${event.id}`}
          className="flex-1 flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-semibold py-2 rounded-lg transition-colors"
        >
          {t('common', 'explore')}
          <ArrowRight size={14} />
        </Link>
        <button
          onClick={handleShare}
          title={t('common', 'share')}
          aria-label={t('common', 'share')}
          className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg border border-border text-textMuted hover:text-primary hover:border-primary/40 transition-colors"
        >
          <Share2 size={15} />
        </button>
      </div>
    </div>
  );
}
