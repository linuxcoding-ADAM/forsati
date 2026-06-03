'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ODEJ_DATA } from '@/lib/data';
import { getEventsByInstitution, type Event } from '@/lib/events';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { localize, type Lang, type RawInst } from '@/lib/localize';
import { MapPin, ArrowLeft, Phone, Mail, Navigation, Leaf } from 'lucide-react';
import { EventCard } from '@/components/EventCard';

export default function InstitutionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const lang = language as Lang;

  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Find institution locally
  const rawInst = ODEJ_DATA.institutions.find((i: any) => i.id === params.id) as unknown as RawInst;
  const inst = rawInst ? localize(rawInst, lang) : null;

  useEffect(() => {
    if (inst) {
      // Server-side filtered: fetches ONLY this institution's events
      // (where institutionId == …), not the whole collection.
      getEventsByInstitution(inst.id).then(instEvents => {
        setEvents(instEvents);
        setLoadingEvents(false);
      });
    }
  }, [inst]);

  if (!inst) return <div className="p-8 text-center text-red-400 flex items-center justify-center min-h-screen">{t('instDetail', 'notFound')}</div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Centered Container */}
      <div className="max-w-[800px] mx-auto">
        
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border/50 px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-bold text-white truncate text-xl">{t('instDetail', 'title')}</h1>
        </header>

        <main className="p-6 sm:p-8 flex flex-col gap-12">

          {/* Title Section (Centered Text) */}
          <div className="text-center flex flex-col items-center">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              <span className="inline-block px-4 py-1.5 bg-surface border border-border text-textMuted text-sm font-bold rounded-full uppercase tracking-wider">
                {inst.categoryName}
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary/10 text-primary text-sm font-bold rounded-full">
                <Leaf size={14} /> {t('eventDetail', 'ecoBadge')}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-4">{inst.name}</h1>
            <div className="flex items-center justify-center gap-2 text-textMuted text-lg">
              <MapPin size={20} className="text-primary" />
              {inst.commune}, Bejaia
            </div>
          </div>

          {/* Contact Actions (Large Buttons) */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-white text-center mb-2">{t('instDetail', 'getInTouch')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {inst.phone && (
                <a href={`tel:${inst.phone}`} className="flex items-center justify-center gap-2.5 bg-surface hover:bg-surface/80 border border-border text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all active:scale-[0.98]">
                  <Phone size={20} className="text-primary" /> {t('eventDetail', 'call')}
                </a>
              )}
              {inst.email && (
                <a href={`mailto:${inst.email}`} className="flex items-center justify-center gap-2.5 bg-surface hover:bg-surface/80 border border-border text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all active:scale-[0.98]">
                  <Mail size={20} className="text-primary" /> {t('eventDetail', 'email')}
                </a>
              )}
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(`${inst.name} ${inst.commune} Bejaia Algeria`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 bg-surface hover:bg-surface/80 border border-border text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all active:scale-[0.98]"
              >
                <Navigation size={20} className="text-primary" /> {t('instDetail', 'openLocation')}
              </a>
            </div>
            {/* Eco note */}
            <div className="flex items-center justify-center gap-2 text-sm text-primary/80 mt-1">
              <Leaf size={15} className="shrink-0" />
              <span>{t('instDetail', 'ecoNote')}</span>
            </div>
          </div>

          {/* Tags */}
          {inst.activityTags.length > 0 && (
            <div className="flex flex-col items-center text-center">
              <h3 className="text-sm font-bold text-textMuted uppercase tracking-wider mb-4">{t('instDetail', 'activities')}</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {inst.activityTags.map(tag => (
                  <span key={tag} className="px-4 py-2 bg-primary/10 text-primary text-sm font-bold rounded-full">
                    {t('interests', tag) || tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hosted Events Section */}
          <section className="pt-10 border-t border-border/50">
            <h2 className="text-2xl font-black text-white text-center mb-8">{t('instDetail', 'hostedEvents')}</h2>
            
            {loadingEvents ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {Array.from({ length: 2 }).map((_, i) => (
                   <div key={i} className="bg-surface/50 border border-border rounded-xl h-40 animate-pulse" />
                 ))}
              </div>
            ) : events.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {events.map(ev => (
                  <EventCard key={ev.id} event={ev} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-surface border border-border rounded-3xl">
                <p className="text-textMuted text-lg">{t('instDetail', 'noEvents')}</p>
              </div>
            )}
          </section>

        </main>
      </div>
    </div>
  );
}
