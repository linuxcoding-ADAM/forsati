import { MapPin, Calendar, ArrowRight } from 'lucide-react';
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

  return (
    <div className="bg-surface border border-border rounded-xl p-4 hover:border-primary/40 transition-colors flex flex-col h-full">
      <div className="mb-3">
        <h3 className="font-bold text-white text-base leading-tight mb-1">{title}</h3>
        <p className="text-xs text-textMuted">{instName}</p>
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

      <Link 
        href={`/events/${event.id}`}
        className="mt-auto w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-semibold py-2 rounded-lg transition-colors"
      >
        {t('common', 'explore')}
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
