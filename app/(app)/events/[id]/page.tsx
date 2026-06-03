'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getEvent, getUserRegistration, localizeEvent, type Event, type EventRegistration } from '@/lib/events';
import { useAuth } from '@/lib/contexts/AuthContext';
import { ODEJ_DATA } from '@/lib/data';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { localize, type Lang } from '@/lib/localize';
import { MapPin, Phone, Mail, ArrowLeft, Calendar, Users, Briefcase, Leaf, Recycle, Navigation, Ticket as TicketIcon, CheckCircle2 } from 'lucide-react';
import { DynamicRegistrationForm } from '@/components/DynamicRegistrationForm';
import { TicketModal } from '@/components/TicketModal';

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const lang = language as Lang;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [registration, setRegistration] = useState<EventRegistration | null>(null);
  const [showTicket, setShowTicket] = useState(false);

  const isRegistered = registration !== null;

  useEffect(() => {
    if (params.id) {
      getEvent(params.id as string).then(data => {
        setEvent(data);
        setLoading(false);
        if (user && data) {
          getUserRegistration(user.uid, data.id).then(reg => {
            if (reg) setRegistration(reg);
          });
        }
      });
    }
  }, [params.id, user]);

  if (loading) return <div className="p-8 text-center text-textMuted flex items-center justify-center min-h-screen">{t('eventDetail', 'loading')}</div>;
  if (!event) return <div className="p-8 text-center text-red-400 flex items-center justify-center min-h-screen">{t('eventDetail', 'notFound')}</div>;

  // Find host institution
  const rawInst = ODEJ_DATA.institutions.find((i: any) => i.id === event.institutionId);
  const inst = rawInst ? localize(rawInst as any, lang) : null;

  // Formatting dates
  const formattedDate = new Date(event.date).toLocaleDateString(
    lang === 'ar' ? 'ar-DZ' : lang === 'fr' ? 'fr-DZ' : 'en-US',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  );

  return (
    <div className="min-h-screen bg-background pb-44 md:pb-32">
      {/* Centered Container: 700px - 900px as per requirements */}
      <div className="max-w-[800px] mx-auto">
        
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border/50 px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-bold text-white truncate text-xl">{t('eventDetail', 'title')}</h1>
        </header>

        <main className="p-6 sm:p-8 flex flex-col gap-10">

          {/* Title Section (Centered Text) */}
          <div className="text-center flex flex-col items-center">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-bold rounded-full uppercase tracking-wider">
                {t('interests', event.category) || event.category}
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary/10 text-primary text-sm font-bold rounded-full">
                <Leaf size={14} /> {t('eventDetail', 'ecoBadge')}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-6">{localizeEvent(event, language).title}</h1>
            <p className="text-textMuted text-lg leading-relaxed max-w-2xl">{localizeEvent(event, language).description}</p>
          </div>

          {/* Info Grid — equal-height cards, aligned icon row + content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            {[
              { icon: Calendar, label: t('eventDetail', 'dateTime'), value: formattedDate },
              { icon: MapPin, label: t('eventDetail', 'location'), value: `${inst ? inst.name : 'Unknown'}, ${event.wilaya}` },
              { icon: Briefcase, label: t('eventDetail', 'organizer'), value: inst ? inst.name : 'Unknown Institution' },
              { icon: Users, label: t('eventDetail', 'seats'), value: event.availableSeats !== undefined ? String(event.availableSeats) : t('eventDetail', 'unlimited') },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="h-full bg-surface border border-border rounded-2xl p-5 flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0"><Icon size={24} /></div>
                <div className="flex flex-col justify-center flex-1">
                  <p className="text-xs text-textMuted uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-base font-semibold text-white break-words">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Eco note */}
          <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-2xl p-4 text-start">
            <Recycle size={22} className="text-primary shrink-0" />
            <p className="text-sm text-textMuted">
              <span className="text-white font-semibold">{t('eventDetail', 'paperlessTitle')}</span> {t('eventDetail', 'paperlessBody')} 🌱
            </p>
          </div>

          {/* Contact Actions (Large Buttons) */}
          <div className="flex flex-col gap-4 mt-4">
            <h3 className="text-xl font-bold text-white text-center mb-2">{t('eventDetail', 'needInfo')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {inst?.phone && (
                <a href={`tel:${inst.phone}`} className="flex items-center justify-center gap-2.5 bg-surface hover:bg-surface/80 border border-border text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all active:scale-[0.98]">
                  <Phone size={20} className="text-primary" /> {t('eventDetail', 'call')}
                </a>
              )}
              {inst?.email && (
                <a href={`mailto:${inst.email}`} className="flex items-center justify-center gap-2.5 bg-surface hover:bg-surface/80 border border-border text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all active:scale-[0.98]">
                  <Mail size={20} className="text-primary" /> {t('eventDetail', 'email')}
                </a>
              )}
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(`${inst?.name} ${event.wilaya} Algeria`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 bg-surface hover:bg-surface/80 border border-border text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all active:scale-[0.98]"
              >
                <Navigation size={20} className="text-primary" /> {t('eventDetail', 'locationBtn')}
              </a>
            </div>
          </div>
        </main>
      </div>

      {/* Sticky Bottom Bar for Join Event.
          On mobile it must sit ABOVE the BottomNav (which occupies bottom-16),
          otherwise the nav covers the Join / View-Ticket button. */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 sm:p-6 bg-background/95 backdrop-blur-xl border-t border-border z-40 flex justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
        <div className="max-w-[800px] w-full">
          {isRegistered ? (
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-green-400 font-semibold text-sm">
                <CheckCircle2 size={16} /> {t('eventDetail', 'confirmed')}
              </span>
              <button onClick={() => setShowTicket(true)} className="inline-flex items-center gap-2 bg-primary text-black font-bold text-base py-3 px-6 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all">
                <TicketIcon size={18} /> {t('ticket', 'view')}
              </button>
            </div>
          ) : event.status === 'open' ? (
            <button onClick={() => setShowForm(true)} className="w-full bg-primary text-black font-black text-xl py-5 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(var(--primary),0.3)] flex justify-center items-center gap-3">
              🎟 {t('eventDetail', 'join')}
            </button>
          ) : (
            <button disabled className="w-full bg-surface border border-border text-textMuted font-bold text-xl py-5 rounded-2xl cursor-not-allowed flex items-center justify-center gap-3">
              ⛔ {t('eventDetail', 'closed')}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <DynamicRegistrationForm
          event={event}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            // Re-read so we hold the stored ticket (for the "View Ticket" button).
            if (user) getUserRegistration(user.uid, event.id).then(reg => reg && setRegistration(reg));
          }}
        />
      )}

      {showTicket && registration && (
        <TicketModal registration={registration} event={event} onClose={() => setShowTicket(false)} />
      )}
    </div>
  );
}
