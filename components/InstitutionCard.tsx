import { MapPin, Phone, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { localize, type Lang, type RawInst } from '@/lib/localize';

export function InstitutionCard({ raw, reasons }: {
  raw: RawInst;
  reasons?: string[];
}) {
  const { t, language } = useLanguage();
  const lang = language as Lang;
  const inst = localize(raw, lang);

  return (
    <div className="bg-surface border border-border rounded-xl p-4 hover:border-primary/40 transition-colors flex flex-col h-full">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 mb-2">{inst.name}</h3>
          <span className="inline-block max-w-full truncate text-[10px] text-textMuted bg-background px-2 py-0.5 rounded-full border border-border">
            {inst.categoryName}
          </span>
        </div>
        {/* ODEJ Béjaïa official logo — pilot wilaya */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo_ODEJ.png"
          alt="ODEJ Béjaïa"
          title="ODEJ Béjaïa"
          className="w-9 h-9 rounded-full shrink-0 object-contain bg-white/5"
          onError={e => { e.currentTarget.style.display = 'none'; }}
        />
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-textMuted">
          <MapPin size={12} className="shrink-0 text-primary/70" />
          <span className="truncate">{inst.commune}</span>
        </div>

        {inst.phone && (
          <div className="flex items-center gap-1.5 text-xs text-textMuted">
            <Phone size={12} className="shrink-0 text-primary/70" />
            <span>{inst.phone}</span>
          </div>
        )}
      </div>

      {inst.activityTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {inst.activityTags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full">
              {t('interests', tag) || tag}
            </span>
          ))}
        </div>
      )}

      {/* Why recommended */}
      {reasons && reasons.length > 0 && (
        <div className="mb-4 pt-3 border-t border-border/40">
          <p className="text-[10px] text-textMuted mb-1.5">{t('feed', 'whyRecommended') || 'Why we recommend this:'}</p>
          <div className="flex flex-wrap gap-2">
            {reasons.map(r => (
              <span key={r} className="flex items-center gap-1 text-[10px] text-primary font-medium">
                <CheckCircle2 size={10} />
                {r === '__wilaya__' ? (t('feed', 'wilayaMatch') || 'Wilaya Match') : (t('interests', r) || r)}
              </span>
            ))}
          </div>
        </div>
      )}

      <Link 
        href={`/institutions/${raw.id}`}
        className="mt-auto w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium py-2 rounded-lg transition-colors border border-border"
      >
        {t('common', 'explore') || 'Explore'}
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
