'use client';
import { useState, useMemo } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { ODEJ_DATA } from '@/lib/data';
import type { RawInst, Lang } from '@/lib/localize';
import { localize } from '@/lib/localize';
import { Search } from 'lucide-react';
import { InstitutionCard } from '@/components/InstitutionCard';

const RAW_INSTS = ODEJ_DATA.institutions as unknown as RawInst[];

const CATEGORIES = [
  { id: 'all',              key: 'filterAll'       },
  { id: 'youth_house',     key: 'filterYouthHouse' },
  { id: 'sports_complex',  key: 'filterSports'     },
  { id: 'youth_hostel',    key: 'filterHostel'     },
  { id: 'science_center',  key: 'filterScience'    },
  { id: 'multiservice_hall', key: 'filterHall'     },
  { id: 'youth_camp',      key: 'filterCamp'       },
];

export default function DiscoverPage() {
  const { t, language, isRtl } = useLanguage();
  const lang = language as Lang;
  const [query,          setQuery]          = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Client-side, zero-API filtering + localization in a single pass
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();

    return RAW_INSTS
      .filter(inst => {
        // Category filter
        if (activeCategory !== 'all' && inst.category !== activeCategory) return false;
        // Text filter — search raw fields so Arabic queries hit name_ar
        if (!q) return true;
        const blob = [
          inst.name_ar, inst.name_fr,
          inst.commune_ar, inst.commune_fr,
          inst.wilaya, inst.category,
          inst.category_name_ar, inst.category_name_fr,
          ...(inst.activity_tags ?? []),
        ].filter(Boolean).join(' ').toLowerCase();
        return blob.includes(q);
      })
      .slice(0, 30); // cap DOM size for performance
  }, [query, activeCategory]);

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      {/* Header & Search */}
      <div className="px-5 py-4 border-b border-border bg-background sticky top-0 z-10 shrink-0">
        <h1 className="text-xl font-bold text-white mb-4">{t('discover', 'title')}</h1>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('discover', 'searchPlaceholder')}
            className={`
              w-full bg-surface border border-border rounded-xl py-3 text-sm text-white
              outline-none focus:border-primary transition-colors
              ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'}
            `}
          />
          <Search size={18} className={`absolute top-3.5 text-textMuted ${isRtl ? 'right-4' : 'left-4'}`} />
        </div>

        {/* Category tabs */}
        <div className="flex overflow-x-auto gap-2 mt-4 pb-1 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium border transition-colors
                ${activeCategory === cat.id
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'border-border bg-surface text-textMuted hover:text-white'}
              `}
            >
              {t('discover', cat.key)}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">
        <p className="text-xs text-textMuted mb-4">
          {results.length} {results.length === 1 ? t('discover', 'institution') : t('discover', 'institutions')}
        </p>

        {results.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-8 text-center text-textMuted text-sm">
            {t('common', 'noResults')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-5">
          {results.map(raw => (
            <InstitutionCard key={raw.id} raw={raw} />
          ))}
        </div>
        )}
      </div>
    </div>
  );
}