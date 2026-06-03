'use client';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import type { EventRegistration, Event } from '@/lib/events';
import { X, CheckCircle2, Leaf, Ticket as TicketIcon } from 'lucide-react';

interface Props {
  registration: EventRegistration;
  event: Event;
  onClose: () => void;
}

export function TicketModal({ registration, event, onClose }: Props) {
  const { t } = useLanguage();

  const attendeeName = registration.answers?.name
    || [registration.answers?.first_name, registration.answers?.last_name].filter(Boolean).join(' ')
    || '—';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-border w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[94dvh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <TicketIcon size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-white">{t('ticket', 'title')}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-textMuted hover:text-white rounded-full hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col items-center gap-4 text-center">
          {/* Attended / Valid status */}
          {registration.attended ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/15 text-green-400 text-xs font-bold">
              <CheckCircle2 size={13} /> {t('ticket', 'attended')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
              <Leaf size={13} /> {t('ticket', 'valid')}
            </span>
          )}

          {/* QR — pure-SVG component (no canvas → no getContext crash) */}
          <div className="rounded-2xl bg-white p-3 shadow-lg">
            <QRCodeSVG
              value={registration.ticketId}
              size={220}
              level="M"
              marginSize={1}
              bgColor="#ffffff"
              fgColor="#0a0a0a"
            />
          </div>

          <p className="text-xs text-textMuted">{t('ticket', 'scanHint')}</p>

          {/* Details */}
          <div className="w-full mt-1 rounded-2xl bg-background border border-border/60 divide-y divide-border/40 text-start">
            <Row label={t('ticket', 'event')} value={event.title} />
            <Row label={t('ticket', 'attendee')} value={attendeeName} />
            <Row label={t('ticket', 'ticketId')} value={registration.ticketId} mono />
          </div>

          <p className="text-[11px] text-textMuted leading-relaxed">
            <Leaf size={11} className="inline text-primary" /> {t('ticket', 'ecoNote')}
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="text-[10px] text-textMuted uppercase tracking-wide shrink-0">{label}</span>
      <span className={`text-sm font-medium text-white text-end truncate ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  );
}
